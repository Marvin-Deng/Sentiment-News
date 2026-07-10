package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sentiment-news/jobs/cron/news-ingest/internal/config"
	"github.com/sentiment-news/jobs/cron/news-ingest/internal/ingest"
	"github.com/sentiment-news/jobs/cron/news-ingest/internal/repository"
)

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.LUTC)

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	store, err := repository.New(ctx, cfg.GCPProjectID)
	if err != nil {
		log.Fatalf("firestore error: %v", err)
	}
	defer store.Close()

	start := time.Now()
	result, err := ingest.NewService(cfg, store).Run(ctx)
	if err != nil {
		log.Fatalf("ingest failed: %v", err)
	}

	log.Printf(
		"job complete: articles=%d rate_limit_hits=%d unrecognized_sentiment=%d duration_ms=%d",
		result.ArticlesPushed,
		result.RateLimitHits,
		result.UnrecognizedErrors,
		time.Since(start).Milliseconds(),
	)
}
