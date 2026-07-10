package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	jobstatsig "github.com/sentiment-news/jobs/statsig"
)

var DefaultTickers = []string{
	"AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "TSLA", "META", "NFLX",
	"JPM", "AMD", "V", "PYPL", "QCOM", "AVGO", "MU",
}

type Config struct {
	GCPProjectID  string
	TiingoToken   string
	FinnhubAPIKey string
	Tickers       []string
	MarketDate    string // optional override, "YYYY-MM-DD"; empty means use today's market date
}

func Load() (Config, error) {
	cfg := Config{
		GCPProjectID:  os.Getenv("GCP_PROJECT_ID"),
		TiingoToken:   os.Getenv("TIINGO_TOKEN"),
		FinnhubAPIKey: os.Getenv("FINNHUB_API_KEY"),
		Tickers:       jobstatsig.GetTickers(DefaultTickers),
		MarketDate:    strings.TrimSpace(os.Getenv("MARKET_DATE")),
	}

	if cfg.GCPProjectID == "" {
		return cfg, fmt.Errorf("GCP_PROJECT_ID is required")
	}
	if cfg.TiingoToken == "" {
		return cfg, fmt.Errorf("TIINGO_TOKEN is required")
	}
	if cfg.MarketDate != "" {
		if _, err := time.Parse("2006-01-02", cfg.MarketDate); err != nil {
			return cfg, fmt.Errorf("MARKET_DATE must be in YYYY-MM-DD format: %w", err)
		}
	}

	return cfg, nil
}
