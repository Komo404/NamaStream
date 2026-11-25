# NamaStream · Live Stream Dashboard

> A web extension that replaces your browser's default new tab with a real-time dashboard of live streams and upcoming schedules. Powered by the YouTube and Twitch APIs.

![License](https://img.shields.io/github/license/komo404/namastream)
![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)

---

![Demonstration](./assets/template-preview.png)

*Template preview (layout may differ between versions)*

---

## Features

- **Live streams panel**: channels currently live on YouTube, with thumbnails, titles, and viewer counts
- **Upcoming streams panel**: Scheduled streams sorted by start time, with localized countdowns
- **Twitch panel**: channels currently live on Twitch
- **Weather widget**: Current conditions, feels-like, humidity and wind speed based on your location; supports manual city search
- **Custom new tab**: Replaces the new tab in Firefox and Chrome with a full-screen dashboard and custom wallpaper support
- **Popup settings**: Pin or disable discovered channels, toggle widgets and bars, and adjust the layout
- **YouTube previews**: Hover over thumbnails or use theater mode to watch up to four live streams together

### How it is built

The extension uses only HTML, CSS and JavaScript modules. A Cloudflare Worker fetches YouTube and Twitch data and caches stream responses in KV. The dashboard handles filtering, layout, and browser storage

Channel lists are configured in the backend. The popup learns channels from stream responses, so the frontend does not need a second manual list

---

## Roadmap

- [x] Scrollable stream bars (v1.1)
- [x] Wallpaper picker with local storage (v1.1)
- [x] Twitch live stream support (v1.21)
- [x] Per-channel enable/disable and pin (v1.21)
- [x] Weather widget with geolocation and city search (v1.3)
- [x] Reposition mode: drag bars freely (v1.3)
- [x] Resizable bars (v1.3)
- [x] Layout options: toggle logo, search bar, individual stream bars (v1.3)
- [x] Twitch channel disable/pin (V1.3.1)
- [x] Wallpaper Site Integration (V1.3.1)
- [x] Vertical Twitch bar layout (v1.3.2)
- [x] Live preview on thumbnail hover (v1.3.3)
- [x] Client startup and asset-loading optimizations (v1.3.4)
- [x] Chrome support (v1.35)
- [x] Configurable hover-preview behavior (v1.35)

## Technology

| Layer | Tech |
|---|---|
| Extension | HTML · CSS · Vanilla JS |
| Backend | Cloudflare Workers · Hono · JavaScript |
| Cache | Cloudflare KV |
| APIs | YouTube Data API v3 · Twitch API · Wallhaven · Open-Meteo · Nominatim |

---

## Third-party services

### YouTube Data API
This extension uses the [YouTube Data API v3](https://developers.youtube.com/youtube/v3). By using NamaStream, you agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms).

### Twitch API
This extension uses the [Twitch API](https://dev.twitch.tv/docs/api/). By using NamaStream, you agree to the [Twitch Developer Agreement](https://legal.twitch.com/legal/developer-agreement/).

### Wallpaper and weather services
Wallpaper search uses [Wallhaven](https://wallhaven.cc/). Weather data uses [Open-Meteo](https://open-meteo.com/), and automatic location names use [Nominatim](https://nominatim.org/) from OpenStreetMap. The stream hover preview uses the configured preview proxy shown in `newtab/features/streams/preview.js`.

---

## Documentation

- [Getting started](./docs/guide.md): load the extension and use its controls
- [How NamaStream works](./docs/architecture.md): Architecture, extension flow and saved settings
- [Backend setup and API](./API/README.md): configure channels, credentials, storage, and deployment
- [Privacy Policy](./PRIVACY.md)
- [Changelog](./CHANGELOG.md)
- [License](./LICENSE)

### Weather icons

The SVGs in `assets/weather/` are copied from Firefox's weather resources and are licensed under the [Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/). Their original license notices are preserved in each file.

---
*NamaStream is an independent project not affiliated with or endorsed by YouTube, Twitch, Google, or OpenStreetMap.*
