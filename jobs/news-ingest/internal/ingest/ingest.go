package ingest

import (
	"context"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/sentiment-news/jobs/news-ingest/internal/config"
	"github.com/sentiment-news/jobs/news-ingest/internal/finnhub"
	"github.com/sentiment-news/jobs/news-ingest/internal/repository"
	"github.com/sentiment-news/jobs/news-ingest/internal/sentiment"
	"github.com/sentiment-news/jobs/news-ingest/internal/stock"
	"golang.org/x/sync/errgroup"
)

const maxArticlesPerDay = 500

type Service struct {
	cfg       config.Config
	finnhub   *finnhub.Client
	sentiment *sentiment.Analyzer
	store     *repository.Store
}

func NewService(cfg config.Config, store *repository.Store) *Service {
	return &Service{
		cfg:       cfg,
		finnhub:   finnhub.NewClient(cfg.FinnhubAPIKey),
		sentiment: sentiment.NewAnalyzer(cfg.GeminiAPIKey),
		store:     store,
	}
}

type Result struct {
	ArticlesPushed     int64
	RateLimitHits      int64
	UnrecognizedErrors int64
}

func (s *Service) Run(ctx context.Context) (Result, error) {
	dateToday := s.cfg.NewsDate
	if dateToday == "" {
		dateToday = time.Now().Format("2006-01-02")
	}

	var (
		mu           sync.Mutex
		processed    = make(map[int]struct{})
		articleCount int64
	)

	group, ctx := errgroup.WithContext(ctx)
	group.SetLimit(len(s.cfg.Tickers))

	for _, ticker := range s.cfg.Tickers {
		ticker := ticker
		group.Go(func() error {
			return s.processTicker(ctx, ticker, dateToday, processed, &mu, &articleCount)
		})
	}

	if err := group.Wait(); err != nil {
		return Result{}, err
	}

	stats := s.sentiment.Stats()
	return Result{
		ArticlesPushed:     articleCount,
		RateLimitHits:      stats.RateLimitHits,
		UnrecognizedErrors: stats.UnrecognizedErrors,
	}, nil
}

func (s *Service) processTicker(
	ctx context.Context,
	ticker, dateToday string,
	processed map[int]struct{},
	mu *sync.Mutex,
	articleCount *int64,
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

	marketDate := stock.MarketDate(time.Now()).Format("2006-01-02")
	tickerDocID := repository.TickerDocID(ticker, marketDate)

	articleGroup, articleCtx := errgroup.WithContext(ctx)
	articleGroup.SetLimit(1)
	for _, article := range validArticles {
		// Check if we've hit the daily limit
		if atomic.LoadInt64(articleCount) >= maxArticlesPerDay {
			log.Printf("reached daily article limit of %d", maxArticlesPerDay)
			break
		}
		
		article := article
		articleGroup.Go(func() error {
			return s.addArticle(articleCtx, article, tickerDocID, ticker, marketDate, processed, mu, articleCount)
		})
	}

	return articleGroup.Wait()
}

func (s *Service) addArticle(
	ctx context.Context,
	article finnhub.Article,
	tickerDocID, ticker, marketDate string,
	processed map[int]struct{},
	mu *sync.Mutex,
	articleCount *int64,
) error {
	mu.Lock()
	if _, seen := processed[article.ID]; seen {
		mu.Unlock()
		return nil
	}
	processed[article.ID] = struct{}{}
	mu.Unlock()

	existingDoc, err := s.store.ArticleByURL(ctx, article.URL)
	if err != nil {
		return fmt.Errorf("check article exists %d: %w", article.ID, err)
	}
	if existingDoc != nil && existingDoc.Data()["ticker"] != "" {
		log.Printf("skipping duplicate article url: %s", article.URL)
		return nil
	}

	docID := fmt.Sprintf("%d", article.ID)
	if existingDoc != nil {
		docID = existingDoc.Ref.ID
	}

	sentimentValue := s.sentiment.Evaluate(ctx, article.Headline, article.Summary)
	publicationDatetime := stock.FormatPublicationDatetime(article.Datetime)

	err = s.store.UpsertArticle(ctx, docID, repository.Article{
		ArticleID:           article.ID,
		Title:               article.Headline,
		ImageURL:            article.Image,
		ArticleURL:          article.URL,
		Summary:             article.Summary,
		PublicationDatetime: publicationDatetime,
		Sentiment:           sentimentValue,
		Ticker:              ticker,
		TickerDocID:         tickerDocID,
		MarketDate:          marketDate,
		ExpiresAt:           time.Now().AddDate(0, 0, 7),
	})
	if err != nil {
		return fmt.Errorf("create article %d: %w", article.ID, err)
	}

	atomic.AddInt64(articleCount, 1)

	log.Printf("created article: %s on %s", ticker, marketDate)
	return nil
}
