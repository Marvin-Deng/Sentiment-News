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

const tiingoBaseURL = "https://api.tiingo.com"

type TiingoClient struct {
	token      string
	httpClient *http.Client
	baseURL    string
}

func NewTiingoClient(token string) *TiingoClient {
	return &TiingoClient{
		token: token,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
		baseURL: tiingoBaseURL,
	}
}

func (c *TiingoClient) GetEOD(ctx context.Context, ticker, date string) (PriceInfo, error) {
	endpoint := fmt.Sprintf("%s/tiingo/daily/%s/prices", c.baseURL, url.PathEscape(ticker))
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
