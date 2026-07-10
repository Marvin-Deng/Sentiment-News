package statsig

import (
	"fmt"
	"os"
	"strings"

	statsigsdk "github.com/statsig-io/go-sdk"
)

const (
	newsConfigName         = "news-config"
	newsConfigTickersKey   = "tickers"
	newsConfigBlacklistKey = "source_blacklist"
	defaultStatsigUserID   = "jobs-default-tickers"
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
		return cloneStrings(fallback)
	}
	defer Shutdown()

	config := statsigsdk.GetConfigWithExposureLoggingDisabled(
		statsigsdk.User{UserID: defaultStatsigUserID},
		newsConfigName,
	)

	return normalizeTickers(config.GetSlice(newsConfigTickersKey, nil), fallback)
}

func normalizeTickers(raw []interface{}, fallback []string) []string {
	return normalizeStrings(raw, fallback, strings.ToUpper)
}

// GetSourceBlacklist returns sanitized source names from Statsig config news-config.source_blacklist,
// falling back when Statsig is unavailable or the config is empty.
func GetSourceBlacklist(fallback []string) []string {
	if err := Initialize(); err != nil {
		return cloneStrings(fallback)
	}
	defer Shutdown()

	config := statsigsdk.GetConfigWithExposureLoggingDisabled(
		statsigsdk.User{UserID: defaultStatsigUserID},
		newsConfigName,
	)

	return normalizeStrings(config.GetSlice(newsConfigBlacklistKey, nil), fallback, strings.ToLower)
}

func normalizeStrings(raw []interface{}, fallback []string, normalize func(string) string) []string {
	seen := make(map[string]struct{}, len(raw))
	values := make([]string, 0, len(raw))

	for _, item := range raw {
		value := normalize(strings.TrimSpace(item.(string)))
		if value == "" {
			continue
		}
		if _, exists := seen[value]; exists {
			continue
		}

		seen[value] = struct{}{}
		values = append(values, value)
	}

	if len(values) == 0 {
		return cloneStrings(fallback)
	}

	return values
}

func cloneStrings(values []string) []string {
	return append([]string(nil), values...)
}
