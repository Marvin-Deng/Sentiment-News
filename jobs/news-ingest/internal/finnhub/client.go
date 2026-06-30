package finnhub

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type Article struct {
	ID       int    `json:"id"`
	Headline string `json:"headline"`
	Summary  string `json:"summary"`
	Datetime int64  `json:"datetime"`
	Image    string `json:"image"`
	URL      string `json:"url"`
	Related  string `json:"related"`
}

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) CompanyNews(ctx context.Context, ticker, dateFrom, dateTo string) ([]Article, error) {
	endpoint, err := url.Parse("https://finnhub.io/api/v1/company-news")
	if err != nil {
		return nil, err
	}

	query := endpoint.Query()
	query.Set("symbol", ticker)
	query.Set("from", dateFrom)
	query.Set("to", dateTo)
	query.Set("token", c.apiKey)
	endpoint.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("finnhub company-news: status %d: %s", resp.StatusCode, string(body))
	}

	var articles []Article
	if err := json.Unmarshal(body, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}
