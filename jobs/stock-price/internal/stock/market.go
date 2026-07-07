package stock

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type EODRecord struct {
	Open  *float64 `json:"open"`
	Close *float64 `json:"close"`
}

type TiingoClient struct {
	token      string
	httpClient *http.Client
}

func NewTiingoClient(token string) *TiingoClient {
	return &TiingoClient{
		token: token,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

type PriceInfo struct {
	OpenPrice  *float64
	ClosePrice *float64
}

func (c *TiingoClient) GetEOD(ctx context.Context, ticker, date string) (PriceInfo, error) {
	endpoint := fmt.Sprintf("https://api.tiingo.com/tiingo/daily/%s/prices", url.PathEscape(ticker))
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return PriceInfo{}, err
	}

	query := parsed.Query()
	query.Set("startDate", date)
	query.Set("endDate", date)
	query.Set("token", c.token)
	parsed.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsed.String(), nil)
	if err != nil {
		return PriceInfo{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return PriceInfo{}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return PriceInfo{}, err
	}
	if resp.StatusCode != http.StatusOK {
		return PriceInfo{}, fmt.Errorf("tiingo eod: status %d: %s", resp.StatusCode, string(body))
	}

	var records []EODRecord
	if err := json.Unmarshal(body, &records); err != nil {
		return PriceInfo{}, err
	}
	if len(records) == 0 {
		return PriceInfo{}, nil
	}

	return PriceInfo{
		OpenPrice:  records[0].Open,
		ClosePrice: records[0].Close,
	}, nil
}

// MarketDate mirrors jobs/news-ingest/internal/stock.MarketDate — kept in sync so articles and
// their price docs agree on which trading day a publication maps to.
func MarketDate(publication time.Time) time.Time {
	publishedDate := dateOnly(publication)
	weekday := publishedDate.Weekday()

	if weekday >= time.Saturday || (weekday == time.Friday && afterMarketClosed(publication)) {
		return nextMonday(publishedDate)
	}
	if afterMarketClosed(publication) {
		return publishedDate.AddDate(0, 0, 1)
	}
	return publishedDate
}

func afterMarketClosed(publication time.Time) bool {
	marketClose := time.Date(
		publication.Year(),
		publication.Month(),
		publication.Day(),
		21, 0, 0, 0,
		publication.Location(),
	)
	return !publication.Before(marketClose)
}

func nextMonday(date time.Time) time.Time {
	daysUntilMonday := (8 - int(date.Weekday())) % 7
	if daysUntilMonday == 0 {
		daysUntilMonday = 7
	}
	return date.AddDate(0, 0, daysUntilMonday)
}

func dateOnly(value time.Time) time.Time {
	year, month, day := value.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, value.Location())
}
