import { loadChannelState, youtubeIDs, twitchChannels } from "./data.js";
import { renderChannelGrid } from "./grid.js";

export async function initPopupChannels() 
{
    await loadChannelState();

    renderChannelGrid(youtubeIDs, "yt-channel-grid");
    renderChannelGrid(twitchChannels, "twitch-channel-grid");

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local" || !changes.channelCatalog) return;
        const catalog = changes.channelCatalog.newValue;
        renderChannelGrid(catalog?.youtube ?? [], "yt-channel-grid");
        renderChannelGrid(catalog?.twitch ?? [], "twitch-channel-grid");
    });
}
