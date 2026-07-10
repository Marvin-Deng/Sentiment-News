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
	newsConfigWhitelistKey = "image_whitelist"
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

// GetImageWhitelist returns sanitized source names from Statsig config news-config.image_whitelist,
// falling back when Statsig is unavailable or the config is empty.
func GetImageWhitelist(fallback []string) []string {
	if err := Initialize(); err != nil {
		return cloneStrings(fallback)
	}
	defer Shutdown()

	config := statsigsdk.GetConfigWithExposureLoggingDisabled(
		statsigsdk.User{UserID: defaultStatsigUserID},
		newsConfigName,
	)

	return normalizeStrings(config.GetSlice(newsConfigWhitelistKey, nil), fallback, strings.ToLower)
}

func normalizeStrings(raw []interface{}, fallback []string, normalize func(string) string) []string {
	if len(raw) == 0 {
		return cloneStrings(fallback)
	}

	values := make([]string, len(raw))
	for i, item := range raw {
		values[i] = normalize(item.(string))
	}

	return values
}

func cloneStrings(values []string) []string {
	return append([]string(nil), values...)
}
