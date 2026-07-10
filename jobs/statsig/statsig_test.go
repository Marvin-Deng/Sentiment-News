package statsig

import "testing"

func TestNormalizeTickersFallsBackWhenEmpty(t *testing.T) {
	got := normalizeTickers([]interface{}{"", "   "}, []string{"AAPL", "MSFT"})

	if len(got) != 2 || got[0] != "AAPL" || got[1] != "MSFT" {
		t.Fatalf("expected fallback tickers, got %#v", got)
	}
}

func TestNormalizeTickersSanitizesAndDeduplicates(t *testing.T) {
	got := normalizeTickers([]interface{}{" aapl ", "msft", "AAPL", "NVDA"}, []string{"TSLA"})

	want := []string{"AAPL", "MSFT", "NVDA"}
	if len(got) != len(want) {
		t.Fatalf("expected %d tickers, got %#v", len(want), got)
	}

	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("expected %#v, got %#v", want, got)
		}
	}
}
