import { filterStreams } from "./filters.js";
import { renderStreams } from "./render.js";
import { bindStreamPreviews } from "./preview.js";

export async function initStreams(domRefs) // domRefs: youtube, agenda e twitch
{
    try {
        console.time("Streams fetch");
        const response = await fetch("https://namastream.migueloliv-dev.workers.dev/v3/youtube");
        const twitchRes = await fetch("https://namastream.migueloliv-dev.workers.dev/v3/twitch");
        console.timeEnd("Streams fetch");

        const videosResponse = await response.json();
        const twitchResponse = await twitchRes.json();

        const data = await filterStreams(videosResponse, twitchResponse);
        renderStreams(domRefs.youtube, domRefs.agenda, domRefs.twitch, data.HappeningStreams, data.ScheduledStreams, data.TwitchStreams);

        bindStreamPreviews([domRefs.youtube, domRefs.agenda, domRefs.twitch]);

    } catch (err) {
        console.error("Erro ao carregar streams:", err);
    }
}
