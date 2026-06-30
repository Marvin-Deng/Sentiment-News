# Sentiment News

## Frontend Setup

```bash
cd client
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Jobs

The `jobs/news-ingest` job fetches news from Finnhub, analyzes sentiment, and upserts articles and tickers to Firestore.

### Setup

1. Install [Go 1.22+](https://go.dev/dl/).
2. Copy the env template and fill in your API keys:

```bash
cp jobs/.env.example jobs/.env
```

Required variables in `jobs/.env`:

| Variable          | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `GCP_PROJECT_ID`  | [GCP](https://console.cloud.google.com/welcome) project ID for Firestore |
| `FINNHUB_API_KEY` | [Finnhub](https://finnhub.io/dashboard) API key                          |
| `GEMINI_KEY`      | [Google Gemini](https://aistudio.google.com/api-keys) API key            |
| `TIINGO_TOKEN`    | [Tiingo](https://www.tiingo.com/account/api/token) API token             |

### Run the news ingest job

```bash
cd jobs/news-ingest
go mod download
go run .
```

The job loads `jobs/.env` automatically, runs once, and exits. On success you'll see a JSON summary in the logs.

To test with a single ticker:

```bash
cd jobs/news-ingest
TICKERS=AAPL go run .
```

### Run with Docker

```bash
cd jobs/news-ingest
docker build -t news-ingest .

docker run --rm --env-file ../.env news-ingest
```
