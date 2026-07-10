package cleanup

import "testing"

func TestCriteriaIsEmpty(t *testing.T) {
	tests := []struct {
		name     string
		criteria Criteria
		want     bool
	}{
		{"both empty", Criteria{}, true},
		{"whitespace only", Criteria{Ticker: "  ", Domain: " "}, true},
		{"ticker only", Criteria{Ticker: "AAPL"}, false},
		{"domain only", Criteria{Domain: "chartmill.com"}, false},
		{"both set", Criteria{Ticker: "AAPL", Domain: "chartmill.com"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.criteria.IsEmpty(); got != tt.want {
				t.Fatalf("Criteria{%q, %q}.IsEmpty() = %v, want %v", tt.criteria.Ticker, tt.criteria.Domain, got, tt.want)
			}
		})
	}
}

func TestMatchesDomain(t *testing.T) {
	tests := []struct {
		name       string
		articleURL any
		domain     string
		want       bool
	}{
		{"exact host match", "https://chartmill.com/article", "chartmill.com", true},
		{"www prefix stripped from article host", "https://www.chartmill.com/article", "chartmill.com", true},
		{"www prefix stripped from domain filter", "https://chartmill.com/article", "www.chartmill.com", true},
		{"different host", "https://finance.yahoo.com/news", "chartmill.com", false},
		{"non-string value", 12345, "chartmill.com", false},
		{"empty value", "", "chartmill.com", false},
		{"unparseable url", "://bad", "chartmill.com", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := matchesDomain(tt.articleURL, normalizeDomain(tt.domain))
			if got != tt.want {
				t.Fatalf("matchesDomain(%v, %q) = %v, want %v", tt.articleURL, tt.domain, got, tt.want)
			}
		})
	}
}
