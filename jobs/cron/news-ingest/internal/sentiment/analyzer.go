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
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/sentiment-news/jobs/cron/news-ingest/internal/config"
	"golang.org/x/time/rate"
)

const (
	geminiModel          = "gemini-3.1-flash-lite"
	geminiQuotaPerMin    = 15
	rateLimitUtilization = 0.75
	maxRetries           = 5
	initialBackoffMs     = 1000
	maxBackoffMs         = 32000
	rateLimitRetryMargin = 3 * time.Second
	defaultRateLimitWait = 20 * time.Second
)

var (
	retryInMessagePattern = regexp.MustCompile(`(?i)retry in ([0-9]+(?:\.[0-9]+)?)s`)
	sentimentPattern      = buildSentimentPattern()
	jsonObjectPattern     = regexp.MustCompile(`(?s)\{.*\}`)
)

type Stats struct {
	RateLimitHits      int64
	UnrecognizedErrors int64
}

type Analyzer struct {
	geminiKey          string
	httpClient         *http.Client
	limiter            *rate.Limiter
	pauseMu            sync.Mutex
	pausedUntil        time.Time
	rateLimitHits      atomic.Int64
	unrecognizedErrors atomic.Int64
}

type Evaluation struct {
	Sentiment string
	Reasoning string
}

type analyzeOutcome struct {
	evaluation  Evaluation
	rateLimited bool
	retryAfter  time.Duration
	retryable   bool
}

func NewAnalyzer(geminiKey string) *Analyzer {
	requestsPerMin := int(math.Floor(geminiQuotaPerMin * rateLimitUtilization))
	if requestsPerMin < 1 {
		requestsPerMin = 1
	}

	return &Analyzer{
		geminiKey: geminiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		limiter: rate.NewLimiter(rate.Every(time.Minute/time.Duration(requestsPerMin)), 1),
	}
}

func (a *Analyzer) Stats() Stats {
	return Stats{
		RateLimitHits:      a.rateLimitHits.Load(),
		UnrecognizedErrors: a.unrecognizedErrors.Load(),
	}
}

func (a *Analyzer) Evaluate(ctx context.Context, title, summary string) Evaluation {
	text := fmt.Sprintf("%s: %s", title, summary)
	evaluation := a.analyzeWithGeminiRetry(ctx, text)
	if evaluation.Sentiment != "" {
		evaluation.Sentiment = titleCase(evaluation.Sentiment)
		return evaluation
	}
	return Evaluation{Sentiment: "Neutral"}
}

func (a *Analyzer) analyzeWithGeminiRetry(ctx context.Context, text string) Evaluation {
	for attempt := 0; attempt < maxRetries; attempt++ {
		if err := a.waitForQuota(ctx); err != nil {
			log.Printf("rate limiter error: %v", err)
			return Evaluation{}
		}

		outcome := a.analyzeWithGemini(ctx, text)
		if outcome.evaluation.Sentiment != "" {
			return outcome.evaluation
		}

		if outcome.rateLimited {
			wait := outcome.retryAfter
			if wait <= 0 {
				wait = defaultRateLimitWait
			}
			a.pauseForRateLimit(wait)
			log.Printf("gemini rate limited, pausing %v before retry %d/%d", wait, attempt+1, maxRetries)
			continue
		}

		if outcome.retryable && attempt < maxRetries-1 {
			backoffMs := initialBackoffMs * int(math.Pow(2, float64(attempt)))
			if backoffMs > maxBackoffMs {
				backoffMs = maxBackoffMs
			}
			backoff := time.Duration(backoffMs) * time.Millisecond
			log.Printf("sentiment analysis retry %d/%d after %v", attempt+1, maxRetries, backoff)

			select {
			case <-time.After(backoff):
			case <-ctx.Done():
				return Evaluation{}
			}
			continue
		}

		return Evaluation{}
	}

	log.Printf("sentiment analysis failed after %d attempts", maxRetries)
	return Evaluation{}
}

func (a *Analyzer) waitForQuota(ctx context.Context) error {
	a.pauseMu.Lock()
	pauseUntil := a.pausedUntil
	a.pauseMu.Unlock()

	if wait := time.Until(pauseUntil); wait > 0 {
		log.Printf("gemini quota pause active, waiting %v", wait.Round(time.Millisecond))
		select {
		case <-time.After(wait):
		case <-ctx.Done():
			return ctx.Err()
		}
	}

	return a.limiter.Wait(ctx)
}

func (a *Analyzer) pauseForRateLimit(wait time.Duration) {
	a.pauseMu.Lock()
	defer a.pauseMu.Unlock()

	next := time.Now().Add(wait)
	if next.After(a.pausedUntil) {
		a.pausedUntil = next
	}
}

