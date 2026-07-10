package statsig

import (
	"fmt"
	"os"
	"strings"

	statsigsdk "github.com/statsig-io/go-sdk"
)

const (
	newsConfigName       = "news-config"
	newsConfigTickersKey = "tickers"
	defaultStatsigUserID = "jobs-default-tickers"
)

// Initialize starts the Statsig server SDK using the STATSIG_KEY environment variable.
func Initialize() error {
	key := strings.TrimSpace(os.Getenv("STATSIG_KEY"))
	if key == "" {
		return fmt.Errorf("STATSIG_KEY is required")
	}

	details := statsigsdk.Initialize(key)
	if !details.Success {
		if details.Error != nil {
			return details.Error
		}
		return fmt.Errorf("Statsig initialization failed")
	}

	return nil
}

// Shutdown flushes pending events and stops the SDK's background workers.
func Shutdown() {
	statsigsdk.Shutdown()
}

// GetTickers returns sanitized tickers from Statsig config news-config.tickers,
// falling back when Statsig is unavailable or the config is empty.
func GetTickers(fallback []string) []string {
	if err := Initialize(); err != nil {
		return cloneTickers(fallback)
	}
	defer Shutdown()

	config := statsigsdk.GetConfigWithExposureLoggingDisabled(
		statsigsdk.User{UserID: defaultStatsigUserID},
		newsConfigName,
	)

	return normalizeTickers(config.GetSlice(newsConfigTickersKey, nil), fallback)
}

func normalizeTickers(raw []interface{}, fallback []string) []string {
	seen := make(map[string]struct{}, len(raw))
	tickers := make([]string, 0, len(raw))

	for _, item := range raw {
		ticker := strings.ToUpper(strings.TrimSpace(item.(string)))
		if ticker == "" {
			continue
		}
		if _, exists := seen[ticker]; exists {
			continue
		}

		seen[ticker] = struct{}{}
		tickers = append(tickers, ticker)
	}

	if len(tickers) == 0 {
		return cloneTickers(fallback)
	}

	return tickers
}

func cloneTickers(tickers []string) []string {
	return append([]string(nil), tickers...)
}
