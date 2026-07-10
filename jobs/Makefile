JOBS := cron/stock-price cron/news-ingest utility/cleanup-articles

.PHONY: test build fmt

test:
	@for job in $(JOBS); do \
		echo "==> $$job"; \
		(cd $$job && go test ./...) || exit 1; \
	done

build:
	@for job in $(JOBS); do \
		echo "==> $$job"; \
		(cd $$job && go build ./...) || exit 1; \
	done

fmt:
	@for job in $(JOBS); do \
		(cd $$job && gofmt -w .); \
	done
