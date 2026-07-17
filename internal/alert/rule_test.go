package alert

import (
	"testing"
	"time"
)

func TestPriceAbove(t *testing.T) {
	r := Rule{RuleType: TypePriceAbove, Threshold: 60000}
	if ok, _ := Evaluate(r, Snapshot{Price: 61000}, "BTC"); !ok {
		t.Error("devrait déclencher au-dessus du seuil")
	}
	if ok, _ := Evaluate(r, Snapshot{Price: 59000}, "BTC"); ok {
		t.Error("ne devrait pas déclencher sous le seuil")
	}
}

func TestPriceBelow(t *testing.T) {
	r := Rule{RuleType: TypePriceBelow, Threshold: 60000}
	if ok, _ := Evaluate(r, Snapshot{Price: 59000}, "BTC"); !ok {
		t.Error("devrait déclencher sous le seuil")
	}
	if ok, _ := Evaluate(r, Snapshot{Price: 0}, "BTC"); ok {
		t.Error("prix 0 (inconnu) ne doit pas déclencher price_below")
	}
}

func TestChangeAboveAbsolute(t *testing.T) {
	r := Rule{RuleType: TypeChangeAbove, Threshold: 5}
	if ok, _ := Evaluate(r, Snapshot{Change24h: -6}, "ETH"); !ok {
		t.Error("une baisse de 6% doit déclencher un seuil de 5% (valeur absolue)")
	}
	if ok, _ := Evaluate(r, Snapshot{Change24h: 3}, "ETH"); ok {
		t.Error("3% ne doit pas déclencher un seuil de 5%")
	}
}

func TestAnomaly(t *testing.T) {
	r := Rule{RuleType: TypeAnomaly}
	if ok, msg := Evaluate(r, Snapshot{Anomaly: true, AnomalyNote: "volume 4σ"}, "SOL"); !ok || msg == "" {
		t.Error("anomalie active doit déclencher avec message")
	}
	if ok, _ := Evaluate(r, Snapshot{Anomaly: false}, "SOL"); ok {
		t.Error("pas d'anomalie → pas de déclenchement")
	}
}

func TestShouldNotifyCooldown(t *testing.T) {
	now := time.Now()
	recent := now.Add(-10 * time.Minute)
	old := now.Add(-2 * time.Hour)
	if ShouldNotify(&recent, now, time.Hour) {
		t.Error("ne doit pas re-notifier dans le cooldown")
	}
	if !ShouldNotify(&old, now, time.Hour) {
		t.Error("doit notifier après le cooldown")
	}
	if !ShouldNotify(nil, now, time.Hour) {
		t.Error("jamais notifié → doit notifier")
	}
}

func TestValidType(t *testing.T) {
	if !ValidType(TypeAnomaly) || ValidType("bogus") {
		t.Error("ValidType incorrect")
	}
}
