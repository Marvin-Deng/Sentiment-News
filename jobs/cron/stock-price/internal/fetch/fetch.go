package fetch

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/sentiment-news/jobs/cron/stock-price/internal/config"
	"github.com/sentiment-news/jobs/cron/stock-price/internal/repository"
	"github.com/sentiment-news/jobs/cron/stock-price/internal/stock"
	"golang.org/x/sync/errgroup"
)

const tickerRecordTTL = 30 * 24 * time.Hour

type Service struct {
	cfg     config.Config
	tiingo  *stock.TiingoClient
	finnhub *stock.FinnhubClient
	store   *repository.Store
}

func NewService(cfg config.Config, store *repository.Store) *Service {
	return &Service{
		cfg:     cfg,
		tiingo:  stock.NewTiingoClient(cfg.TiingoToken),
		finnhub: stock.NewFinnhubClient(cfg.FinnhubAPIKey),
		store:   store,
	}
}

type Result struct {
	UpdatedTickers []string
}

func (s *Service) Run(ctx context.Context) (Result, error) {
	marketDate := s.cfg.MarketDate
	if marketDate == "" {
		marketDate = stock.TodayMarketDate(time.Now()).Format("2006-01-02")
	}

	var updated []string
	group, ctx := errgroup.WithContext(ctx)
	group.SetLimit(len(s.cfg.Tickers))

	for _, ticker := range s.cfg.Tickers {
		ticker := ticker
		group.Go(func() error {
			if err := s.updateTicker(ctx, ticker, marketDate); err != nil {
				return err
			}
			updated = append(updated, ticker)
			return nil
		})
	}

	if err := group.Wait(); err != nil {
		return Result{}, err
	}

	return Result{UpdatedTickers: updated}, nil
}

func (s *Service) updateTicker(ctx context.Context, ticker, marketDate string) error {
	log.Printf("processing %s for %s: fetching tiingo eod", ticker, marketDate)
	prices, err := s.tiingo.GetEOD(ctx, ticker, marketDate)
	if err != nil {
		isToday := marketDate == stock.TodayMarketDate(time.Now()).Format("2006-01-02")
		if s.cfg.FinnhubAPIKey == "" || !isToday {
			return fmt.Errorf("fetch tiingo eod for %s on %s: %w", ticker, marketDate, err)
		}
		// Finnhub's free quote endpoint only exposes the latest quote, so it's only a valid
		// fallback when the requested market date is today.
		log.Printf("warning: tiingo eod failed for %s on %s (%v), falling back to finnhub", ticker, marketDate, err)
		log.Printf("processing %s for %s: fetching finnhub eod", ticker, marketDate)
		prices, err = s.finnhub.GetEOD(ctx, ticker)
		if err != nil {
			return fmt.Errorf("fetch finnhub eod for %s on %s: %w", ticker, marketDate, err)
		}
	}
	if prices.OpenPrice == nil && prices.ClosePrice == nil {
		log.Printf("warning: no tiingo price data yet for %s on %s", ticker, marketDate)
		return nil
	}

	log.Printf("processing %s for %s: open=%v close=%v", ticker, marketDate, derefPrice(prices.OpenPrice), derefPrice(prices.ClosePrice))

	expiresAt := time.Now().Add(tickerRecordTTL)
	log.Printf("processing %s for %s: writing to firestore", ticker, marketDate)
	if err := s.store.UpsertTicker(ctx, ticker, marketDate, prices.OpenPrice, prices.ClosePrice, expiresAt); err != nil {
		return fmt.Errorf("upsert ticker %s on %s: %w", ticker, marketDate, err)
	}

	log.Printf("updated price for %s on %s", ticker, marketDate)
	return nil
}

func derefPrice(price *float64) any {
	if price == nil {
		return "unavailable"
	}
	return *price
}
