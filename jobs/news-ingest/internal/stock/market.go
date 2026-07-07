package stock

import (
	"time"
)

func MarketDate(publication time.Time) time.Time {
	publishedDate := dateOnly(publication)
	weekday := publishedDate.Weekday()

	if weekday >= time.Saturday || (weekday == time.Friday && afterMarketClosed(publication)) {
		return nextMonday(publishedDate)
	}
	if afterMarketClosed(publication) {
		return publishedDate.AddDate(0, 0, 1)
	}
	return publishedDate
}

func afterMarketClosed(publication time.Time) bool {
	marketClose := time.Date(
		publication.Year(),
		publication.Month(),
		publication.Day(),
		21, 0, 0, 0,
		publication.Location(),
	)
	return !publication.Before(marketClose)
}

func nextMonday(date time.Time) time.Time {
	daysUntilMonday := (8 - int(date.Weekday())) % 7
	if daysUntilMonday == 0 {
		daysUntilMonday = 7
	}
	return date.AddDate(0, 0, daysUntilMonday)
}

func dateOnly(value time.Time) time.Time {
	year, month, day := value.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, value.Location())
}

func FormatPublicationDatetime(unixSeconds int64) string {
	return time.Unix(unixSeconds, 0).UTC().Format("2006-01-02 15:04:05")
}

func ParsePublicationDatetime(unixSeconds int64) time.Time {
	return time.Unix(unixSeconds, 0).UTC()
}
