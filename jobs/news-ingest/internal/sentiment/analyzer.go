package sentiment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/sentiment-news/jobs/news-ingest/internal/config"
)

type Analyzer struct {
	geminiKey  string
	httpClient *http.Client
}

func NewAnalyzer(geminiKey string) *Analyzer {
	return &Analyzer{
		geminiKey: geminiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (a *Analyzer) Evaluate(ctx context.Context, title, summary string) string {
	text := fmt.Sprintf("%s: %s", title, summary)
	if sentiment := a.analyzeWithGemini(ctx, text); sentiment != "" {
		return titleCase(sentiment)
	}
	return "Neutral"
}

func (a *Analyzer) analyzeWithGemini(ctx context.Context, text string) string {
	prompt := fmt.Sprintf(
		"Analyze the sentiment of the following text using only one of the following: %s. %s",
		config.SentimentOptions,
		text,
	)

	payload := map[string]any{
		"contents": []map[string]any{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return ""
	}

	endpoint := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=%s",
		a.geminiKey,
	)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return ""
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil || resp.StatusCode != http.StatusOK {
		return ""
	}

	var parsed struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(respBody, &parsed); err != nil {
		return ""
	}
	if len(parsed.Candidates) == 0 || len(parsed.Candidates[0].Content.Parts) == 0 {
		return ""
	}
	return strings.TrimSpace(parsed.Candidates[0].Content.Parts[0].Text)
}

func titleCase(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	return strings.ToUpper(value[:1]) + strings.ToLower(value[1:])
}
