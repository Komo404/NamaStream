import { filterStreams } from "./filters.js";
import { renderStreams } from "./render.js";
import { bindStreamPreviews } from "./preview.js";

export async function initStreams(domRefs) // domRefs: youtube, agenda e twitch
{
    try {
        const [response1, response2, twitchRes] = await Promise.all([
            fetch("https://namastream.migueloliv-dev.workers.dev/v3/youtube/1"),
            fetch("https://namastream.migueloliv-dev.workers.dev/v3/youtube/2"),
            fetch("https://namastream.migueloliv-dev.workers.dev/v3/twitch")
        ]);

        const [youtubeResponse1, youtubeResponse2, twitchResponse] = await Promise.all([
            parseResponse(response1),
            parseResponse(response2),
            parseResponse(twitchRes)
        ]);

        const youtubeResponse = [...youtubeResponse1, ...youtubeResponse2];

        const data = await filterStreams(youtubeResponse, twitchResponse);
        renderStreams(domRefs.youtube, domRefs.agenda, domRefs.twitch, data.HappeningStreams, data.ScheduledStreams, data.TwitchStreams);

        bindStreamPreviews([domRefs.youtube, domRefs.agenda, domRefs.twitch]);

    } catch (err) {
        console.error("Erro ao carregar streams:", err);
    }
}

async function parseResponse(response) {
    if (!response.ok) throw new Error(`Streams API HTTP ${response.status}`);
    return response.json();
}
