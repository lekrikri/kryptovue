package binance

import "testing"

// Payload réel capturé sur le combined stream Binance (2026-07-16).
// Test de régression : la casse mixte des clés ("e"/"E", "t"/"T") piège le
// matching JSON case-insensitive de Go si les champs ne sont pas tous déclarés.
const realPayload = `{"stream":"btcusdt@trade","data":{"e":"trade","E":1784213910202,` +
	`"s":"BTCUSDT","t":6511036449,"p":"64522.19000000","q":"0.00775000",` +
	`"T":1784213910202,"m":false,"M":true}}`

func TestParseTradeRealPayload(t *testing.T) {
	tr, err := ParseTrade([]byte(realPayload))
	if err != nil {
		t.Fatalf("ParseTrade: %v", err)
	}
	if tr.Symbol != "btcusdt" {
		t.Errorf("symbol attendu btcusdt, reçu %q", tr.Symbol)
	}
	if tr.Price != 64522.19 {
		t.Errorf("prix attendu 64522.19, reçu %v", tr.Price)
	}
	if tr.Qty != 0.00775 {
		t.Errorf("qty attendue 0.00775, reçue %v", tr.Qty)
	}
	if tr.TsMs != 1784213910202 {
		t.Errorf("ts attendu 1784213910202, reçu %d", tr.TsMs)
	}
}

func TestParseTradeRejectsOtherEvents(t *testing.T) {
	payload := `{"stream":"btcusdt@kline_1m","data":{"e":"kline","E":1,"s":"BTCUSDT"}}`
	if _, err := ParseTrade([]byte(payload)); err == nil {
		t.Fatal("les événements non-trade doivent être rejetés")
	}
}

func TestStreamURL(t *testing.T) {
	got := StreamURL([]string{"BTCUSDT", " ethusdt "})
	want := baseURL + "btcusdt@trade/ethusdt@trade"
	if got != want {
		t.Errorf("URL attendue %q, reçue %q", want, got)
	}
}
