package analytics

import (
	"math"
	"testing"
)

func approx(a, b, eps float64) bool { return math.Abs(a-b) < eps }

func TestSMA(t *testing.T) {
	if got := SMA([]float64{1, 2, 3, 4, 5}, 3); !approx(got, 4, 1e-9) {
		t.Errorf("SMA attendu 4, reçu %v", got)
	}
	if got := SMA([]float64{2, 4}, 10); !approx(got, 3, 1e-9) {
		t.Errorf("SMA période > len : attendu 3, reçu %v", got)
	}
}

func TestEMAConverges(t *testing.T) {
	// Sur une série constante, l'EMA vaut la constante.
	vals := make([]float64, 50)
	for i := range vals {
		vals[i] = 10
	}
	if got := EMA(vals, 12); !approx(got, 10, 1e-6) {
		t.Errorf("EMA série constante : attendu 10, reçu %v", got)
	}
}

func TestRSIExtremes(t *testing.T) {
	// Série strictement croissante → RSI = 100 (aucune perte).
	up := make([]float64, 30)
	for i := range up {
		up[i] = float64(i + 1)
	}
	if got := RSI(up, 14); !approx(got, 100, 1e-6) {
		t.Errorf("RSI hausse pure : attendu 100, reçu %v", got)
	}
	// Série strictement décroissante → RSI = 0.
	down := make([]float64, 30)
	for i := range down {
		down[i] = float64(30 - i)
	}
	if got := RSI(down, 14); !approx(got, 0, 1e-6) {
		t.Errorf("RSI baisse pure : attendu 0, reçu %v", got)
	}
}

func TestRSIInsufficient(t *testing.T) {
	if got := RSI([]float64{1, 2, 3}, 14); got != 50 {
		t.Errorf("RSI données insuffisantes : attendu 50, reçu %v", got)
	}
}

func TestMACDSignConsistency(t *testing.T) {
	// Tendance haussière → ligne MACD positive.
	up := make([]float64, 60)
	for i := range up {
		up[i] = float64(i)
	}
	macd, _, _ := MACD(up)
	if macd <= 0 {
		t.Errorf("MACD sur tendance haussière devrait être > 0, reçu %v", macd)
	}
}

func TestVolatilityZeroOnConstant(t *testing.T) {
	if got := Volatility([]float64{5, 5, 5, 5}); got != 0 {
		t.Errorf("volatilité série constante : attendu 0, reçu %v", got)
	}
}

func TestZScoreDetectsSpike(t *testing.T) {
	vals := []float64{10, 11, 9, 10, 11, 9, 10, 100} // pic final
	if z := ZScore(vals); z < 3 {
		t.Errorf("z-score sur pic : attendu >= 3, reçu %v", z)
	}
	stable := []float64{10, 11, 9, 10, 11, 9, 10}
	if z := ZScore(stable); math.Abs(z) > 2 {
		t.Errorf("z-score série stable : attendu faible, reçu %v", z)
	}
}

func TestRSIZone(t *testing.T) {
	if RSIZone(75) != "surachat" || RSIZone(25) != "survente" || RSIZone(50) != "neutre" {
		t.Error("RSIZone mal calibré")
	}
}
