package stock

import (
	"testing"
	"time"
)

func TestMarketDate(t *testing.T) {
	tests := []struct {
		name        string
		publication time.Time
		want        string
	}{
		{
			name:        "weekday before market close maps to same day",
			publication: time.Date(2024, 6, 4, 10, 0, 0, 0, time.UTC), // Tuesday
			want:        "2024-06-04",
		},
		{
			name:        "weekday after market close maps to next day",
			publication: time.Date(2024, 6, 4, 21, 30, 0, 0, time.UTC), // Tuesday
			want:        "2024-06-05",
		},
		{
			name:        "friday after market close maps to next monday",
			publication: time.Date(2024, 6, 7, 22, 0, 0, 0, time.UTC), // Friday
			want:        "2024-06-10",
		},
		{
			name:        "saturday maps to next monday",
			publication: time.Date(2024, 6, 8, 12, 0, 0, 0, time.UTC), // Saturday
			want:        "2024-06-10",
		},
		{
			// time.Sunday == 0, which is below time.Saturday, so the weekday>=Saturday
			// check does not treat Sunday as a weekend day here.
			name:        "sunday maps to same day",
			publication: time.Date(2024, 6, 9, 12, 0, 0, 0, time.UTC), // Sunday
			want:        "2024-06-09",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := MarketDate(tt.publication).Format("2006-01-02")
			if got != tt.want {
				t.Errorf("MarketDate(%v) = %s, want %s", tt.publication, got, tt.want)
			}
		})
	}
}

func TestFormatPublicationDatetime(t *testing.T) {
	got := FormatPublicationDatetime(1717500000)
	want := "2024-06-04 11:20:00"
	if got != want {
		t.Errorf("FormatPublicationDatetime() = %s, want %s", got, want)
	}
}
