# Sentiment News

## Infra Setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2. Enter your GCP project ID in `infra/setup-wif.sh` (`PROJECT_ID`), then run:

```bash
./infra/setup-wif.sh
```

## Frontend Setup

The `/api/article/news` route reads articles from Firestore, so it needs a GCP project ID and
credentials even for local development.

1. Copy the env template and fill in your project ID:

```bash
cp client/.env.example client/.env.local
```

| Variable         | Description                                                              |
| ---------------- | ------------------------------------------------------------------------- |
| `GCP_PROJECT_ID` | [GCP](https://console.cloud.google.com/welcome) project ID for Firestore |

2. Authenticate with Application Default Credentials so the Firestore client can find them:

```bash
gcloud auth application-default login
```

3. Install and run:

```bash
cd client
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Using the Firestore emulator instead

If you'd rather not authenticate against real GCP for local development, run against the
Firestore emulator instead:

```bash
gcloud components install cloud-firestore-emulator
```

In one terminal, start the emulator:

```bash
cd client
npm run emulator
```

In another terminal, seed it with sample data and start the app pointed at the emulator:

```bash
cd client
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run emulator:seed
npm run dev
```

`FIRESTORE_EMULATOR_HOST` must be set in the same shell that runs `npm run dev` (or added to
`client/.env.local`) so the Next.js server picks it up. No `GCP_PROJECT_ID` or `gcloud auth` is
needed in this mode.

## Jobs Setup

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

### Run with Docker

```bash
cd jobs/news-ingest
docker build -t news-ingest .

docker run --rm --env-file ../.env news-ingest
```
