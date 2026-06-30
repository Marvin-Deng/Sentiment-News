package config

import (
	"fmt"
	"os"
	"strings"
)

var DefaultTickers = []string{
	"AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "TSLA", "META", "NFLX",
	"JPM", "AMD", "V", "PYPL", "QCOM", "AVGO",
}

const SentimentOptions = "Optimistic, Positive, Stable, Pessimistic, Negative, Inconsistent, Cautious, Neutral"

type Config struct {
	GCPProjectID  string
	FinnhubAPIKey string
	GeminiAPIKey  string
	TiingoToken   string
	Tickers       []string
}

func Load() (Config, error) {
	cfg := Config{
		GCPProjectID:  os.Getenv("GCP_PROJECT_ID"),
		FinnhubAPIKey: os.Getenv("FINNHUB_API_KEY"),
		GeminiAPIKey:  os.Getenv("GEMINI_KEY"),
		TiingoToken:   os.Getenv("TIINGO_TOKEN"),
		Tickers:       DefaultTickers,
	}

	if raw := strings.TrimSpace(os.Getenv("TICKERS")); raw != "" {
		cfg.Tickers = splitCSV(raw)
	}

	if cfg.GCPProjectID == "" {
		return cfg, fmt.Errorf("GCP_PROJECT_ID is required")
	}
	if cfg.FinnhubAPIKey == "" {
		return cfg, fmt.Errorf("FINNHUB_API_KEY is required")
	}
	if cfg.GeminiAPIKey == "" {
		return cfg, fmt.Errorf("GEMINI_KEY is required")
	}
	if cfg.TiingoToken == "" {
		return cfg, fmt.Errorf("TIINGO_TOKEN is required")
	}

	return cfg, nil
}

func splitCSV(raw string) []string {
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
