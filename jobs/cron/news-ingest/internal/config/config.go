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

var DefaultSourceBlacklist = []string{"chartmill"}

var DefaultImageWhitelist = []string{"seekingalpha"}

const SentimentOptions = "Optimistic, Positive, Stable, Pessimistic, Negative, Inconsistent, Cautious, Neutral"

type Config struct {
	GCPProjectID    string
	FinnhubAPIKey   string
	GeminiAPIKey    string
	Tickers         []string
	SourceBlacklist []string
	ImageWhitelist  []string
	NewsDate        string // optional override, "YYYY-MM-DD"; empty means use today's date
}

func Load() (Config, error) {
	cfg := Config{
		GCPProjectID:    os.Getenv("GCP_PROJECT_ID"),
		FinnhubAPIKey:   os.Getenv("FINNHUB_API_KEY"),
		GeminiAPIKey:    os.Getenv("GEMINI_KEY"),
		Tickers:         jobstatsig.GetTickers(DefaultTickers),
		SourceBlacklist: jobstatsig.GetSourceBlacklist(DefaultSourceBlacklist),
		ImageWhitelist:  jobstatsig.GetImageWhitelist(DefaultImageWhitelist),
		NewsDate:        strings.TrimSpace(os.Getenv("NEWS_DATE")),
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
	if cfg.NewsDate != "" {
		if _, err := time.Parse("2006-01-02", cfg.NewsDate); err != nil {
			return cfg, fmt.Errorf("NEWS_DATE must be in YYYY-MM-DD format: %w", err)
		}
	}

	return cfg, nil
}
