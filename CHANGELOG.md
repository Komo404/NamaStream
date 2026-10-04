## Changelog

### 1.3.4 (v1.34.0)
- Bumped the extension version to 1.34.0.
- Initialized bar interactions before network-dependent features.
- Loaded streams, weather, and wallpaper setup concurrently.
- Added request timeouts for geolocation and weather services.
- Parallelized weather and reverse-geocoding requests.
- Added lazy loading for stream and wallpaper-result images.
- Deferred hidden wallpaper previews until the wallpaper modal opens.
- Replaced the default 2.9 MB PNG background with an approximately 64 KB WebP asset.
- Added stream response validation to surface API failures cleanly.
- Updated the manifest description and host permissions.

### 1.3.3 (v1.33.0)
- Asobi Mawaritai
- Removed batches (Now using Cloudflare Auto-queue)
- YouTube separate endpoints (double channel capacity)
- Update missing extensions host permissions
- Update preview host name
- Weather Auto button fix
- Bar-positions and sizes now use shared storage
- Resizing is restored when "Resizable Bars" is enabled
- Disabling resize removes only width/height styles
- Resetting positions no longer clears unrelated inline styles
- Changed cron interval (6 minutes -> 7 minutes)

### 1.3.2 (v1.32)
- Twitch Vertical Layout
- YouTube iframe when hovering a thumbnail (minimum 5 seconds)

### 1.3.1 (v1.31)
- JS Modularization
- Backend: Data Normalization + Usage of Fields on Youtube API -> ~30ms -> 7ms CPU TIME
- Backend: API versioning -> V2/V3
- Twitch POPUP channelgrid + disable/enable channels and pin working
- Wallhaven Integration (Through extensions backend)

### 1.3
- Weather widget (Open-Meteo + Nominatim/OpenStreetMap)
- Reposition mode: drag bars to any position, snap to each other, saved across sessions
- Resizable bars with reset button
- Bar scroll snap on release
- Various popup UI improvements and bug fixes
- Wallpaper picker UI fix
- Removed old.js in Backend (New worker and new fetch)
- Popup translations

### 1.22
- Channel enable/disable and pin with sort priority
- Popup layout section rework
- Layout options: toggle Firefox logo, wordmark, search bar, and individual stream bars

### 1.21
- Twitch API integration
- Cron-based cache refresh (cold path latency: ~5000ms → ~250ms)
- API versioning to maintain backward compatibility

### 1.1
- Wallpaper picker with base64 compression and local storage
- Horizontal scrollable bars with drag and mouse wheel support

### 1.0
- YouTube Data API integration
- Dashboard with live and scheduled stream panels
