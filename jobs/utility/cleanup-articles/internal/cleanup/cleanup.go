// Package cleanup deletes articles from Firestore matching a ticker, a Finnhub source name,
// and/or a publication date cutoff.
package cleanup

import (
	"context"
	"fmt"
	"strings"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

const articlesCollection = "articles"

// Criteria selects which articles to delete. At least one field must be non-empty; when multiple
// are set, an article must match all of them (AND), not any.
//
// Before is a "YYYY-MM-DD" cutoff: articles published on or after that date are kept, everything
// earlier is deleted.
type Criteria struct {
	Ticker string
	Source string
	Before string
}

// IsEmpty reports whether no delete condition was provided.
func (c Criteria) IsEmpty() bool {
	return strings.TrimSpace(c.Ticker) == "" &&
		strings.TrimSpace(c.Source) == "" &&
		strings.TrimSpace(c.Before) == ""
}

type Result struct {
	Matched int
	Deleted int
}

// Run deletes every article matching criteria and returns how many were matched/deleted.
// Callers should check criteria.IsEmpty() first and skip calling Run entirely in that case.
func Run(ctx context.Context, client *firestore.Client, criteria Criteria) (Result, error) {
	query := client.Collection(articlesCollection).Query
	if ticker := strings.TrimSpace(criteria.Ticker); ticker != "" {
		query = query.Where("ticker", "==", ticker)
	}
	if source := strings.TrimSpace(criteria.Source); source != "" {
		query = query.Where("source", "==", source)
	}
	if before := strings.TrimSpace(criteria.Before); before != "" {
		query = query.Where("publicationDatetime", "<", before+" 00:00:00")
	}

	iter := query.Documents(ctx)
	defer iter.Stop()

	var result Result
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return result, fmt.Errorf("list articles: %w", err)
		}

		result.Matched++
		if _, err := doc.Ref.Delete(ctx); err != nil {
			return result, fmt.Errorf("delete article %s: %w", doc.Ref.ID, err)
		}
		result.Deleted++
	}

	return result, nil
}