func (a *Analyzer) analyzeWithGemini(ctx context.Context, text string) analyzeOutcome {
	prompt := fmt.Sprintf(
		"Analyze the sentiment of the following news text.\n"+
			`- "sentiment": exactly one word from this list: %s`+"\n"+
			`- "reasoning": a short blurb (200 words or fewer) explaining how impactful this article is `+
			"and the reasoning behind the sentiment classification\n\n"+
			"Text: %s",
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
		"generationConfig": map[string]any{
			"temperature":      0,
			"maxOutputTokens":  512,
			"responseMimeType": "application/json",
			"responseSchema": map[string]any{
				"type": "object",
				"properties": map[string]any{
					"sentiment": map[string]any{"type": "string"},
					"reasoning": map[string]any{"type": "string"},
				},
				"required": []string{"sentiment", "reasoning"},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		log.Printf("warning: failed to marshal gemini request: %v", err)
		return analyzeOutcome{}
	}

	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent", geminiModel)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		log.Printf("warning: failed to build gemini request: %v", err)
		return analyzeOutcome{}
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-goog-api-key", a.geminiKey)

	resp, err := a.httpClient.Do(req)
	if err != nil {
		log.Printf("warning: gemini request failed: %v", err)
		return analyzeOutcome{retryable: true}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("warning: failed to read gemini response body: %v", err)
		return analyzeOutcome{retryable: true}
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		a.rateLimitHits.Add(1)
		wait := parseRateLimitRetryAfter(respBody) + rateLimitRetryMargin
		log.Printf("warning: gemini rate limit hit, backing off for %v", wait.Round(time.Millisecond))
		return analyzeOutcome{rateLimited: true, retryAfter: wait}
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("warning: gemini request returned status %d: %s", resp.StatusCode, string(respBody))
		return analyzeOutcome{retryable: resp.StatusCode >= 500}
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
		return analyzeOutcome{retryable: true}
	}
	if len(parsed.Candidates) == 0 || len(parsed.Candidates[0].Content.Parts) == 0 {
		log.Printf("warning: gemini response had no candidates/parts: %s", string(respBody))
		return analyzeOutcome{}
	}

	raw := strings.TrimSpace(parsed.Candidates[0].Content.Parts[0].Text)
	evaluation := parseEvaluation(raw)
	if evaluation.Sentiment == "" {
		a.unrecognizedErrors.Add(1)
		log.Printf("warning: gemini returned unrecognized sentiment %q", raw)
		return analyzeOutcome{}
	}

	return analyzeOutcome{evaluation: evaluation}
}

func parseRateLimitRetryAfter(body []byte) time.Duration {
	var errResp struct {
		Error struct {
			Message string            `json:"message"`
			Details []json.RawMessage `json:"details"`
		} `json:"error"`
	}
	if err := json.Unmarshal(body, &errResp); err != nil {
		return defaultRateLimitWait
	}

	if wait := parseRetryInMessage(errResp.Error.Message); wait > 0 {
		return wait
	}

	for _, detail := range errResp.Error.Details {
		var retryInfo struct {
			Type       string `json:"@type"`
			RetryDelay string `json:"retryDelay"`
		}
		if err := json.Unmarshal(detail, &retryInfo); err != nil {
			continue
		}
		if !strings.Contains(retryInfo.Type, "RetryInfo") {
			continue
		}
		if wait := parseRetryDelay(retryInfo.RetryDelay); wait > 0 {
			return wait
		}
	}

	return defaultRateLimitWait
}

func parseRetryInMessage(message string) time.Duration {
	match := retryInMessagePattern.FindStringSubmatch(message)
	if len(match) < 2 {
		return 0
	}

	seconds, err := time.ParseDuration(match[1] + "s")
	if err != nil {
		return 0
	}
	return seconds
}

func parseRetryDelay(raw string) time.Duration {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return 0
	}
	if !strings.HasSuffix(raw, "s") {
		raw += "s"
	}

	wait, err := time.ParseDuration(raw)
	if err != nil {
		return 0
	}
	return wait
}

func sentimentOptions() []string {
	return strings.Split(config.SentimentOptions, ", ")
}

func buildSentimentPattern() *regexp.Regexp {
	options := sentimentOptions()
	quoted := make([]string, len(options))
	for i, option := range options {
		quoted[i] = regexp.QuoteMeta(option)
	}

	return regexp.MustCompile(`(?i)\b(` + strings.Join(quoted, "|") + `)\b`)
}

// parseEvaluation extracts {sentiment, reasoning} from the model's reply. Gemini sometimes wraps
// the JSON in markdown code fences despite being told not to, so the object is located with a
// regex before unmarshaling rather than assuming raw is a bare JSON document.
func parseEvaluation(raw string) Evaluation {
	jsonMatch := jsonObjectPattern.FindString(raw)
	if jsonMatch == "" {
		return Evaluation{}
	}

	var parsed struct {
		Sentiment string `json:"sentiment"`
		Reasoning string `json:"reasoning"`
	}
	if err := json.Unmarshal([]byte(jsonMatch), &parsed); err != nil {
		return Evaluation{}
	}

	sentimentMatch := sentimentPattern.FindStringSubmatch(parsed.Sentiment)
	if len(sentimentMatch) < 2 {
		return Evaluation{}
	}

	for _, option := range sentimentOptions() {
		if strings.EqualFold(sentimentMatch[1], option) {
			return Evaluation{Sentiment: option, Reasoning: strings.TrimSpace(parsed.Reasoning)}
		}
	}
	return Evaluation{}
}

func titleCase(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}
	return strings.ToUpper(value[:1]) + strings.ToLower(value[1:])
}
