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

## Cache behavior

Stream data is stored in `STREAMS_KV`. The YouTube endpoints refresh data older than 3 minutes; Twitch refreshes data older than 90 seconds. Refresh happens in the request that encounters stale data, so that request waits for the upstream APIs. Scheduled refresh is currently disabled.

## Channel configuration

The GitHub template keeps personal channel lists out of commits. Copy `src/channels_example.js` to `src/channels_local.js`, then add your channels to the three exported arrays:

```js
export const channelIDs = [
  { name: "example", channelId: "UC..." },
];

export const channelIDs2 = [
  // Optional second group for /v3/youtube/2; keep this array even if empty
];

export const twitchChannels = [
  { name: "example" }, // Twitch username, not display name
];
```

`channels_local.js` is ignored by Git and must be present when running or deploying the Worker. The extension calls both YouTube endpoints, even when `channelIDs2` is empty. Use the second list to distribute a large channel list across separate Worker requests. Both endpoints currently fetch up to three recent videos per channel.

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

Deploy the Worker with:

```bash
npm run deploy
```

## Project structure

```text
API/
|-- src/index.js             # Hono routes
|-- src/cache.js             # KV reads, writes, and refresh helpers
|-- src/channels_example.js  # Template for YouTube and Twitch channel lists
|-- src/youtubeService.js    # YouTube channel-group fetch and normalization
|-- src/youtubeService2.js   # Second YouTube channel-group fetch
|-- src/twitchService.js     # Twitch authentication and stream fetch
|-- src/wallhavenService.js  # Wallhaven search proxy
|-- wrangler.jsonc           # Worker and KV configuration
```
