import { get as storageGet } from "../../../shared/storage.js";

export async function filterStreams(youtubeData, twitchStreams) {
    const ScheduledStreams = [];
    const HappeningStreams = [];
    const TwitchStreams = [];

    const storage = await storageGet(["disabledChannels", "pinnedChannels"]);
    const disabledChannels = storage.disabledChannels || [];
    const pinnedChannels = storage.pinnedChannels || [];

    for (const video of youtubeData) {
        if (disabledChannels.includes(video.channelId)) continue;

        if (video.actualStartTime && !video.actualEndTime) {
            HappeningStreams.push(video);
        } else if (video.scheduledStartTime && !video.actualStartTime) {
            ScheduledStreams.push(video);
        }
    }

    for (const stream of twitchStreams) {
        if (disabledChannels.includes(stream.login)) continue;
        TwitchStreams.push(stream);
    }

    ScheduledStreams.sort((a, b) => {
        if (pinnedChannels.indexOf(a.channelId) !== -1 && pinnedChannels.indexOf(b.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) - 1000000000;
        } else if (pinnedChannels.indexOf(b.channelId) !== -1 && pinnedChannels.indexOf(a.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) + 1000000000;
        }

        return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime);
    });

    HappeningStreams.sort((a, b) => {
        if (pinnedChannels.indexOf(a.channelId) !== -1 && pinnedChannels.indexOf(b.channelId) === -1) { // If a is pinned and b is not, a should come first
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) - 1000000000;
        } else if (pinnedChannels.indexOf(b.channelId) !== -1 && pinnedChannels.indexOf(a.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) + 1000000000;
        }
        return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime);
    });

    TwitchStreams.sort((a, b) => {
        const aPinned = pinnedChannels.indexOf(a.login);
        const bPinned = pinnedChannels.indexOf(b.login);

        if (aPinned === -1 && bPinned === -1) return 0; // Neither is pinned, maintain original order
        if (aPinned !== -1 && bPinned === -1) return -1; // a is pinned, b is not
        if (bPinned !== -1 && aPinned === -1) return 1; // b is pinned, a is not
        return 0;
    });

    return { ScheduledStreams, HappeningStreams, TwitchStreams };
}
