FROM golang:1.22-alpine AS builder

WORKDIR /src
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /stock-price ./cron/stock-price

FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /stock-price /stock-price

ENTRYPOINT ["/stock-price"]
