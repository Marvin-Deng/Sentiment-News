package ingest

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/sentiment-news/jobs/news-ingest/internal/config"
	"github.com/sentiment-news/jobs/news-ingest/internal/finnhub"
	"github.com/sentiment-news/jobs/news-ingest/internal/repository"
	"github.com/sentiment-news/jobs/news-ingest/internal/sentiment"
	"github.com/sentiment-news/jobs/news-ingest/internal/stock"
	"golang.org/x/sync/errgroup"
)

type Service struct {
	cfg       config.Config
	finnhub   *finnhub.Client
	sentiment *sentiment.Analyzer
	tiingo    *stock.TiingoClient
	store     *repository.Store
}

func NewService(cfg config.Config, store *repository.Store) *Service {
	return &Service{
		cfg:       cfg,
		finnhub:   finnhub.NewClient(cfg.FinnhubAPIKey),
		sentiment: sentiment.NewAnalyzer(cfg.GeminiAPIKey),
		tiingo:    stock.NewTiingoClient(cfg.TiingoToken),
		store:     store,
	}
}

type Result struct {
	ProcessedTitles []string
}

func (s *Service) Run(ctx context.Context) (Result, error) {
	dateToday := time.Now().Format("2006-01-02")

	var (
		mu        sync.Mutex
		processed = make(map[int]struct{})
		titles    []string
	)

	group, ctx := errgroup.WithContext(ctx)
	group.SetLimit(len(s.cfg.Tickers))

	for _, ticker := range s.cfg.Tickers {
		ticker := ticker
		group.Go(func() error {
			return s.processTicker(ctx, ticker, dateToday, processed, &mu, &titles)
		})
	}

	if err := group.Wait(); err != nil {
		return Result{}, err
	}

	return Result{ProcessedTitles: titles}, nil
}

func (s *Service) processTicker(
	ctx context.Context,
	ticker, dateToday string,
	processed map[int]struct{},
	mu *sync.Mutex,
	titles *[]string,
) error {
	articles, err := s.finnhub.CompanyNews(ctx, ticker, dateToday, dateToday)
	if err != nil {
		return fmt.Errorf("fetch finnhub news for %s: %w", ticker, err)
	}

	validArticles := make([]finnhub.Article, 0, len(articles))
	for _, article := range articles {
		if article.Image != "" {
			validArticles = append(validArticles, article)
		}
	}
	if len(validArticles) == 0 {
		return nil
	}

	log.Printf("found %d articles for %s", len(validArticles), ticker)

	tickerObject, err := s.ensureTicker(ctx, ticker, time.Now())
	if err != nil {
		return fmt.Errorf("ensure ticker %s: %w", ticker, err)
	}

	articleGroup, articleCtx := errgroup.WithContext(ctx)
	for _, article := range validArticles {
		article := article
		articleGroup.Go(func() error {
			return s.addArticle(articleCtx, article, tickerObject, processed, mu, titles)
		})
	}

	return articleGroup.Wait()
}

func (s *Service) ensureTicker(ctx context.Context, ticker string, publication time.Time) (*repository.Ticker, error) {
	marketDate := stock.MarketDate(publication).Format("2006-01-02")

	existing, err := s.store.GetTicker(ctx, ticker, marketDate)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		log.Printf("ticker already exists: %s on %s", existing.Ticker, existing.MarketDate)
		return existing, nil
	}

	prices, err := s.tiingo.GetEOD(ctx, ticker, marketDate)
	if err != nil {
		log.Printf("warning: failed to fetch tiingo eod for %s on %s: %v", ticker, marketDate, err)
	}

	upserted, err := s.store.UpsertTicker(ctx, ticker, marketDate, prices.OpenPrice, prices.ClosePrice)
	if err != nil {
		return nil, err
	}

	log.Printf("upserted ticker %s on %s", upserted.Ticker, upserted.MarketDate)
	return upserted, nil
}

func (s *Service) addArticle(
	ctx context.Context,
	article finnhub.Article,
	tickerObject *repository.Ticker,
	processed map[int]struct{},
	mu *sync.Mutex,
	titles *[]string,
) error {
	mu.Lock()
	if _, seen := processed[article.ID]; seen {
		mu.Unlock()
		return nil
	}
	processed[article.ID] = struct{}{}
	mu.Unlock()

	exists, err := s.store.ArticleExistsByURL(ctx, article.URL)
	if err != nil {
		return fmt.Errorf("check article exists %d: %w", article.ID, err)
	}
	if exists {
		log.Printf("skipping duplicate article url: %s", article.URL)
		return nil
	}

	sentimentValue := s.sentiment.Evaluate(ctx, article.Headline, article.Summary)
	publicationDatetime := stock.FormatPublicationDatetime(article.Datetime)

	err = s.store.UpsertArticle(ctx, repository.Article{
		ArticleID:           article.ID,
		Title:               article.Headline,
		ImageURL:            article.Image,
		ArticleURL:          article.URL,
		Summary:             article.Summary,
		PublicationDatetime: publicationDatetime,
		Sentiment:           sentimentValue,
		TickerDocID:         tickerObject.DocID,
		ExpiresAt:           time.Now().AddDate(0, 0, 7),
	})
	if err != nil {
		return fmt.Errorf("create article %d: %w", article.ID, err)
	}

	mu.Lock()
	*titles = append(*titles, article.Headline)
	mu.Unlock()

	log.Printf("created article: %s on %s", tickerObject.Ticker, tickerObject.MarketDate)
	return nil
}
