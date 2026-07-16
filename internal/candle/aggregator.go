// Package candle agrège des trades en bougies OHLCV par intervalle.
package candle

import (
	"time"

	"github.com/lekrikri/kryptovue/internal/model"
)

// Aggregator maintient une bougie en cours par symbole et émet la bougie
// terminée quand un trade appartient à un bucket plus récent.
// Non thread-safe : à utiliser depuis une seule goroutine (le consumer).
type Aggregator struct {
	interval time.Duration
	current  map[string]*model.Candle
}

func New(interval time.Duration) *Aggregator {
	return &Aggregator{
		interval: interval,
		current:  make(map[string]*model.Candle),
	}
}

// bucketStart arrondit t au début de son bucket.
func (a *Aggregator) bucketStart(t time.Time) time.Time {
	return t.Truncate(a.interval)
}

// Add intègre un trade et retourne la bougie terminée si le trade ouvre un
// nouveau bucket pour ce symbole (nil sinon).
// Les trades plus vieux que la bougie en cours sont fusionnés dedans (best effort)
// pour ne pas perdre de volume en cas de léger désordre.
func (a *Aggregator) Add(t model.Trade) *model.Candle {
	start := a.bucketStart(t.Time())
	cur, ok := a.current[t.Symbol]

	if !ok {
		a.current[t.Symbol] = newCandle(t, start)
		return nil
	}

	if start.After(cur.Start) {
		done := *cur
		a.current[t.Symbol] = newCandle(t, start)
		return &done
	}

	// Même bucket (ou trade en retard) : mise à jour de la bougie en cours.
	if t.Price > cur.High {
		cur.High = t.Price
	}
	if t.Price < cur.Low {
		cur.Low = t.Price
	}
	if !start.Before(cur.Start) {
		cur.Close = t.Price
	}
	cur.Volume += t.Qty
	cur.TradeCount++
	return nil
}

// Snapshot retourne une copie des bougies en cours (flush périodique live).
func (a *Aggregator) Snapshot() []model.Candle {
	out := make([]model.Candle, 0, len(a.current))
	for _, c := range a.current {
		out = append(out, *c)
	}
	return out
}

func newCandle(t model.Trade, start time.Time) *model.Candle {
	return &model.Candle{
		Symbol:     t.Symbol,
		Start:      start,
		Open:       t.Price,
		High:       t.Price,
		Low:        t.Price,
		Close:      t.Price,
		Volume:     t.Qty,
		TradeCount: 1,
	}
}
