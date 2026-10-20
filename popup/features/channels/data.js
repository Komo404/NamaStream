export const youtubeIDs = [
    // Insert the channels here (same as backend)
    // Ex: {name: "nak", channelId: "UCfGiBuBA0H7FNbtP4LMP8-g"}
];

export const twitchChannels = [
    // Insert the channels here (same as backend)
    {name: "robcdee", channelId: "robcdee"}
];

export let disabledChannels = new Set();
export let pinnedChannels = [];

export async function loadChannelState() 
{
    return new Promise((resolve) => {
        chrome.storage.local.get(["disabledChannels", "pinnedChannels"], (result) => {
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
