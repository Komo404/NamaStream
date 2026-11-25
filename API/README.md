# NamaStream backend

The backend is a Cloudflare Worker built with Hono. It fetches YouTube and Twitch data, keeps stream responses in Cloudflare KV, and forwards wallpaper searches to Wallhaven

## Setup

You need Node.js compatible with the installed Wrangler version, a Cloudflare account, a YouTube Data API v3 key, and Twitch application credentials. The Wrangler version currently installed in this project requires Node.js 20.3 or newer

Run these commands from the repository root:

```bash
cd API
npm install
cp src/channels_example.js src/channels_local.js
```

### 1. Choose your channels

Edit `src/channels_local.js`. It exports three lists:

```js
export const channelIDs = [
  // { name: "Channel name", channelId: "UC..." },
];

export const channelIDs2 = [
  // A second YouTube group, if you have a lot of channels to add
];

export const twitchChannels = [
  // { name: "twitch_username" },
];
```

Use YouTube channel IDs and Twitch login names. Keep all three exports, even if a list is empty. `channels_local.js` is ignored by Git and must be present when running or deploying the Worker

The YouTube lists use separate endpoints to split the work across Worker requests. Each service checks up to three recent uploads per channel. The extension discovers channels from these responses and adds them to the popup automatically. Twitch channels appear in the popup after they are first seen online.

### 2. Configure local credentials and storage

Create `API/.dev.vars` with your credentials:

```dotenv
YOUTUBE_API_KEY="your_youtube_api_key"
Client_Id="your_twitch_client_id"
Client_Secret="your_twitch_client_secret"
```

This file is ignored by Git. These names are case-sensitive and match the values read by the Worker. Cloudflare explains local secret files in its [environment variables and secrets guide](https://developers.cloudflare.com/workers/local-development/environment-variables/).

In `wrangler.jsonc`, the KV binding must be named `STREAMS_KV`. The checked-in binding uses `remote: true`, which connects local development to a Cloudflare namespace. For local testing, use the following command to keep KV local too:

```bash
npm run dev -- --local
```

Use the address printed by Wrangler to try the endpoints below. No cron job is needed; stream requests refresh stale cache entries themselves. See [Cloudflare's local development guide](https://developers.cloudflare.com/workers/local-development/) for remote binding behavior.

### 3. Deploy your Worker

From the `API` directory, sign in and create your own KV namespace:

```bash
npx wrangler login
npx wrangler kv namespace create STREAMS_KV
```

Set your Worker name in `wrangler.jsonc` and replace the existing namespace ID with the ID returned by Wrangler. Keep the binding name `STREAMS_KV`.

Upload the production secrets and deploy:

```bash
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put Client_Id
npx wrangler secret put Client_Secret
npm run deploy
```

Local `.dev.vars` values are for development; configure the deployed Worker's secrets separately. The namespace command is documented in [Wrangler KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/).

### 4. Connect the extension

Replace the Worker base URL in the stream loader and wallpaper search module with your deployed address. Add the matching origin to `host_permissions` in `manifest.json`. Reload the extension and open a new tab.

The current base URL is:

```text
https://namastream.migueloliv-dev.workers.dev
```

Search for this hostname in the source to find the two frontend fetch locations. For local frontend testing, use Wrangler's local address instead and add its origin to the manifest permissions.

## Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/v3/youtube/1` | Recent YouTube videos from the first channel group |
| GET | `/v3/youtube/2` | Recent YouTube videos from the second channel group |
| GET | `/v3/twitch` | Currently live Twitch streams |
| GET | `/v3/searchwallhaven?q=<query>` | Wallpaper search results from Wallhaven |

The stream endpoints return JSON arrays. YouTube responses include regular uploads and finished streams as well as live and scheduled streams. The frontend chooses which videos to display.

Each YouTube video contains `id`, `title`, `channelId`, `channel`, `thumbnailMax`, `thumbnailHigh`, `concurrentViewers`, `actualStartTime`, `actualEndTime`, and `scheduledStartTime`. Optional data is returned as `null` when unavailable.

Each Twitch stream contains `login`, `name`, `title`, `viewers`, and `thumbnail`. Channel controls use `login` as the identifier.

A successful wallpaper response uses Wallhaven's response format. A missing `q` returns HTTP 400. Unhandled route errors return HTTP 500 with `error` and `message` fields. Some upstream failures are handled inside the services and may instead produce partial or empty results.

## Cache behavior

Stream responses are stored in `STREAMS_KV`. YouTube entries are considered stale after three minutes; Twitch entries after 90 seconds. A request that finds stale data waits for a refresh before returning it. These are refresh thresholds, not background polling intervals. Scheduled refresh is disabled.

## Code map

- `src/index.js`: routes and HTTP responses.
- `src/cache.js`: KV reads, writes, and refresh helpers.
- `src/youtubeService.js` and `src/youtubeService2.js`: playlist lookups and video details.
- `src/twitchService.js`: Twitch authentication and live streams.
- `src/wallhavenService.js`: wallpaper search.

For the frontend flow, see [How NamaStream works](../docs/architecture.md).
