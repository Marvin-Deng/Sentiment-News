package sentiment

import (
	"testing"
	"time"
)

func TestParseEvaluation(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		wantSentiment string
		wantReasoning string
	}{
		{
			name:          "bare json",
			input:         `{"sentiment": "Negative", "reasoning": "Reports a significant decline in stock value."}`,
			wantSentiment: "Negative",
			wantReasoning: "Reports a significant decline in stock value.",
		},
		{
			name:          "json wrapped in markdown fence",
			input:         "```json\n{\"sentiment\": \"Optimistic\", \"reasoning\": \"Strong earnings beat.\"}\n```",
			wantSentiment: "Optimistic",
			wantReasoning: "Strong earnings beat.",
		},
		{
			name:          "case insensitive sentiment",
			input:         `{"sentiment": "optimistic", "reasoning": "Positive outlook."}`,
			wantSentiment: "Optimistic",
			wantReasoning: "Positive outlook.",
		},
		{
			name:          "json with surrounding prose",
			input:         "Here is the result:\n{\"sentiment\": \"Stable\", \"reasoning\": \"No major impact expected.\"}\nThanks.",
			wantSentiment: "Stable",
			wantReasoning: "No major impact expected.",
		},
		{
			name:          "unrecognized sentiment value",
			input:         `{"sentiment": "Somewhat bullish", "reasoning": "Mixed signals."}`,
			wantSentiment: "",
			wantReasoning: "",
		},
		{
			name:          "not json",
			input:         "Somewhat bullish overall",
			wantSentiment: "",
			wantReasoning: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseEvaluation(tt.input)
			if got.Sentiment != tt.wantSentiment {
				t.Fatalf("parseEvaluation(%q).Sentiment = %q, want %q", tt.input, got.Sentiment, tt.wantSentiment)
			}
			if got.Reasoning != tt.wantReasoning {
				t.Fatalf("parseEvaluation(%q).Reasoning = %q, want %q", tt.input, got.Reasoning, tt.wantReasoning)
			}
		})
	}
}

func TestParseRateLimitRetryAfter(t *testing.T) {
	body := []byte(`{
		"error": {
			"message": "Please retry in 19.553864137s.",
			"details": [
				{
					"@type": "type.googleapis.com/google.rpc.RetryInfo",
					"retryDelay": "19s"
				}
			]
		}
	}`)

	got := parseRateLimitRetryAfter(body)
	if got < 19*time.Second || got > 20*time.Second {
		t.Fatalf("parseRateLimitRetryAfter() = %v, want about 19.55s", got)
	}
}
