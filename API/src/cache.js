//
// Cache do NamaStream
//

import { getYoutubeStreams } from './youtubeService.js';
import { getYoutubeStreams as getYoutubeStreams2 } from './youtubeService2.js';
import { getTwitchStreams } from './twitchService.js';


async function getYoutubeCache(key, env)
{
    const result = await env.STREAMS_KV.getWithMetadata(key, {
        type: "json",
        cacheTtl: 30
    });

    return {
        data: result.value ?? [],
        timestamp: result.metadata?.fetchedAt ?? 0
    };
}

export async function returnYoutubeData(env)
{
    return getYoutubeCache("youtube:v3:1", env);
}


export async function returnYoutubeData2(env)
{
    return getYoutubeCache("youtube:v3:2", env);
}


export async function returnTwitchData(env)
{
    const result = await env.STREAMS_KV.getWithMetadata("twitch:v3", {
        type: "json",
        cacheTtl: 30
    });

    return {
        data: result.value ?? [],
        timestamp: result.metadata?.fetchedAt ?? 0
    };
}


export async function refreshYoutubeCache(YOUTUBE_API_KEY, env)
{
    const data = await getYoutubeStreams(YOUTUBE_API_KEY);
    await saveCache("youtube:v3:1", data, env);
    return data;
}


export async function refreshYoutubeCache2(YOUTUBE_API_KEY, env)
{
    const data = await getYoutubeStreams2(YOUTUBE_API_KEY);
    await saveCache("youtube:v3:2", data, env);
    return data;
}


export async function refreshTwitchCache(Client_Id, Client_Secret, env)
{
    const data = await getTwitchStreams(Client_Id, Client_Secret);
    await saveCache("twitch:v3", data, env);
    return data;
}

async function saveCache(key, data, env)
{
    await env.STREAMS_KV.put( key, JSON.stringify(data), {
            metadata: { fetchedAt: Date.now() }
        }
    );
}