// Package analytics fournit des indicateurs techniques et une détection
// d'anomalies purement descriptifs (aucune prédiction de prix).
// Les fonctions opèrent sur des séries de float64 pour rester testables.
package analytics

import "math"

func mean(xs []float64) float64 {
	if len(xs) == 0 {
		return 0
	}
	var s float64
	for _, x := range xs {
		s += x
	}
	return s / float64(len(xs))
}

func stdDev(xs []float64) float64 {
	if len(xs) < 2 {
		return 0
	}
	m := mean(xs)
	var s float64
	for _, x := range xs {
		s += (x - m) * (x - m)
	}
	return math.Sqrt(s / float64(len(xs)-1))
}

// SMA : moyenne mobile simple sur les `period` dernières valeurs.
func SMA(values []float64, period int) float64 {
	n := len(values)
	if n == 0 {
		return 0
	}
	if period > n {
		period = n
	}
	return mean(values[n-period:])
}

// emaSeries : série complète de moyenne mobile exponentielle.
func emaSeries(values []float64, period int) []float64 {
	out := make([]float64, len(values))
	if len(values) == 0 {
		return out
	}
	k := 2.0 / (float64(period) + 1)
	out[0] = values[0]
	for i := 1; i < len(values); i++ {
		out[i] = values[i]*k + out[i-1]*(1-k)
	}
	return out
}

// EMA : dernière valeur de la moyenne mobile exponentielle.
func EMA(values []float64, period int) float64 {
	s := emaSeries(values, period)
	if len(s) == 0 {
		return 0
	}
	return s[len(s)-1]
}

// RSI (Relative Strength Index), lissage de Wilder. Retourne 50 si insuffisant.
func RSI(closes []float64, period int) float64 {
	if len(closes) <= period || period <= 0 {
		return 50
	}
	var gain, loss float64
	for i := 1; i <= period; i++ {
		ch := closes[i] - closes[i-1]
		if ch >= 0 {
			gain += ch
		} else {
			loss -= ch
		}
	}
	avgGain := gain / float64(period)
	avgLoss := loss / float64(period)
	for i := period + 1; i < len(closes); i++ {
		ch := closes[i] - closes[i-1]
		g, l := 0.0, 0.0
		if ch >= 0 {
			g = ch
		} else {
			l = -ch
		}
		avgGain = (avgGain*float64(period-1) + g) / float64(period)
		avgLoss = (avgLoss*float64(period-1) + l) / float64(period)
	}
	if avgLoss == 0 {
		return 100
	}
	rs := avgGain / avgLoss
	return 100 - 100/(1+rs)
}

// MACD (12, 26, 9) : ligne MACD, ligne de signal, histogramme (dernières valeurs).
func MACD(closes []float64) (macd, signal, histogram float64) {
	if len(closes) == 0 {
		return 0, 0, 0
	}
	e12 := emaSeries(closes, 12)
	e26 := emaSeries(closes, 26)
	line := make([]float64, len(closes))
	for i := range closes {
		line[i] = e12[i] - e26[i]
	}
	sig := emaSeries(line, 9)
	n := len(closes) - 1
	return line[n], sig[n], line[n] - sig[n]
}

// Volatility : écart-type des rendements en pourcentage.
func Volatility(closes []float64) float64 {
	if len(closes) < 2 {
		return 0
	}
	rets := make([]float64, 0, len(closes)-1)
	for i := 1; i < len(closes); i++ {
		if closes[i-1] != 0 {
			rets = append(rets, (closes[i]-closes[i-1])/closes[i-1])
		}
	}
	return stdDev(rets) * 100
}

// ZScore : écart de la dernière valeur à la distribution des précédentes, en σ.
func ZScore(values []float64) float64 {
	n := len(values)
	if n < 3 {
		return 0
	}
	hist := values[:n-1]
	m := mean(hist)
	sd := stdDev(hist)
	if sd == 0 {
		return 0
	}
	return (values[n-1] - m) / sd
}

// RSIZone traduit le RSI en libellé descriptif (pédagogique, non prescriptif).
func RSIZone(rsi float64) string {
	switch {
	case rsi >= 70:
		return "surachat"
	case rsi <= 30:
		return "survente"
	default:
		return "neutre"
	}
}
