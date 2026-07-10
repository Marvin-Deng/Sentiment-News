package statsig

import (
	"strings"
	"testing"
)

func TestNormalizeTickersFallsBackWhenEmpty(t *testing.T) {
	got := normalizeTickers([]interface{}{}, []string{"AAPL", "MSFT"})

	if len(got) != 2 || got[0] != "AAPL" || got[1] != "MSFT" {
		t.Fatalf("expected fallback tickers, got %#v", got)
	}
}

func TestNormalizeTickersUppercases(t *testing.T) {
	got := normalizeTickers([]interface{}{"aapl", "msft"}, []string{"TSLA"})

	want := []string{"AAPL", "MSFT"}
	if len(got) != len(want) {
		t.Fatalf("expected %d tickers, got %#v", len(want), got)
	}

	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("expected %#v, got %#v", want, got)
		}
	}
}

func TestNormalizeStringsFallsBackWhenEmpty(t *testing.T) {
	got := normalizeStrings([]interface{}{}, []string{"chartmill"}, strings.ToLower)

	if len(got) != 1 || got[0] != "chartmill" {
		t.Fatalf("expected fallback values, got %#v", got)
	}
}

func TestNormalizeStringsNormalizesCase(t *testing.T) {
	got := normalizeStrings([]interface{}{"ChartMill", "Yahoo"}, []string{"other"}, strings.ToLower)

	want := []string{"chartmill", "yahoo"}
	if len(got) != len(want) {
		t.Fatalf("expected %d values, got %#v", len(want), got)
	}

	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("expected %#v, got %#v", want, got)
		}
	}
}
