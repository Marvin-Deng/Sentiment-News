package fetch

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/sentiment-news/jobs/stock-price/internal/config"
	"github.com/sentiment-news/jobs/stock-price/internal/repository"
	"github.com/sentiment-news/jobs/stock-price/internal/stock"
	"golang.org/x/sync/errgroup"
)

const tickerRecordTTL = 30 * 24 * time.Hour

type Service struct {
	cfg    config.Config
	tiingo *stock.TiingoClient
	store  *repository.Store
}

func NewService(cfg config.Config, store *repository.Store) *Service {
	return &Service{
		cfg:    cfg,
		tiingo: stock.NewTiingoClient(cfg.TiingoToken),
		store:  store,
	}
}

type Result struct {
	UpdatedTickers []string
}

func (s *Service) Run(ctx context.Context) (Result, error) {
	marketDate := stock.MarketDate(time.Now()).Format("2006-01-02")

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
	prices, err := s.tiingo.GetEOD(ctx, ticker, marketDate)
	if err != nil {
		return fmt.Errorf("fetch tiingo eod for %s on %s: %w", ticker, marketDate, err)
	}
	if prices.OpenPrice == nil && prices.ClosePrice == nil {
		log.Printf("warning: no tiingo price data yet for %s on %s", ticker, marketDate)
		return nil
	}

	expiresAt := time.Now().Add(tickerRecordTTL)
	if _, err := s.store.UpsertTicker(ctx, ticker, marketDate, prices.OpenPrice, prices.ClosePrice, expiresAt); err != nil {
		return fmt.Errorf("upsert ticker %s on %s: %w", ticker, marketDate, err)
	}

	log.Printf("updated price for %s on %s", ticker, marketDate)
	return nil
}
