export let youtubeIDs = [];
export let twitchChannels = [];

export let disabledChannels = new Set();
export let pinnedChannels = [];

export async function loadChannelState() 
{
    return new Promise((resolve) => {
        chrome.storage.local.get(["disabledChannels", "pinnedChannels", "channelCatalog"], (result) => {
            youtubeIDs = result.channelCatalog?.youtube ?? [];
            twitchChannels = result.channelCatalog?.twitch ?? [];
            if (result.disabledChannels) {
                disabledChannels = new Set(result.disabledChannels);
            }
            if (result.pinnedChannels) {
                pinnedChannels = result.pinnedChannels.slice();
            }
            resolve({ disabledChannels, pinnedChannels });
        });
    });
}

export function saveDisabledChannels() 
{
    return new Promise((resolve) => {
        chrome.storage.local.set({ disabledChannels: Array.from(disabledChannels) }, () => resolve());
    });
}

export function savePinnedChannels() 
{
    return new Promise((resolve) => {
        chrome.storage.local.set({ pinnedChannels }, () => resolve());
    });
}
