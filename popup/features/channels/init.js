import { loadChannelState, youtubeIDs, twitchChannels } from "./data.js";
import { renderChannelGrid } from "./grid.js";

export async function initPopupChannels() 
{
    await loadChannelState();

    renderChannelGrid(youtubeIDs, "yt-channel-grid");
    renderChannelGrid(twitchChannels, "twitch-channel-grid");
}