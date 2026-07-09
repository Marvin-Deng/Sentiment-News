package sentiment

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/sentiment-news/jobs/news-ingest/internal/config"
	"golang.org/x/time/rate"
)

const (
	geminiModel       = "gemini-3.1-flash-lite"
	maxRetries        = 5
	initialBackoffMs  = 100
	maxBackoffMs      = 32000
	rateLimitPerMin   = 15
)

type Analyzer struct {
	geminiKey  string
	httpClient *http.Client
	limiter    *rate.Limiter
}

func NewAnalyzer(geminiKey string) *Analyzer {
	// Create a rate limiter: 15 requests per minute = 0.25 requests per second
	limiter := rate.NewLimiter(rate.Limit(rateLimitPerMin)/60.0, 1)
	
	return &Analyzer{
		geminiKey: geminiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		limiter: limiter,
	}
}

func (a *Analyzer) Evaluate(ctx context.Context, title, summary string) string {
	text := fmt.Sprintf("%s: %s", title, summary)
	sentiment := a.analyzeWithGeminiRetry(ctx, text)
	if sentiment != "" {
		return titleCase(sentiment)
	}
	return "Neutral"
}

func (a *Analyzer) analyzeWithGeminiRetry(ctx context.Context, text string) string {
	var lastErr error
	
	for attempt := 0; attempt < maxRetries; attempt++ {
		// Wait for rate limit
		if err := a.limiter.Wait(ctx); err != nil {
			log.Printf("rate limiter error: %v", err)
			return ""
		}
		
		sentiment := a.analyzeWithGemini(ctx, text)
		if sentiment != "" {
			return sentiment
		}
		
		// Calculate exponential backoff
		if attempt < maxRetries-1 {
			backoffMs := initialBackoffMs * int(math.Pow(2, float64(attempt)))
			if backoffMs > maxBackoffMs {
				backoffMs = maxBackoffMs
			}
			backoff := time.Duration(backoffMs) * time.Millisecond
			log.Printf("sentiment analysis retry %d/%d after %v", attempt+1, maxRetries, backoff)
			
			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				return ""
			}
		}
	}
	
	log.Printf("sentiment analysis failed after %d attempts: %v", maxRetries, lastErr)
	return ""
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
		log.Printf("warning: failed to marshal gemini request: %v", err)
		return ""
	}

	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", geminiModel)
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
		log.Printf("warning: gemini request returned status %d: %s", resp.StatusCode, string(respBody))
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
