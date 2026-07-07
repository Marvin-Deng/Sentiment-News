package stock

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFinnhubClientGetEOD(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.URL.Query().Get("token"); got != "test-token" {
			t.Errorf("expected token=test-token, got %q", got)
		}
		if got := r.URL.Query().Get("symbol"); got != "AAPL" {
			t.Errorf("expected symbol=AAPL, got %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"o":100.5,"c":102.75,"pc":99.0}`))
	}))
	defer server.Close()

	client := &FinnhubClient{token: "test-token", httpClient: server.Client(), baseURL: server.URL}

	prices, err := client.GetEOD(context.Background(), "AAPL")
	if err != nil {
		t.Fatalf("GetEOD returned error: %v", err)
	}
	if prices.OpenPrice == nil || *prices.OpenPrice != 100.5 {
		t.Errorf("expected open price 100.5, got %v", prices.OpenPrice)
	}
	if prices.ClosePrice == nil || *prices.ClosePrice != 102.75 {
		t.Errorf("expected close price 102.75, got %v", prices.ClosePrice)
	}
}

func TestFinnhubClientGetEODErrorStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`invalid token`))
	}))
	defer server.Close()

	client := &FinnhubClient{token: "bad-token", httpClient: server.Client(), baseURL: server.URL}

	if _, err := client.GetEOD(context.Background(), "AAPL"); err == nil {
		t.Fatal("expected error for non-200 status, got nil")
	}
}
