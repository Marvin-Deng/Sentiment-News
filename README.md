# Sentiment News

## Infra Setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2. Enter your GCP project ID in `infra/setup-wif.sh` (`PROJECT_ID`), then run:

```bash
./infra/setup-wif.sh
```

## Frontend Setup

The `/api/article/news` route reads articles from Firestore, so it needs a GCP project ID and a
service account key even for local development.

1. Copy the env template and fill in your project ID and service account key:

```bash
cp client/.env.example client/.env.local
```

| Variable            | Description                                                                 |
| ------------------- | ---------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`    | [GCP](https://console.cloud.google.com/welcome) project ID for Firestore    |
| `GCP_SA_KEY_BASE64` | Base64-encoded service account JSON key with Firestore access               |

To generate the service account key:

```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=<service-account-email>

base64 -i key.json | tr -d '\n'
```

Paste the resulting string into `GCP_SA_KEY_BASE64`, then delete `key.json`.

2. Install and run:

```bash
cd client
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Jobs Setup

1. Install [Go 1.22+](https://go.dev/dl/).
2. Copy the env template and fill in your API keys:

```bash
cp jobs/.env.example jobs/.env
```

Required variables in `jobs/.env`:

| Variable          | Description                                                              | Used by                  |
| ----------------- | ------------------------------------------------------------------------ | ------------------------- |
| `GCP_PROJECT_ID`  | [GCP](https://console.cloud.google.com/welcome) project ID for Firestore | news-ingest, stock-price |
| `FINNHUB_API_KEY` | [Finnhub](https://finnhub.io/dashboard) API key                          | news-ingest              |
| `GEMINI_KEY`      | [Google Gemini](https://aistudio.google.com/api-keys) API key            | news-ingest              |
| `TIINGO_TOKEN`    | [Tiingo](https://www.tiingo.com/account/api/token) API token             | stock-price              |

There are two independent jobs: `news-ingest` fetches news articles and scores their sentiment;
`stock-price` fetches each ticker's end-of-day price and writes it to the same `tickers`
collection, keyed by `ticker_marketDate` so articles can join to it. `stock-price` is scheduled to
run after market close (2pm PST) since Tiingo's EOD price isn't available until then; running it
earlier just means that day's price stays unpopulated until the next scheduled run.

3. Run the news ingest job:

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

4. Run the stock price job:

```bash
cd jobs/stock-price
go mod download
go run .
```
