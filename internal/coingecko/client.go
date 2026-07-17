// Package coingecko interroge l'API publique CoinGecko (market cap, dominance).
package coingecko

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

const baseURL = "https://api.coingecko.com/api/v3"

// GeckoID mappe le symbole Binance vers l'identifiant CoinGecko.
var GeckoID = map[string]string{
	"btcusdt":  "bitcoin",
	"ethusdt":  "ethereum",
	"solusdt":  "solana",
	"xrpusdt":  "ripple",
	"adausdt":  "cardano",
	"dogeusdt": "dogecoin",
	"dotusdt":  "polkadot",
	"linkusdt": "chainlink",
	"avaxusdt": "avalanche-2",
	"ltcusdt":  "litecoin",
}

type Client struct {
	http *http.Client
}

func New() *Client {
	return &Client{http: &http.Client{Timeout: 20 * time.Second}}
}

func (c *Client) get(ctx context.Context, path string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("coingecko %s → %d", path, resp.StatusCode)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

// Global : capitalisation totale et dominance BTC.
type Global struct {
	TotalMarketCap  float64
	BTCDominance    float64
	MarketCapChange float64
}

func (c *Client) FetchGlobal(ctx context.Context) (Global, error) {
	var body struct {
		Data struct {
			TotalMarketCap           map[string]float64 `json:"total_market_cap"`
			MarketCapPercentage      map[string]float64 `json:"market_cap_percentage"`
			MarketCapChangePct24hUsd float64            `json:"market_cap_change_percentage_24h_usd"`
		} `json:"data"`
	}
	if err := c.get(ctx, "/global", &body); err != nil {
		return Global{}, err
	}
	return Global{
		TotalMarketCap:  body.Data.TotalMarketCap["usd"],
		BTCDominance:    body.Data.MarketCapPercentage["btc"],
		MarketCapChange: body.Data.MarketCapChangePct24hUsd,
	}, nil
}

// CoinMarket : métadonnées d'un actif.
type CoinMarket struct {
	Symbol    string // symbole Binance (ex btcusdt)
	MarketCap float64
	Volume24h float64
	Change24h float64
	PriceUSD  float64
}

// FetchMarkets récupère les métadonnées pour les symboles Binance donnés.
func (c *Client) FetchMarkets(ctx context.Context, symbols []string) ([]CoinMarket, error) {
	ids := make([]string, 0, len(symbols))
	idToSym := make(map[string]string)
	for _, s := range symbols {
		if id, ok := GeckoID[s]; ok {
			ids = append(ids, id)
			idToSym[id] = s
		}
	}
	if len(ids) == 0 {
		return nil, nil
	}
	var body []struct {
		ID           string  `json:"id"`
		MarketCap    float64 `json:"market_cap"`
		TotalVolume  float64 `json:"total_volume"`
		ChangePct24h float64 `json:"price_change_percentage_24h"`
		CurrentPrice float64 `json:"current_price"`
	}
	path := "/coins/markets?vs_currency=usd&ids=" + strings.Join(ids, ",")
	if err := c.get(ctx, path, &body); err != nil {
		return nil, err
	}
	out := make([]CoinMarket, 0, len(body))
	for _, m := range body {
		out = append(out, CoinMarket{
			Symbol:    idToSym[m.ID],
			MarketCap: m.MarketCap,
			Volume24h: m.TotalVolume,
			Change24h: m.ChangePct24h,
			PriceUSD:  m.CurrentPrice,
		})
	}
	return out, nil
}
