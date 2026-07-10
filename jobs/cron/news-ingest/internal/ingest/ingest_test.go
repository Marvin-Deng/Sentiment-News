package ingest

import "testing"

func TestMentionsCompany(t *testing.T) {
	tests := []struct {
		name        string
		headline    string
		summary     string
		ticker      string
		companyName string
		want        bool
	}{
		{
			name:        "ticker in headline",
			headline:    "AAPL shares rally after earnings",
			summary:     "",
			ticker:      "AAPL",
			companyName: "Apple Inc",
			want:        true,
		},
		{
			name:        "company name without suffix in summary",
			headline:    "Big Tech rally continues",
			summary:     "Apple reported record iPhone sales this quarter.",
			ticker:      "AAPL",
			companyName: "Apple Inc",
			want:        true,
		},
		{
			name:        "no mention of ticker or company",
			headline:    "Markets rally on rate cut hopes",
			summary:     "Broad indices climbed as investors cheered the Fed's tone.",
			ticker:      "AAPL",
			companyName: "Apple Inc",
			want:        false,
		},
		{
			name:        "profile fetch failed, empty company name, ticker still matches",
			headline:    "AAPL leads gains",
			summary:     "",
			ticker:      "AAPL",
			companyName: "",
			want:        true,
		},
		{
			name:        "single-letter ticker must not match as a substring of unrelated words",
			headline:    "Exploring the top movers within the dow jones index during today's session.",
			summary:     "Discover which dow jones stocks are making waves on Friday.",
			ticker:      "V",
			companyName: "Visa Inc",
			want:        false,
		},
		{
			name:        "single-letter ticker matches as its own word",
			headline:    "V shares rally after earnings",
			summary:     "",
			ticker:      "V",
			companyName: "Visa Inc",
			want:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := mentionsCompany(tt.headline, tt.summary, tt.ticker, tt.companyName)
			if got != tt.want {
				t.Fatalf("mentionsCompany(%q, %q, %q, %q) = %v, want %v",
					tt.headline, tt.summary, tt.ticker, tt.companyName, got, tt.want)
			}
		})
	}
}

func TestCoreCompanyName(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Apple Inc", "apple"},
		{"Apple Inc.", "apple"},
		{"Microsoft Corporation", "microsoft"},
		{"Alphabet Inc.", "alphabet"},
		{"JPMorgan Chase & Co.", "jpmorgan chase &"},
		{"Tesla", "tesla"},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := coreCompanyName(tt.input)
			if got != tt.want {
				t.Fatalf("coreCompanyName(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestIsExcludedArticle(t *testing.T) {
	blacklist := []string{"chartmill"}

	tests := []struct {
		source string
		want   bool
	}{
		{"ChartMill", true},
		{"chartmill", true},
		{"  ChartMill  ", true},
		{"Yahoo", false},
		{"", false},
	}

	for _, tt := range tests {
		t.Run(tt.source, func(t *testing.T) {
			got := isExcludedArticle(tt.source, blacklist)
			if got != tt.want {
				t.Fatalf("isExcludedArticle(%q) = %v, want %v", tt.source, got, tt.want)
			}
		})
	}
}
