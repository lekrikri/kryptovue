// Package store est la couche d'accès TimescaleDB (pgx, SQL explicite).
package store

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/lekrikri/kryptovue/internal/model"
)

// candleSources mappe les intervalles exposés par l'API vers les tables/vues.
// Liste blanche : empêche toute injection via le paramètre interval.
var candleSources = map[string]string{
	"1m": "candles_1m",
	"1h": "candles_1h",
	"1d": "candles_1d",
}

type Store struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, databaseURL string) (*Store, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("pgxpool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("ping: %w", err)
	}
	return &Store{pool: pool}, nil
}

func (s *Store) Close() { s.pool.Close() }

func (s *Store) Ping(ctx context.Context) error { return s.pool.Ping(ctx) }

// UpsertCandle insère ou met à jour une bougie 1m (idempotent).
func (s *Store) UpsertCandle(ctx context.Context, c model.Candle) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO candles_1m (symbol, bucket_start, open, high, low, close, volume, trade_count)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (symbol, bucket_start) DO UPDATE SET
			open = EXCLUDED.open,
			high = EXCLUDED.high,
			low = EXCLUDED.low,
			close = EXCLUDED.close,
			volume = EXCLUDED.volume,
			trade_count = EXCLUDED.trade_count`,
		c.Symbol, c.Start, c.Open, c.High, c.Low, c.Close, c.Volume, c.TradeCount)
	return err
}

// UpsertLatestPrice met à jour le dernier prix connu d'un symbole.
func (s *Store) UpsertLatestPrice(ctx context.Context, symbol string, price float64, at time.Time) error {
	_, err := s.pool.Exec(ctx, `
		INSERT INTO latest_prices (symbol, price, updated_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (symbol) DO UPDATE SET
			price = EXCLUDED.price,
			updated_at = EXCLUDED.updated_at`,
		symbol, price, at)
	return err
}

// LatestPrices retourne le dernier prix de chaque symbole.
func (s *Store) LatestPrices(ctx context.Context) ([]model.PriceRow, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT symbol, price, updated_at FROM latest_prices ORDER BY symbol`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.PriceRow
	for rows.Next() {
		var p model.PriceRow
		if err := rows.Scan(&p.Symbol, &p.Price, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// Candles retourne les `limit` dernières bougies d'un symbole pour un
// intervalle donné (1m, 1h, 1d), triées chronologiquement.
func (s *Store) Candles(ctx context.Context, symbol, interval string, limit int) ([]model.Candle, error) {
	source, ok := candleSources[interval]
	if !ok {
		return nil, fmt.Errorf("intervalle non supporté: %q", interval)
	}
	if limit <= 0 || limit > 5000 {
		limit = 500
	}
	// source vient d'une liste blanche : interpolation sûre.
	query := fmt.Sprintf(`
		SELECT symbol, bucket_start, open, high, low, close, volume, trade_count
		FROM (
			SELECT * FROM %s WHERE symbol = $1 ORDER BY bucket_start DESC LIMIT $2
		) sub ORDER BY bucket_start ASC`, source)

	rows, err := s.pool.Query(ctx, query, symbol, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Candle
	for rows.Next() {
		var c model.Candle
		if err := rows.Scan(&c.Symbol, &c.Start, &c.Open, &c.High, &c.Low,
			&c.Close, &c.Volume, &c.TradeCount); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func scanNews(rows interface {
	Next() bool
	Scan(...any) error
	Err() error
}) ([]model.News, error) {
	var out []model.News
	for rows.Next() {
		var n model.News
		if err := rows.Scan(&n.ID, &n.Source, &n.Title, &n.URL, &n.Summary,
			&n.PublishedAt, &n.Coins, &n.Score, &n.Label); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}

const newsCols = `id, source, title, url, summary, published_at, coins, sentiment_score, sentiment_label`

// RecentNews retourne les dernières actualités, tous symboles confondus.
func (s *Store) RecentNews(ctx context.Context, limit int) ([]model.News, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}
	rows, err := s.pool.Query(ctx,
		`SELECT `+newsCols+` FROM news ORDER BY published_at DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanNews(rows)
}

// NewsBySymbol retourne les actualités mentionnant un symbole.
func (s *Store) NewsBySymbol(ctx context.Context, symbol string, limit int) ([]model.News, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	rows, err := s.pool.Query(ctx,
		`SELECT `+newsCols+` FROM news WHERE $1 = ANY(coins)
		 ORDER BY published_at DESC LIMIT $2`, symbol, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanNews(rows)
}

// LatestBrief retourne le dernier résumé de marché généré (ok=false si aucun).
func (s *Store) LatestBrief(ctx context.Context) (model.Brief, bool, error) {
	var b model.Brief
	err := s.pool.QueryRow(ctx,
		`SELECT content, model, created_at FROM market_brief ORDER BY created_at DESC LIMIT 1`).
		Scan(&b.Content, &b.Model, &b.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return b, false, nil
		}
		return b, false, err
	}
	return b, true, nil
}

// CloseNear retourne la clôture 1m la plus proche (± tolérance) d'un instant t.
func (s *Store) CloseNear(ctx context.Context, symbol string, t time.Time, tolMinutes int) (float64, bool, error) {
	var c float64
	err := s.pool.QueryRow(ctx, `
		SELECT close FROM candles_1m
		WHERE symbol = $1 AND bucket_start BETWEEN $2 - make_interval(mins => $3)
		                                       AND $2 + make_interval(mins => $3)
		ORDER BY abs(extract(epoch FROM bucket_start - $2))
		LIMIT 1`, symbol, t, tolMinutes).Scan(&c)
	if err != nil {
		if err == pgx.ErrNoRows {
			return 0, false, nil
		}
		return 0, false, err
	}
	return c, true, nil
}

// NewsCountByCoin retourne le nombre d'actus par symbole sur les dernières `hours`.
func (s *Store) NewsCountByCoin(ctx context.Context, hours int) (map[string]int, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT coin, count(*) FROM news, unnest(coins) AS coin
		WHERE published_at > now() - make_interval(hours => $1)
		GROUP BY coin`, hours)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make(map[string]int)
	for rows.Next() {
		var coin string
		var n int
		if err := rows.Scan(&coin, &n); err != nil {
			return nil, err
		}
		out[coin] = n
	}
	return out, rows.Err()
}

// SentimentBySymbol agrège le sentiment moyen par symbole sur 48 h glissantes.
func (s *Store) SentimentBySymbol(ctx context.Context) ([]model.Sentiment, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT coin, AVG(sentiment_score) AS score, COUNT(*) AS n
		FROM news, unnest(coins) AS coin
		WHERE published_at > now() - interval '48 hours'
		GROUP BY coin
		ORDER BY coin`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.Sentiment
	for rows.Next() {
		var s model.Sentiment
		if err := rows.Scan(&s.Symbol, &s.Score, &s.Count); err != nil {
			return nil, err
		}
		switch {
		case s.Score >= 0.15:
			s.Label = "positive"
		case s.Score <= -0.15:
			s.Label = "negative"
		default:
			s.Label = "neutral"
		}
		out = append(out, s)
	}
	return out, rows.Err()
}
