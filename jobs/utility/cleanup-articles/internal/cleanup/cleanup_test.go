package cleanup

import "testing"

func TestCriteriaIsEmpty(t *testing.T) {
	tests := []struct {
		name     string
		criteria Criteria
		want     bool
	}{
		{"all empty", Criteria{}, true},
		{"whitespace only", Criteria{Ticker: "  ", Source: " ", Before: " "}, true},
		{"ticker only", Criteria{Ticker: "AAPL"}, false},
		{"source only", Criteria{Source: "ChartMill"}, false},
		{"before only", Criteria{Before: "2026-01-01"}, false},
		{"all set", Criteria{Ticker: "AAPL", Source: "ChartMill", Before: "2026-01-01"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.criteria.IsEmpty(); got != tt.want {
				t.Fatalf("Criteria{%q, %q, %q}.IsEmpty() = %v, want %v",
					tt.criteria.Ticker, tt.criteria.Source, tt.criteria.Before, got, tt.want)
			}
		})
	}
}
