// Package notify délivre les notifications d'alerte (Telegram, repli log).
package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"
)

// Notifier envoie un message à une cible.
type Notifier interface {
	Send(ctx context.Context, targetType, targetAddr, text string) error
}

// New retourne un notifier Telegram si TELEGRAM_BOT_TOKEN est défini, sinon un
// notifier qui journalise (utile en dev / sans bot configuré).
func New() Notifier {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if token == "" {
		slog.Warn("TELEGRAM_BOT_TOKEN absent : notifications journalisées uniquement")
		return logNotifier{}
	}
	return &telegram{token: token, http: &http.Client{Timeout: 10 * time.Second}}
}

type logNotifier struct{}

func (logNotifier) Send(_ context.Context, targetType, targetAddr, text string) error {
	slog.Info("ALERTE (log)", "target", targetType+":"+targetAddr, "text", text)
	return nil
}

type telegram struct {
	token string
	http  *http.Client
}

func (t *telegram) Send(ctx context.Context, targetType, targetAddr, text string) error {
	if targetType != "telegram" {
		// Cible non-Telegram (ex: log) : journalisation.
		slog.Info("ALERTE (log)", "target", targetType+":"+targetAddr, "text", text)
		return nil
	}
	payload, _ := json.Marshal(map[string]any{"chat_id": targetAddr, "text": "🔔 " + text})
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", t.token)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := t.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram sendMessage → %d", resp.StatusCode)
	}
	return nil
}
