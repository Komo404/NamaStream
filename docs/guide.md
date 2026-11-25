# Getting started

NamaStream replaces your browser's new tab with streams, schedules, weather, and a wallpaper of your choice. This guide covers loading the extension and using its controls.

## Load the extension

Clone or download this repository. Both browsers use the same extension source and configured backend.

### Firefox

Use Firefox 140 or later.

1. Open `about:debugging`.
2. Select **This Firefox**, then **Load Temporary Add-on**.
3. Select `manifest.json` in the repository root.
4. Open a new tab to see the dashboard.

This is a temporary installation. Load the extension again after restarting Firefox.

### Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose the repository root.
4. Open a new tab to see the dashboard.

Chrome may show a warning about the optional location permission. It skips that permission, and the weather widget works with a city you choose.

## Choose what to show

Open the extension popup from your browser toolbar. The first screen lets you show or hide the YouTube, Agenda, and Twitch bars. **Layout Options** contains the controls for the logo, search bar, weather widget, vertical Twitch layout, resizing, and theater previews.

Press **M** on the dashboard to hide or show all three stream bars. This shortcut is ignored while typing in a form field. The setting is saved and shared with other open dashboard tabs. New stream requests are skipped while all bars are hidden.

The weather option controls visibility. Hiding the widget currently does not stop its startup requests.

### Channel controls

Select **Enable / Disable Channels** in the popup:

- Click a channel to disable or enable it.
- Right-click a channel to pin or unpin it.

Channels appear after the dashboard loads stream data. YouTube channels are discovered from the videos returned by the backend. Twitch channels are added when they appear online. Once discovered, channels stay in the local list, including while offline. There is no separate channel list to maintain in the popup.

These controls filter the backend's configured channels. They do not add new channels to the backend. To change the source lists, see [Backend setup](../API/README.md#setup).

### Move and resize bars

In **Layout Options**, select **Reposition Bars**, drag the bars to the positions you want, then select **Done Repositioning**. Use **Reset pos** to restore their positions.

Enable **Resizable Bars** to resize them. Disabling this option restores the default dimensions. Positions and sizes are saved in browser storage.

## Preview YouTube streams

Keep the pointer over a YouTube thumbnail for three seconds to open a preview. By default, it appears inside the thumbnail and closes when the pointer leaves.

Enable **Theater preview** in the popup to open a larger player in the center of the page. Use **+** to add other available YouTube live streams, up to four players. Close the theater with its close button, **Escape**, or a click outside it.

Twitch thumbnails do not have video previews.

## Set up weather and wallpapers

Open the weather widget's settings to search for a city. In Firefox, you can also select **Use my location**. Firefox asks for location access and permission to share coordinates with the weather services. You can decline and still choose a city manually. Once automatic weather is set up, new tabs use it while the permissions are granted.

Open the wallpaper picker to use an image URL, choose a file from your computer, or search Wallhaven. The picker keeps your three most recent wallpapers so you can select them again.

## Make changes

Edit the HTML, CSS, or JavaScript, then reload the extension from the browser's extension page and open a new tab.

To run your own backend, follow [Backend setup](../API/README.md#setup). To understand the folders and data flow, read [How NamaStream works](./architecture.md).

## If something looks wrong

| Problem | What to check |
|---|---|
| The channel list is empty | Open a dashboard tab with stream bars visible and wait for its requests to finish. Twitch channels are discovered only when online. |
| A configured YouTube channel has no live stream | Only its three most recent uploads are checked. The stream may be outside that window. |
| Streams do not load | Check the dashboard console and Network panel. A failed stream endpoint currently prevents the stream group from rendering. |
| Weather is missing | Check the weather option in the popup, location permission, and the manual city setting. |
| Edits do not appear | Reload the extension, then open a new dashboard tab. |

If you report a bug, include your browser, the steps you followed, and any console error. Leave API keys and other credentials out of screenshots and logs.
