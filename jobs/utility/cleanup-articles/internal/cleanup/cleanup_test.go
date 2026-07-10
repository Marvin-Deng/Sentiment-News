package cleanup

import "testing"

func TestCriteriaIsEmpty(t *testing.T) {
	tests := []struct {
		name     string
		criteria Criteria
		want     bool
	}{
		{"both empty", Criteria{}, true},
		{"whitespace only", Criteria{Ticker: "  ", Source: " "}, true},
		{"ticker only", Criteria{Ticker: "AAPL"}, false},
		{"source only", Criteria{Source: "ChartMill"}, false},
		{"both set", Criteria{Ticker: "AAPL", Source: "ChartMill"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.criteria.IsEmpty(); got != tt.want {
				t.Fatalf("Criteria{%q, %q}.IsEmpty() = %v, want %v", tt.criteria.Ticker, tt.criteria.Source, got, tt.want)
			}
		})
	}
}
