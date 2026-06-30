FROM golang:1.22-alpine AS builder

WORKDIR /src
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /news-ingest .

FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /news-ingest /news-ingest

ENTRYPOINT ["/news-ingest"]
