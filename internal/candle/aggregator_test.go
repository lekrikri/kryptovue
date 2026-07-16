package candle

import (
	"testing"
	"time"

	"github.com/lekrikri/kryptovue/internal/model"
)

func trade(sym string, price, qty float64, ts time.Time) model.Trade {
	return model.Trade{Symbol: sym, Price: price, Qty: qty, TsMs: ts.UnixMilli(), Source: "test"}
}

var t0 = time.Date(2026, 7, 16, 10, 0, 0, 0, time.UTC)

func TestOHLCVWithinSingleBucket(t *testing.T) {
	a := New(time.Minute)

	if c := a.Add(trade("btcusdt", 100, 1, t0)); c != nil {
		t.Fatalf("pas de bougie attendue au premier trade, reçu %+v", c)
	}
	a.Add(trade("btcusdt", 110, 2, t0.Add(10*time.Second)))
	a.Add(trade("btcusdt", 90, 3, t0.Add(20*time.Second)))
	a.Add(trade("btcusdt", 105, 4, t0.Add(30*time.Second)))

	snap := a.Snapshot()
	if len(snap) != 1 {
		t.Fatalf("1 bougie en cours attendue, reçu %d", len(snap))
	}
	c := snap[0]
	if c.Open != 100 || c.High != 110 || c.Low != 90 || c.Close != 105 {
		t.Errorf("OHLC incorrect: %+v", c)
	}
	if c.Volume != 10 {
		t.Errorf("volume attendu 10, reçu %v", c.Volume)
	}
	if c.TradeCount != 4 {
		t.Errorf("trade_count attendu 4, reçu %d", c.TradeCount)
	}
	if !c.Start.Equal(t0) {
		t.Errorf("bucket_start attendu %v, reçu %v", t0, c.Start)
	}
}

func TestBucketRotationEmitsCompletedCandle(t *testing.T) {
	a := New(time.Minute)
	a.Add(trade("btcusdt", 100, 1, t0))
	a.Add(trade("btcusdt", 120, 1, t0.Add(59*time.Second)))

	done := a.Add(trade("btcusdt", 130, 2, t0.Add(61*time.Second)))
	if done == nil {
		t.Fatal("bougie terminée attendue à la rotation du bucket")
	}
	if done.Open != 100 || done.Close != 120 || done.High != 120 {
		t.Errorf("bougie terminée incorrecte: %+v", done)
	}

	snap := a.Snapshot()
	if len(snap) != 1 || snap[0].Open != 130 || snap[0].TradeCount != 1 {
		t.Errorf("nouvelle bougie incorrecte: %+v", snap)
	}
	if !snap[0].Start.Equal(t0.Add(time.Minute)) {
		t.Errorf("nouveau bucket attendu %v, reçu %v", t0.Add(time.Minute), snap[0].Start)
	}
}

func TestSymbolsAreIndependent(t *testing.T) {
	a := New(time.Minute)
	a.Add(trade("btcusdt", 100, 1, t0))
	a.Add(trade("ethusdt", 10, 5, t0))

	if done := a.Add(trade("btcusdt", 101, 1, t0.Add(2*time.Minute))); done == nil {
		t.Fatal("rotation btcusdt attendue")
	}
	// ethusdt ne doit pas avoir tourné.
	for _, c := range a.Snapshot() {
		if c.Symbol == "ethusdt" && !c.Start.Equal(t0) {
			t.Errorf("bucket ethusdt ne devait pas tourner: %+v", c)
		}
	}
}

func TestLateTradeMergedIntoCurrentCandle(t *testing.T) {
	a := New(time.Minute)
	a.Add(trade("btcusdt", 100, 1, t0.Add(30*time.Second)))
	// Trade en retard (bucket précédent) : fusionné sans casser le close.
	if done := a.Add(trade("btcusdt", 80, 1, t0.Add(-10*time.Second))); done != nil {
		t.Fatalf("un trade en retard ne doit pas émettre de bougie, reçu %+v", done)
	}
	c := a.Snapshot()[0]
	if c.Low != 80 {
		t.Errorf("low attendu 80 (fusion du trade en retard), reçu %v", c.Low)
	}
	if c.Close != 100 {
		t.Errorf("close ne doit pas être modifié par un trade en retard, reçu %v", c.Close)
	}
}
