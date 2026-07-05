package repository

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
)

type Ticker struct {
	DocID      string
	Ticker     string
	MarketDate string
	OpenPrice  *float64
	ClosePrice *float64
}

type Article struct {
	ArticleID           int
	Title               string
	ImageURL            string
	ArticleURL          string
	Summary             string
	PublicationDatetime string
	Sentiment           string
	TickerDocID         string
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

func tickerDocID(ticker, marketDate string) string {
	return ticker + "_" + marketDate
}

func (s *Store) GetTicker(ctx context.Context, ticker, marketDate string) (*Ticker, error) {
	docID := tickerDocID(ticker, marketDate)
	snap, err := s.client.Collection("tickers").Doc(docID).Get(ctx)
	if err != nil {
		if snap != nil && !snap.Exists() {
			return nil, nil
		}
		// status.Code check would require grpc — use string match as fallback
		return nil, fmt.Errorf("get ticker: %w", err)
	}
	if !snap.Exists() {
		return nil, nil
	}

	data := snap.Data()
	t := &Ticker{
		DocID:      docID,
		Ticker:     stringField(data, "ticker"),
		MarketDate: stringField(data, "marketDate"),
	}
	if v, ok := data["openPrice"].(float64); ok {
		t.OpenPrice = &v
	}
	if v, ok := data["closePrice"].(float64); ok {
		t.ClosePrice = &v
	}
	return t, nil
}

func (s *Store) UpsertTicker(
	ctx context.Context,
	ticker, marketDate string,
	openPrice, closePrice *float64,
) (*Ticker, error) {
	docID := tickerDocID(ticker, marketDate)
	doc := map[string]any{
		"ticker":     ticker,
		"marketDate": marketDate,
		"openPrice":  openPrice,
		"closePrice": closePrice,
	}
	_, err := s.client.Collection("tickers").Doc(docID).Set(ctx, doc, firestore.MergeAll)
	if err != nil {
		return nil, fmt.Errorf("upsert ticker: %w", err)
	}
	return &Ticker{
		DocID:      docID,
		Ticker:     ticker,
		MarketDate: marketDate,
		OpenPrice:  openPrice,
		ClosePrice: closePrice,
	}, nil
}

func (s *Store) ArticleExistsByURL(ctx context.Context, articleURL string) (bool, error) {
	docs, err := s.client.Collection("articles").
		Where("articleUrl", "==", articleURL).
		Limit(1).
		Documents(ctx).
		GetAll()
	if err != nil {
		return false, fmt.Errorf("check article by url: %w", err)
	}
	return len(docs) > 0, nil
}

func (s *Store) UpsertArticle(ctx context.Context, article Article) error {
	docID := fmt.Sprintf("%d", article.ArticleID)
	doc := map[string]any{
		"articleId":           article.ArticleID,
		"title":               article.Title,
		"imageUrl":            article.ImageURL,
		"articleUrl":          article.ArticleURL,
		"summary":             article.Summary,
		"publicationDatetime": article.PublicationDatetime,
		"sentiment":           article.Sentiment,
		"tickerDocId":         article.TickerDocID,
		"expiresAt":           article.ExpiresAt,
	}
	_, err := s.client.Collection("articles").Doc(docID).Set(ctx, doc, firestore.MergeAll)
	if err != nil {
		return fmt.Errorf("upsert article %d: %w", article.ArticleID, err)
	}
	return nil
}

func stringField(data map[string]any, key string) string {
	v, _ := data[key].(string)
	return v
}
