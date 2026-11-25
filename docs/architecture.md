# How NamaStream works

NamaStream has two parts: a browser extension and a Cloudflare Worker. The extension owns the interface and local preferences. The Worker owns channel configuration, stream API credentials, and cached stream responses.

## Folders

| Folder | Purpose |
|---|---|
| `newtab/` | Dashboard markup, styles, and feature modules |
| `popup/` | Toolbar popup and its settings views |
| `shared/` | Storage helpers, setting defaults, and translations |
| `API/` | Worker routes, external API requests, and KV cache |
| `assets/` | Images and bundled weather icons |
| `docs/` | Setup, usage, and development notes |

## From a new tab to a stream card

1. The browser loads the new tab page defined in the manifest.
2. The dashboard reads saved settings and applies the layout.
3. Bar interactions are initialized, then streams, weather, and wallpaper setup start concurrently.
4. The stream loader requests both YouTube groups and Twitch in parallel.
5. Returned channels are added to the local catalog before disabled channels are filtered out.
6. Stream data is filtered into live YouTube streams, upcoming streams, and Twitch streams, then rendered as cards.

The Worker reads stream data from KV and refreshes stale entries when requested. Opening another tab can reuse that server cache. Weather requests go directly from the extension to Open-Meteo and Nominatim.

The three stream requests are currently processed together. If one fails, the stream loader stops before rendering that group. This does not stop the separate weather and wallpaper initialization.

## The popup and browser storage

The popup writes preferences to `chrome.storage.local`. Open dashboard tabs listen for storage changes and apply layout settings. This shares preferences across tabs in the same browser profile, not across browsers or devices.

| Stored data | Purpose |
|---|---|
| Layout options and `bars-visible` | Visibility, resizing, and preview settings |
| `barPositions` and `barSizes` | Saved dashboard arrangement |
| `disabledChannels` and `pinnedChannels` | Channel selection using YouTube IDs or Twitch logins |
| `channelCatalog` | Channels discovered from backend responses, used by the popup |
| `wallpapers` | The three most recent wallpaper choices |
| `weatherMode`, `lat`, `lon`, and `name` | Automatic or manual weather location |

The channel catalog grows as channels are discovered. It does not remove channels that disappear from a response. A channel removed from the backend configuration can therefore remain in the popup's local list.

## Where to make a change

- For a dashboard feature, start in its folder under `newtab/features/`.
- For popup controls, look under `popup/features/`. Setting defaults and layout application live in `shared/settings-store.js`.
- For visible text, update the English, Portuguese, and Japanese entries in `shared/translations.js`, along with any HTML fallback text.
- For backend channels or stream fetching, use the [backend guide](../API/README.md).

When adding a setting, follow its whole path: popup control, storage value, default, dashboard behavior, and translated label. That keeps the saved preference consistent with what the user sees.

## Keep the docs useful

Update the user guide when a control or workflow changes. Update the backend guide when setup or response fields change. Add a changelog entry for the result a user will notice, such as “Added a popup option to hide the weather widget.”

Comments in code are most useful when they explain a choice that would otherwise be surprising. Put installation steps and longer explanations here so they are easier to find and keep current.
