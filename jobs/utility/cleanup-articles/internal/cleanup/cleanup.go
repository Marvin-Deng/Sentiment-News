// Package cleanup deletes articles from Firestore matching a ticker and/or a source domain.
package cleanup

import (
	"context"
	"fmt"
	"net/url"
	"strings"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

const articlesCollection = "articles"

// Criteria selects which articles to delete. At least one field must be non-empty; when both are
// set, an article must match both (AND), not either.
type Criteria struct {
	Ticker string
	Domain string
}

// IsEmpty reports whether no delete condition was provided.
func (c Criteria) IsEmpty() bool {
	return strings.TrimSpace(c.Ticker) == "" && strings.TrimSpace(c.Domain) == ""
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

	domain := normalizeDomain(criteria.Domain)

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

		if domain != "" && !matchesDomain(doc.Data()["articleUrl"], domain) {
			continue
		}

		result.Matched++
		if _, err := doc.Ref.Delete(ctx); err != nil {
			return result, fmt.Errorf("delete article %s: %w", doc.Ref.ID, err)
		}
		result.Deleted++
	}

	return result, nil
}

func normalizeDomain(domain string) string {
	domain = strings.ToLower(strings.TrimSpace(domain))
	return strings.TrimPrefix(domain, "www.")
}

func matchesDomain(articleURL any, domain string) bool {
	raw, ok := articleURL.(string)
	if !ok || raw == "" {
		return false
	}

	parsed, err := url.Parse(raw)
	if err != nil {
		return false
	}

	host := strings.ToLower(strings.TrimPrefix(parsed.Hostname(), "www."))
	return host == domain
}
