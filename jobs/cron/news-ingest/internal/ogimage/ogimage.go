package ogimage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/playwright-community/playwright-go"
)

const defaultTimeout = 8 * time.Second

// Resolver holds one shared headless browser, reused across Resolve calls.
type Resolver struct {
	pw      *playwright.Playwright
	browser playwright.Browser
}

// NewResolver launches a headless Chromium instance.
func NewResolver() (*Resolver, error) {
	pw, err := playwright.Run()
	if err != nil {
		return nil, fmt.Errorf("start playwright: %w", err)
	}

	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(true),
	})
	if err != nil {
		pw.Stop()
		return nil, fmt.Errorf("launch chromium: %w", err)
	}

	return &Resolver{pw: pw, browser: browser}, nil
}

// Close shuts down the shared browser and playwright driver.
func (r *Resolver) Close() {
	if r.browser != nil {
		r.browser.Close()
	}
	if r.pw != nil {
		r.pw.Stop()
	}
}

// Resolve returns articleURL's og:image. Callers should fall back to another image on error.
func (r *Resolver) Resolve(ctx context.Context, articleURL string) (string, error) {
	timeout := defaultTimeout
	if deadline, ok := ctx.Deadline(); ok {
		if remaining := time.Until(deadline); remaining < timeout {
			timeout = remaining
		}
	}
	if timeout <= 0 {
		return "", fmt.Errorf("no time remaining to resolve %s", articleURL)
	}

	page, err := r.browser.NewPage()
	if err != nil {
		return "", fmt.Errorf("open page: %w", err)
	}
	defer page.Close()

	timeoutMs := float64(timeout / time.Millisecond)
	if _, err := page.Goto(articleURL, playwright.PageGotoOptions{
		Timeout:   playwright.Float(timeoutMs),
		WaitUntil: playwright.WaitUntilStateDomcontentloaded,
	}); err != nil {
		return "", fmt.Errorf("navigate to %s: %w", articleURL, err)
	}

	locator := page.Locator(`meta[property="og:image"]`)
	count, err := locator.Count()
	if err != nil {
		return "", fmt.Errorf("query og:image meta tag: %w", err)
	}
	if count == 0 {
		return "", fmt.Errorf("no og:image meta tag found")
	}

	image, err := locator.First().GetAttribute("content")
	if err != nil {
		return "", fmt.Errorf("read og:image content: %w", err)
	}

	image = strings.TrimSpace(image)
	if image == "" {
		return "", fmt.Errorf("og:image meta tag had empty content")
	}

	return image, nil
}
