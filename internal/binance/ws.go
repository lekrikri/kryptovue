// Package binance fournit un client WebSocket pour les combined trade streams.
package binance

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"

	"github.com/lekrikri/kryptovue/internal/model"
)

const baseURL = "wss://stream.binance.com:9443/stream?streams="

// combinedMsg est l'enveloppe des combined streams Binance.
type combinedMsg struct {
	Stream string     `json:"stream"`
	Data   tradeEvent `json:"data"`
}

// Tous les champs du payload sont déclarés explicitement : le matching JSON de
// Go est insensible à la casse en fallback, donc sans champ dédié, "E" (event
// time, number) serait absorbé par le tag "e" (event type, string) → erreur.
type tradeEvent struct {
	EventType string `json:"e"`
	EventTime int64  `json:"E"`
	Symbol    string `json:"s"`
	TradeID   int64  `json:"t"`
	Price     string `json:"p"`
	Qty       string `json:"q"`
	TradeTime int64  `json:"T"`
	IsMaker   bool   `json:"m"`
}

// StreamURL construit l'URL combined streams pour une liste de symboles.
func StreamURL(symbols []string) string {
	streams := make([]string, len(symbols))
	for i, s := range symbols {
		streams[i] = strings.ToLower(strings.TrimSpace(s)) + "@trade"
	}
	return baseURL + strings.Join(streams, "/")
}

// ParseTrade convertit un message combined stream brut en model.Trade.
func ParseTrade(raw []byte) (model.Trade, error) {
	var msg combinedMsg
	if err := json.Unmarshal(raw, &msg); err != nil {
		return model.Trade{}, fmt.Errorf("unmarshal: %w", err)
	}
	if msg.Data.EventType != "trade" {
		return model.Trade{}, fmt.Errorf("event type inattendu: %q", msg.Data.EventType)
	}
	price, err := strconv.ParseFloat(msg.Data.Price, 64)
	if err != nil {
		return model.Trade{}, fmt.Errorf("prix invalide %q: %w", msg.Data.Price, err)
	}
	qty, err := strconv.ParseFloat(msg.Data.Qty, 64)
	if err != nil {
		return model.Trade{}, fmt.Errorf("quantité invalide %q: %w", msg.Data.Qty, err)
	}
	return model.Trade{
		Symbol: strings.ToLower(msg.Data.Symbol),
		Price:  price,
		Qty:    qty,
		TsMs:   msg.Data.TradeTime,
		Source: "binance",
	}, nil
}

// Stream se connecte aux trade streams et pousse chaque trade dans out.
// Reconnexion automatique avec backoff exponentiel (Binance coupe à 24 h).
// Bloque jusqu'à annulation du contexte.
func Stream(ctx context.Context, symbols []string, out chan<- model.Trade) {
	url := StreamURL(symbols)
	backoff := time.Second

	for {
		if ctx.Err() != nil {
			return
		}
		conn, _, err := websocket.DefaultDialer.DialContext(ctx, url, nil)
		if err != nil {
			slog.Error("connexion Binance échouée", "err", err, "retry_in", backoff)
			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				return
			}
			if backoff < time.Minute {
				backoff *= 2
			}
			continue
		}
		slog.Info("connecté à Binance", "streams", len(symbols))
		backoff = time.Second

		// Ferme la connexion si le contexte est annulé pendant la lecture.
		go func() {
			<-ctx.Done()
			_ = conn.Close()
		}()

		for {
			_, raw, err := conn.ReadMessage()
			if err != nil {
				if ctx.Err() != nil {
					return
				}
				slog.Warn("lecture WS interrompue, reconnexion", "err", err)
				_ = conn.Close()
				break
			}
			trade, err := ParseTrade(raw)
			if err != nil {
				slog.Debug("message ignoré", "err", err)
				continue
			}
			select {
			case out <- trade:
			case <-ctx.Done():
				_ = conn.Close()
				return
			}
		}
	}
}
