## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm install -g wrangler`
- A Google Cloud project with YouTube Data API v3 enabled
- A Cloudflare account (free tier)
- A Twitch developer account

### Setup

```bash
git clone https://github.com/komo404/NamaStream.git
cd NamaStream

cd API
npm install

wrangler secret put YOUTUBE_API_KEY
wrangler secret put Client_Id
wrangler secret put Client_Secret
```

## Channel setup

- Copy `API/src/channels_example.js` to `API/src/channels_local.js`, then add YouTube channels to `channelIDs` and Twitch usernames to `twitchChannels`.
- Keep `channelIDs2` in the file even if it is empty. Use it to split a large YouTube channel list across both endpoints; the extension calls both endpoints.
- Add your channels to the popup list if you want per-channel enable, disable, and pin controls.
- Deploy your Worker and update the URLs and host permissions

### Running locally

```bash
cd API
npm run dev
```

To load the extension in Firefox:
1. Open `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json` from the root of this repo

To load the extension in Chrome:
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the root of this repo

Both browsers use the same `manifest.json` and extension files.

---