// Package alert définit les règles d'alerte et leur évaluation (pure, testable).
package alert

import (
	"fmt"
	"math"
	"time"
)

// Types de règles supportées.
const (
	TypePriceAbove  = "price_above"
	TypePriceBelow  = "price_below"
	TypeChangeAbove = "change_above" // |variation 24h| >= seuil
	TypeAnomaly     = "anomaly"
)

// Rule est une règle d'alerte persistée.
type Rule struct {
	ID            int64      `json:"id"`
	TargetType    string     `json:"target_type"`
	TargetAddr    string     `json:"target_addr"`
	Symbol        string     `json:"symbol"`
	RuleType      string     `json:"rule_type"`
	Threshold     float64    `json:"threshold"`
	Active        bool       `json:"active"`
	LastTriggered *time.Time `json:"last_triggered,omitempty"`
}

// Snapshot est l'état marché courant d'un symbole, fourni à l'évaluation.
type Snapshot struct {
	Price       float64
	Change24h   float64
	Anomaly     bool
	AnomalyNote string
}

// ValidType indique si un type de règle est supporté.
func ValidType(t string) bool {
	switch t {
	case TypePriceAbove, TypePriceBelow, TypeChangeAbove, TypeAnomaly:
		return true
	}
	return false
}

// Evaluate retourne (déclenchée, message). Purement fonctionnel.
func Evaluate(r Rule, s Snapshot, ticker string) (bool, string) {
	switch r.RuleType {
	case TypePriceAbove:
		if s.Price >= r.Threshold {
			return true, fmt.Sprintf("%s a franchi %.2f $ (prix %.2f $)", ticker, r.Threshold, s.Price)
		}
	case TypePriceBelow:
		if s.Price > 0 && s.Price <= r.Threshold {
			return true, fmt.Sprintf("%s est repassé sous %.2f $ (prix %.2f $)", ticker, r.Threshold, s.Price)
		}
	case TypeChangeAbove:
		if math.Abs(s.Change24h) >= r.Threshold {
			return true, fmt.Sprintf("%s : variation 24h de %.2f %% (seuil %.2f %%)", ticker, s.Change24h, r.Threshold)
		}
	case TypeAnomaly:
		if s.Anomaly {
			return true, fmt.Sprintf("%s : %s", ticker, s.AnomalyNote)
		}
	}
	return false, ""
}

// ShouldNotify applique un anti-spam : pas deux notifications en moins de `cooldown`.
func ShouldNotify(last *time.Time, now time.Time, cooldown time.Duration) bool {
	return last == nil || now.Sub(*last) >= cooldown
}
