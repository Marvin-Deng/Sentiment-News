package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"cloud.google.com/go/firestore"

	"github.com/sentiment-news/jobs/utility/cleanup-articles/internal/cleanup"
)

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.LUTC)

	criteria := cleanup.Criteria{
		Ticker: os.Getenv("TICKER"),
		Domain: os.Getenv("DOMAIN"),
	}

	if criteria.IsEmpty() {
		log.Println("no ticker or domain provided, nothing to clean up, exiting")
		return
	}

	projectID := os.Getenv("GCP_PROJECT_ID")
	if projectID == "" {
		log.Fatal("GCP_PROJECT_ID is required")
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("firestore error: %v", err)
	}
	defer client.Close()

	result, err := cleanup.Run(ctx, client, criteria)
	if err != nil {
		log.Fatalf("cleanup failed: %v", err)
	}

	log.Printf("cleanup complete: ticker=%q domain=%q matched=%d deleted=%d",
		criteria.Ticker, criteria.Domain, result.Matched, result.Deleted)
}
