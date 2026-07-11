package main

import (
	"log"

	"github.com/playwright-community/playwright-go"
)

func main() {
	driver, err := playwright.NewDriver(&playwright.RunOptions{
		Browsers: []string{"chromium"},
	})
	if err != nil {
		log.Fatalf("get playwright driver: %v", err)
	}
	if err := driver.Install(); err != nil {
		log.Fatalf("install playwright browsers: %v", err)
	}
}
