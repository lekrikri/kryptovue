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

// Indicators regroupe les indicateurs techniques et l'anomalie d'un symbole.
type Indicators struct {
	Symbol      string  `json:"symbol"`
	RSI         float64 `json:"rsi"`
	RSIZone     string  `json:"rsi_zone"`
	MACD        float64 `json:"macd"`
	MACDSignal  float64 `json:"macd_signal"`
	MACDHist    float64 `json:"macd_hist"`
	SMA20       float64 `json:"sma20"`
	EMA50       float64 `json:"ema50"`
	Volatility  float64 `json:"volatility"`    // % (écart-type des rendements)
	VolumeZ     float64 `json:"volume_zscore"` // σ sur le dernier volume
	ReturnZ     float64 `json:"return_zscore"` // σ sur le dernier rendement
	Anomaly     bool    `json:"anomaly"`       // |z| >= seuil sur volume ou rendement
	AnomalyNote string  `json:"anomaly_note"`  // description FR si anomalie
	Points      int     `json:"points"`        // nb de bougies utilisées
}

// NewsImpact décrit la réaction du prix autour d'une actualité (descriptif, passé).
type NewsImpact struct {
	News      News     `json:"news"`
	HasImpact bool     `json:"has_impact"`
	PriceAt   *float64 `json:"price_at,omitempty"`   // prix à l'heure de publication
	PriceNext *float64 `json:"price_next,omitempty"` // prix ~1 h plus tard
	ImpactPct *float64 `json:"impact_pct,omitempty"` // variation en %
}

// NoiseSignal croise l'activité médiatique FR et la volatilité prix (indice FOMO).
type NoiseSignal struct {
	Symbol     string  `json:"symbol"`
	NewsCount  int     `json:"news_count"` // actus mentionnant le symbole (24 h)
	Volatility float64 `json:"volatility"` // % sur la dernière heure
	Buzz       int     `json:"buzz"`       // niveau de bruit médiatique 0-100
	Move       int     `json:"move"`       // niveau de mouvement prix 0-100
	Label      string  `json:"label"`      // BRUIT | SIGNAL | ACTIF | CALME
}
