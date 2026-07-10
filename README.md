# Sentiment News

## Quick Deployment (Vercel)

The fastest way to get the frontend running is to deploy `client/` to [Vercel](https://vercel.com):

1. Import the repo into Vercel and set the root directory to `client/`.
2. Add the environment variables from the [Frontend Setup](#frontend-setup) table to the Vercel project.
3. Deploy.

## Frontend Setup

The `/api/article/news` route reads articles from Firestore, so it needs a GCP project ID and a
service account key even for local development.

1. Copy the env template and fill in your project ID and service account key:

```bash
cp client/.env.example client/.env.local
```

| Variable            | Description                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`    | [GCP](https://console.cloud.google.com/welcome) project ID for Firestore                                         |
| `GCP_SA_KEY_BASE64` | Base64-encoded service account JSON key with Firestore access                                                    |
| `FINNHUB_KEY`       | [Finnhub](https://finnhub.io/dashboard) API key, used by the Stocks page's exchange/quote/company-profile routes |
| `TIINGO_TOKEN`      | [Tiingo](https://www.tiingo.com/account/api/token) API token, used by the Stocks page's end-of-day price chart   |
| `STATSIG_KEY`       | [Statsig](https://console.statsig.com/4hoMhStqn9ANMvSA3JeaC5/dynamic_configs) server secret, used to read `news-config.tickers` for default ticker lists                               |

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

All jobs live under one Go module rooted at `jobs/` (`github.com/sentiment-news/jobs`); the
recurring/cron jobs are in `jobs/cron/<name>`.

1. Install [Go 1.22+](https://go.dev/dl/).
2. Export the required environment variables (no `.env` file is read automatically — GHA sets
   these from repo secrets, so locally you need to export them yourself, e.g. via `direnv` or
   `set -a; source jobs/.env; set +a` if you keep a local `jobs/.env`):

| Variable          | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `GCP_PROJECT_ID`  | [GCP](https://console.cloud.google.com/welcome) project ID for Firestore |
| `FINNHUB_API_KEY` | [Finnhub](https://finnhub.io/dashboard) API key                          |
| `GEMINI_KEY`      | [Google Gemini](https://aistudio.google.com/api-keys) API key            |
| `TIINGO_TOKEN`    | [Tiingo](https://www.tiingo.com/account/api/token) API token             |
| `STATSIG_KEY`     | [Statsig](https://console.statsig.com/4hoMhStqn9ANMvSA3JeaC5/dynamic_configs) server secret, used to read `news-config.tickers` when available |

3. Run the news ingest job (from the `jobs/` module root):

```bash
cd jobs
go mod download
go run ./cron/news-ingest
```

Runs once and exits. On success you'll see a JSON summary in the logs.

4. Run the stock price job:

```bash
cd jobs
go run ./cron/stock-price
```

## Infra Setup (Optional, GCP)

Only needed if you want the frontend or jobs deployed to Google Cloud.

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2. Enter your GCP project ID in `infra/setup-wif.sh` (`PROJECT_ID`), then run:

```bash
./infra/setup-wif.sh
```
