package sentiment

import (
	"testing"
	"time"
)

func TestParseSentiment(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "exact label",
			input: "Negative",
			want:  "Negative",
		},
		{
			name:  "markdown bold only",
			input: "**Optimistic**",
			want:  "Optimistic",
		},
		{
			name:  "markdown bold with explanation",
			input: "**Cautious**\n\n**Why:** The text advises against chasing high-yield strategies.",
			want:  "Cautious",
		},
		{
			name:  "markdown bold negative with reasoning",
			input: "**Negative**\n\n**Reasoning:** The text describes a significant decline in stock value.",
			want:  "Negative",
		},
		{
			name:  "markdown bold inconsistent with reasoning",
			input: "**Inconsistent**\n\n**Reasoning:** The text highlights a clear contradiction.",
			want:  "Inconsistent",
		},
		{
			name:  "case insensitive",
			input: "optimistic",
			want:  "Optimistic",
		},
		{
			name:  "label embedded in sentence",
			input: "Sentiment: Stable",
			want:  "Stable",
		},
		{
			name:  "sentiment prefix with markdown",
			input: "Sentiment: **Positive**\n\n**Reasoning:** The text uses the word \"cheered.\"",
			want:  "Positive",
		},
		{
			name:  "unrecognized response",
			input: "Somewhat bullish overall",
			want:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseSentiment(tt.input)
			if got != tt.want {
				t.Fatalf("parseSentiment(%q) = %q, want %q", tt.input, got, tt.want)
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
