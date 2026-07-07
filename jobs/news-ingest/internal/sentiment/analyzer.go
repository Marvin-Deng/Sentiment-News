package sentiment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/sentiment-news/jobs/news-ingest/internal/config"
)

const (
	primaryGeminiModel  = "gemini-3-flash-preview"
	fallbackGeminiModel = "gemini-3.1-flash-lite"
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
	sentiment := a.analyzeWithGemini(ctx, primaryGeminiModel, text)
	if sentiment == "" {
		log.Printf("warning: falling back to %s for sentiment analysis", fallbackGeminiModel)
		sentiment = a.analyzeWithGemini(ctx, fallbackGeminiModel, text)
	}
	if sentiment != "" {
		return titleCase(sentiment)
	}
	return "Neutral"
}

func (a *Analyzer) analyzeWithGemini(ctx context.Context, model, text string) string {
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
		log.Printf("warning: failed to marshal gemini request: %v", err)
		return ""
	}

	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", model)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		log.Printf("warning: failed to build gemini request: %v", err)
		return ""
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", a.geminiKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		log.Printf("warning: gemini request failed: %v", err)
		return ""
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("warning: failed to read gemini response body: %v", err)
		return ""
	}
	if resp.StatusCode != http.StatusOK {
		log.Printf("warning: gemini request to %s returned status %d: %s", model, resp.StatusCode, string(respBody))
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
		log.Printf("warning: failed to unmarshal gemini response: %v", err)
		return ""
	}
	if len(parsed.Candidates) == 0 || len(parsed.Candidates[0].Content.Parts) == 0 {
		log.Printf("warning: gemini response had no candidates/parts: %s", string(respBody))
		return ""
	}

	sentiment := strings.TrimSpace(parsed.Candidates[0].Content.Parts[0].Text)
	if !isValidSentiment(sentiment) {
		log.Printf("warning: gemini returned unrecognized sentiment %q", sentiment)
		return ""
	}
	return sentiment
}

func isValidSentiment(value string) bool {
	for _, option := range strings.Split(config.SentimentOptions, ", ") {
		if strings.EqualFold(option, value) {
			return true
		}
	}
	return false
}

func titleCase(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	return strings.ToUpper(value[:1]) + strings.ToLower(value[1:])
}
