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

const finnhubBaseURL = "https://finnhub.io/api/v1"

type FinnhubClient struct {
	token      string
	httpClient *http.Client
	baseURL    string
}

func NewFinnhubClient(token string) *FinnhubClient {
	return &FinnhubClient{
		token: token,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
		baseURL: finnhubBaseURL,
	}
}

type finnhubQuote struct {
	Open          *float64 `json:"o"`
	CurrentPrice  *float64 `json:"c"`
	PreviousClose *float64 `json:"pc"`
}

// GetEOD returns Finnhub's current quote for ticker as an approximation of the requested
// date's EOD price. Finnhub's free quote endpoint only exposes the latest quote, so this is
// only a reasonable fallback when used for the current trading day.
func (c *FinnhubClient) GetEOD(ctx context.Context, ticker string) (PriceInfo, error) {
	endpoint := c.baseURL + "/quote"
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return PriceInfo{}, err
	}

	query := parsed.Query()
	query.Set("symbol", ticker)
	query.Set("token", c.token)
	parsed.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, parsed.String(), nil)
	if err != nil {
		return PriceInfo{}, err
	}

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
		return PriceInfo{}, fmt.Errorf("finnhub quote: status %d: %s", resp.StatusCode, string(body))
	}

	var quote finnhubQuote
	if err := json.Unmarshal(body, &quote); err != nil {
		return PriceInfo{}, err
	}

	return PriceInfo{
		OpenPrice:  quote.Open,
		ClosePrice: quote.CurrentPrice,
	}, nil
}
