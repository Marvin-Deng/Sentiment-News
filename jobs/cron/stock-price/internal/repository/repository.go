package repository

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
)

type Store struct {
	client *firestore.Client
}

func New(ctx context.Context, projectID string) (*Store, error) {
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("create firestore client: %w", err)
	}
	return &Store{client: client}, nil
}

func (s *Store) Close() {
	s.client.Close()
}

// TickerDocID must match the doc ID scheme used by jobs/news-ingest/internal/repository so
// articles written there resolve to the same price doc written here.
func TickerDocID(ticker, marketDate string) string {
	return ticker + "_" + marketDate
}

// UpsertTicker writes price fields via merge, so passing nil for openPrice/closePrice (e.g. when
// Tiingo has no data yet) would otherwise null out a previously-written good price on a rerun.
// Callers should omit those fields from the write entirely when they have no value to report.
func (s *Store) UpsertTicker(
	ctx context.Context,
	ticker, marketDate string,
	openPrice, closePrice *float64,
	expiresAt time.Time,
) error {
	docID := TickerDocID(ticker, marketDate)
	doc := map[string]any{
		"ticker":     ticker,
		"marketDate": marketDate,
		"expiresAt":  expiresAt,
	}
	if openPrice != nil {
		doc["openPrice"] = *openPrice
	}
	if closePrice != nil {
		doc["closePrice"] = *closePrice
	}
	if _, err := s.client.Collection("tickers").Doc(docID).Set(ctx, doc, firestore.MergeAll); err != nil {
		return fmt.Errorf("upsert ticker: %w", err)
	}
	return nil
}
