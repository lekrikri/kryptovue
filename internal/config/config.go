// Package config charge la configuration des services depuis l'environnement.
package config

import (
	"os"
	"strings"
)

type Config struct {
	KafkaBrokers []string // KAFKA_BROKERS, ex: "localhost:19092"
	TradesTopic  string   // KAFKA_TRADES_TOPIC
	DatabaseURL  string   // DATABASE_URL
	Symbols      []string // SYMBOLS, ex: "btcusdt,ethusdt"
	APIPort      string   // API_PORT
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// Load lit la configuration avec des valeurs par défaut adaptées au dev local.
func Load() Config {
	return Config{
		KafkaBrokers: strings.Split(getenv("KAFKA_BROKERS", "localhost:19092"), ","),
		TradesTopic:  getenv("KAFKA_TRADES_TOPIC", "crypto.trades"),
		DatabaseURL:  getenv("DATABASE_URL", "postgres://kryptovue:kryptovue@localhost:5433/kryptovue"),
		Symbols: strings.Split(getenv("SYMBOLS",
			"btcusdt,ethusdt,solusdt,xrpusdt,adausdt,dogeusdt,dotusdt,linkusdt,avaxusdt,ltcusdt"), ","),
		APIPort: getenv("API_PORT", "8080"),
	}
}
