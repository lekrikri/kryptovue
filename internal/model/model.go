// Package model définit les types partagés entre les services KryptoVue.
package model

import "time"

// Trade est un échange individuel reçu de Binance, publié sur crypto.trades.
type Trade struct {
	Symbol string  `json:"symbol"` // ex: "btcusdt"
	Price  float64 `json:"price"`
	Qty    float64 `json:"qty"`
	TsMs   int64   `json:"ts_ms"` // timestamp du trade côté exchange (ms epoch)
	Source string  `json:"source"`
}

// Time retourne le timestamp du trade en time.Time UTC.
func (t Trade) Time() time.Time {
	return time.UnixMilli(t.TsMs).UTC()
}

// Candle est une bougie OHLCV agrégée sur un intervalle.
type Candle struct {
	Symbol     string    `json:"symbol"`
	Start      time.Time `json:"bucket_start"`
	Open       float64   `json:"open"`
	High       float64   `json:"high"`
	Low        float64   `json:"low"`
	Close      float64   `json:"close"`
	Volume     float64   `json:"volume"`
	TradeCount int       `json:"trade_count"`
}

// PriceRow est le dernier prix connu d'un symbole.
type PriceRow struct {
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	UpdatedAt time.Time `json:"updated_at"`
}

// News est un article crypto FR analysé par l'ai-worker.
type News struct {
	ID          string    `json:"id"`
	Source      string    `json:"source"`
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	Summary     string    `json:"summary"`
	PublishedAt time.Time `json:"published_at"`
	Coins       []string  `json:"coins"`
	Score       float64   `json:"sentiment_score"`
	Label       string    `json:"sentiment_label"`
}

// Sentiment est l'agrégat de sentiment récent d'un symbole.
type Sentiment struct {
	Symbol string  `json:"symbol"`
	Score  float64 `json:"score"`
	Label  string  `json:"label"`
	Count  int     `json:"count"`
}

// Brief est le résumé de marché généré par le LLM.
type Brief struct {
	Content   string    `json:"content"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
}
