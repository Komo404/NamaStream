# NamaStream API

The API is a Cloudflare Worker built with Hono. It fetches and normalizes stream data from YouTube and Twitch, stores the results in Cloudflare KV, and proxies wallpaper searches through Wallhaven.

## Endpoints

All endpoints are served by the deployed Worker at:

```text
https://namastream.migueloliv-dev.workers.dev
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v3/youtube/1` | Cached YouTube live and scheduled streams for channel group 1 |
| `GET` | `/v3/youtube/2` | Cached YouTube live and scheduled streams for channel group 2 |
| `GET` | `/v3/twitch` | Cached live Twitch streams |
| `GET` | `/v3/searchwallhaven?q=<query>` | Searches Wallhaven for anime wallpapers |

The stream endpoints return normalized JSON arrays. The Wallhaven endpoint returns the upstream Wallhaven search response. A missing `q` parameter returns `400`.

## Caching and scheduled refresh

Stream data is stored in the `STREAMS_KV` namespace. Each stream endpoint refreshes stale data when the cached result is older than 90 seconds. The Worker also has a scheduled trigger configured in `wrangler.jsonc` to request all three stream endpoints every seven minutes.

## Requirements

- Node.js 18 or newer
- A Cloudflare account with Workers and KV enabled
- A YouTube Data API v3 key
- Twitch application credentials

## Local development

Install the Worker dependencies:

```bash
cd API
npm install
```

Store the required secrets in Wrangler:

```bash
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put Client_Id
npx wrangler secret put Client_Secret
```

Start the local Worker:

```bash
npm run dev
```

To test the scheduled handler locally, start Wrangler with the scheduled flag and request the local scheduled endpoint:

```bash
npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled"
```

Deploy the Worker with:

```bash
npm run deploy
```

## Project structure

```text
API/
├── src/index.ts             # Hono routes and scheduled handler
├── src/cache.js             # KV reads, writes, and refresh helpers
├── src/youtubeService.js    # YouTube channel-group fetch and normalization
├── src/youtubeService2.js   # Second YouTube channel-group fetch
├── src/twitchService.js     # Twitch authentication and stream fetch
├── src/wallhavenService.js  # Wallhaven search proxy
├── wrangler.jsonc           # Worker, KV, and cron configuration
└── tsconfig.json             # TypeScript configuration
```