package stock

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTiingoClientGetEOD(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.URL.Query().Get("token"); got != "test-token" {
			t.Errorf("expected token=test-token, got %q", got)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[{"open":100.5,"close":101.25}]`))
	}))
	defer server.Close()

	client := &TiingoClient{token: "test-token", httpClient: server.Client()}
	client.baseURL = server.URL

	prices, err := client.GetEOD(context.Background(), "AAPL", "2024-06-04")
	if err != nil {
		t.Fatalf("GetEOD returned error: %v", err)
	}
	if prices.OpenPrice == nil || *prices.OpenPrice != 100.5 {
		t.Errorf("expected open price 100.5, got %v", prices.OpenPrice)
	}
	if prices.ClosePrice == nil || *prices.ClosePrice != 101.25 {
		t.Errorf("expected close price 101.25, got %v", prices.ClosePrice)
	}
}

func TestTiingoClientGetEODEmptyResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	}))
	defer server.Close()

	client := &TiingoClient{token: "test-token", httpClient: server.Client()}
	client.baseURL = server.URL

	prices, err := client.GetEOD(context.Background(), "AAPL", "2024-06-04")
	if err != nil {
		t.Fatalf("GetEOD returned error: %v", err)
	}
	if prices.OpenPrice != nil || prices.ClosePrice != nil {
		t.Errorf("expected nil prices for empty response, got %+v", prices)
	}
}

func TestTiingoClientGetEODErrorStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`server error`))
	}))
	defer server.Close()

	client := &TiingoClient{token: "test-token", httpClient: server.Client()}
	client.baseURL = server.URL

	if _, err := client.GetEOD(context.Background(), "AAPL", "2024-06-04"); err == nil {
		t.Fatal("expected error for non-200 status, got nil")
	}
}
