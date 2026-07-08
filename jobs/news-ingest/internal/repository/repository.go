package repository

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
)

type Article struct {
	ArticleID           int
	Title               string
	ImageURL            string
	ArticleURL          string
	Summary             string
	PublicationDatetime string
	Sentiment           string
	Ticker              string
	TickerDocID         string
	MarketDate          string
	ExpiresAt           time.Time
}

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

// TickerDocID must match the doc ID scheme used by the stock-price job
// (jobs/stock-price/internal/repository) so articles can be joined to their ticker's price doc
// even before that doc exists.
func TickerDocID(ticker, marketDate string) string {
	return ticker + "_" + marketDate
}

// ArticleByURL returns the existing article doc with the given URL, if any. Callers use this to
// decide whether a duplicate article needs to be re-upserted to backfill fields (e.g. ticker)
// that were missing when it was first written.
func (s *Store) ArticleByURL(ctx context.Context, articleURL string) (*firestore.DocumentSnapshot, error) {
	docs, err := s.client.Collection("articles").
		Where("articleUrl", "==", articleURL).
		Limit(1).
		Documents(ctx).
		GetAll()
	if err != nil {
		return nil, fmt.Errorf("check article by url: %w", err)
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return docs[0], nil
}

func (s *Store) UpsertArticle(ctx context.Context, docID string, article Article) error {
	doc := map[string]any{
		"articleId":           article.ArticleID,
		"title":               article.Title,
		"imageUrl":            article.ImageURL,
		"articleUrl":          article.ArticleURL,
		"summary":             article.Summary,
		"publicationDatetime": article.PublicationDatetime,
		"sentiment":           article.Sentiment,
		"ticker":              article.Ticker,
		"tickerDocId":         article.TickerDocID,
		"marketDate":          article.MarketDate,
		"expiresAt":           article.ExpiresAt,
	}
	_, err := s.client.Collection("articles").Doc(docID).Set(ctx, doc, firestore.MergeAll)
	if err != nil {
		return fmt.Errorf("upsert article %d: %w", article.ArticleID, err)
	}
	return nil
}
