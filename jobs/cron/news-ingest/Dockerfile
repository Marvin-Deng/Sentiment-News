FROM golang:1.25-alpine AS builder

WORKDIR /src
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /news-ingest ./cron/news-ingest
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /installplaywright ./cron/news-ingest/playwright

FROM debian:bookworm-slim

# The playwright-go driver zip is no longer served by any upstream CDN mirror (all return 404), so
# the driver must come from the equivalent npm package instead. This pins the exact version
# playwright-go v0.5700.1 expects (see playwrightCliVersion in its run.go) — bump both together.
ENV PLAYWRIGHT_DRIVER_VERSION=1.57.0
ENV PLAYWRIGHT_DRIVER_PATH=/opt/playwright-driver
ENV PLAYWRIGHT_NODEJS_PATH=/usr/bin/node

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends \
        nodejs \
        libglib2.0-0 \
        libnspr4 \
        libnss3 \
        libdbus-1-3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libxcb1 \
        libxkbcommon0 \
        libatspi2.0-0 \
        libx11-6 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libcairo2 \
        libpango-1.0-0 \
        libasound2 && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p "$PLAYWRIGHT_DRIVER_PATH/package" && \
    npm install --prefix /tmp/playwright-vendor "playwright@${PLAYWRIGHT_DRIVER_VERSION}" && \
    cp -R /tmp/playwright-vendor/node_modules/playwright/. "$PLAYWRIGHT_DRIVER_PATH/package/" && \
    cp -R /tmp/playwright-vendor/node_modules "$PLAYWRIGHT_DRIVER_PATH/package/node_modules" && \
    rm -rf /tmp/playwright-vendor

COPY --from=builder /installplaywright /installplaywright

# Must run here, not in the alpine builder stage, so deps install against this image's distro.
RUN /installplaywright && rm /installplaywright

COPY --from=builder /news-ingest /news-ingest

ENTRYPOINT ["/news-ingest"]
