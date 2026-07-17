package analytics

import (
	"fmt"
	"math"

	"github.com/lekrikri/kryptovue/internal/model"
)

// AnomalyThreshold : seuil (en σ) au-delà duquel un mouvement est jugé anormal.
const AnomalyThreshold = 3.0

// Compute assemble tous les indicateurs à partir d'une série de bougies
// (ordre chronologique). Purement descriptif.
func Compute(symbol string, candles []model.Candle) model.Indicators {
	closes := make([]float64, len(candles))
	volumes := make([]float64, len(candles))
	for i, c := range candles {
		closes[i] = c.Close
		volumes[i] = c.Volume
	}

	macd, sig, hist := MACD(closes)
	rsi := RSI(closes, 14)
	volZ := ZScore(volumes)

	// z-score du dernier rendement vs les rendements précédents.
	returns := make([]float64, 0, len(closes))
	for i := 1; i < len(closes); i++ {
		if closes[i-1] != 0 {
			returns = append(returns, (closes[i]-closes[i-1])/closes[i-1])
		}
	}
	retZ := ZScore(returns)

	ind := model.Indicators{
		Symbol:     symbol,
		RSI:        round(rsi, 2),
		RSIZone:    RSIZone(rsi),
		MACD:       round(macd, 6),
		MACDSignal: round(sig, 6),
		MACDHist:   round(hist, 6),
		SMA20:      round(SMA(closes, 20), 6),
		EMA50:      round(EMA(closes, 50), 6),
		Volatility: round(Volatility(closes), 3),
		VolumeZ:    round(volZ, 2),
		ReturnZ:    round(retZ, 2),
		Points:     len(candles),
	}

	if math.Abs(volZ) >= AnomalyThreshold {
		ind.Anomaly = true
		ind.AnomalyNote = fmt.Sprintf("volume anormal : %.1fσ au-dessus de la normale", volZ)
	} else if math.Abs(retZ) >= AnomalyThreshold {
		ind.Anomaly = true
		dir := "hausse"
		if retZ < 0 {
			dir = "baisse"
		}
		ind.AnomalyNote = fmt.Sprintf("mouvement de prix anormal (%s) : %.1fσ", dir, math.Abs(retZ))
	}
	return ind
}

func round(v float64, digits int) float64 {
	p := math.Pow(10, float64(digits))
	return math.Round(v*p) / p
}
