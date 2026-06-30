package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/sentiment-news/jobs/news-ingest/internal/config"
	"github.com/sentiment-news/jobs/news-ingest/internal/ingest"
	"github.com/sentiment-news/jobs/news-ingest/internal/repository"
)

func main() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.LUTC)

	_ = godotenv.Load("../.env", ".env")

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

	response := map[string]any{
		"status": map[string]any{
			"message": "SUCCESS",
			"rcode":   200,
		},
		"num_returned": len(result.ProcessedTitles),
		"processed":    result.ProcessedTitles,
		"duration_ms":  time.Since(start).Milliseconds(),
	}

	payload, err := json.Marshal(response)
	if err != nil {
		log.Fatalf("marshal response: %v", err)
	}

	log.Printf("job complete: %s", string(payload))
}
