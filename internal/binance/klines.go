package binance

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/lekrikri/kryptovue/internal/model"
)

const klinesURL = "https://api.binance.com/api/v3/klines"

// FetchKlines récupère les bougies historiques 1m d'un symbole entre start et end.
// Binance renvoie au plus 1000 bougies par requête (pas de clé API nécessaire).
func FetchKlines(ctx context.Context, symbol string, start, end time.Time, limit int) ([]model.Candle, error) {
	if limit <= 0 || limit > 1000 {
		limit = 1000
	}
	url := fmt.Sprintf("%s?symbol=%s&interval=1m&startTime=%d&endTime=%d&limit=%d",
		klinesURL, strings.ToUpper(symbol), start.UnixMilli(), end.UnixMilli(), limit)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("binance klines %s → %d", symbol, resp.StatusCode)
	}

	var raw [][]any
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	out := make([]model.Candle, 0, len(raw))
	for _, k := range raw {
		if len(k) < 9 {
			continue
		}
		openMs, _ := k[0].(float64)
		open := parseFloat(k[1])
		high := parseFloat(k[2])
		low := parseFloat(k[3])
		clse := parseFloat(k[4])
		vol := parseFloat(k[5])
		trades := 0
		if n, ok := k[8].(float64); ok {
			trades = int(n)
		}
		out = append(out, model.Candle{
			Symbol:     strings.ToLower(symbol),
			Start:      time.UnixMilli(int64(openMs)).UTC(),
			Open:       open,
			High:       high,
			Low:        low,
			Close:      clse,
			Volume:     vol,
			TradeCount: trades,
		})
	}
	return out, nil
}

func parseFloat(v any) float64 {
	if s, ok := v.(string); ok {
		f, _ := strconv.ParseFloat(s, 64)
		return f
	}
	if f, ok := v.(float64); ok {
		return f
	}
	return 0
}
