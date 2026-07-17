// Package llm : client LLM local (Qwen via ollama, API compatible OpenAI) pour
// les tâches d'inférence côté Go (ex. parsing d'alerte en langage naturel).
package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

func baseURL() string {
	if v := os.Getenv("LLM_BASE_URL"); v != "" {
		return v
	}
	return "http://localhost:11434/v1"
}

func model() string {
	if v := os.Getenv("LLM_MODEL"); v != "" {
		return v
	}
	return "qwen2.5:3b"
}

// Available indique si un backend LLM est configuré/activé.
func Available() bool {
	return strings.EqualFold(os.Getenv("LLM_ENABLED"), "true") || os.Getenv("LLM_BASE_URL") != ""
}

func chat(ctx context.Context, messages []map[string]string) (string, error) {
	payload, _ := json.Marshal(map[string]any{
		"model":       model(),
		"messages":    messages,
		"temperature": 0,
		"max_tokens":  120,
	})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		baseURL()+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("llm → %d", resp.StatusCode)
	}
	var body struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", err
	}
	if len(body.Choices) == 0 {
		return "", fmt.Errorf("réponse llm vide")
	}
	return body.Choices[0].Message.Content, nil
}

// ParsedAlert est le résultat structuré du parsing d'une phrase.
type ParsedAlert struct {
	Symbol    string  `json:"symbol"`
	RuleType  string  `json:"rule_type"`
	Threshold float64 `json:"threshold"`
}

var (
	reSymbol = regexp.MustCompile(`"symbol"\s*:\s*"?([a-zA-Z]+)"?`)
	reRule   = regexp.MustCompile(`(price_above|price_below|change_above|anomaly)`)
	reThresh = regexp.MustCompile(`"threshold"\s*:\s*"?(-?\d*\.?\d+)"?`)
)

// ParseAlert transforme une phrase française en règle d'alerte structurée.
// `catalog` associe des noms/tickers au symbole (ex. "bitcoin"→"btcusdt").
func ParseAlert(ctx context.Context, text string, catalog map[string]string) (ParsedAlert, error) {
	var pairs []string
	for k, v := range catalog {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, v))
	}
	system := "Tu convertis une demande d'alerte crypto en français en JSON compact " +
		`{"symbol":"...","rule_type":"...","threshold":nombre}. ` +
		"rule_type ∈ {price_above, price_below, change_above, anomaly}. " +
		"price_above/below = seuil de prix en USD ; change_above = variation 24h en % ; " +
		"anomaly = mouvement/volume anormal (threshold=0). " +
		"symbol doit être un symbole de cette liste (nom=symbole) : " + strings.Join(pairs, ", ") +
		". Réponds UNIQUEMENT le JSON."

	raw, err := chat(ctx, []map[string]string{
		{"role": "system", "content": system},
		{"role": "user", "content": text},
	})
	if err != nil {
		return ParsedAlert{}, err
	}

	var out ParsedAlert
	if m := reSymbol.FindStringSubmatch(raw); m != nil {
		out.Symbol = strings.ToLower(m[1])
	}
	if m := reRule.FindStringSubmatch(raw); m != nil {
		out.RuleType = m[1]
	}
	if m := reThresh.FindStringSubmatch(raw); m != nil {
		fmt.Sscanf(m[1], "%f", &out.Threshold)
	}
	if out.Symbol == "" || out.RuleType == "" {
		return ParsedAlert{}, fmt.Errorf("phrase non comprise (réponse: %s)", strings.TrimSpace(raw))
	}
	return out, nil
}
