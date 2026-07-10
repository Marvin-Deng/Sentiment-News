FROM golang:1.22-alpine AS builder

WORKDIR /src
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /news-ingest ./cron/news-ingest
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /installplaywright ./cron/news-ingest/playwright

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /installplaywright /installplaywright

# Must run here, not in the alpine builder stage, so deps install against this image's distro.
RUN /installplaywright && rm /installplaywright

COPY --from=builder /news-ingest /news-ingest

ENTRYPOINT ["/news-ingest"]
