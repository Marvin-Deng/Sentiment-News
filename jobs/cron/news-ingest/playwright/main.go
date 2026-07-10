// Command installplaywright downloads the Playwright driver and Chromium, run once at image
// build time. playwright.Run() requires this to have already happened.
package main

import (
	"log"

	"github.com/playwright-community/playwright-go"
)

func main() {
	if err := playwright.Install(&playwright.RunOptions{
		Browsers: []string{"chromium"},
		WithDeps: true,
	}); err != nil {
		log.Fatalf("install playwright: %v", err)
	}
}
