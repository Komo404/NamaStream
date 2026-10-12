// ==========================================
// 1. Pega 3 vídeos de cada canal (getYoutubeContent)
// 2. Pega as informações de cada vídeo (getVideoInfo)
// ==========================================

import { channelIDs } from './channels_local.js';

const playlistIDs = channelIDs.map( ({ channelId }) => `UU${ channelId.slice(2) }`);

export async function getYoutubeStreams(YOUTUBE_API_KEY) 
{ 
  const playlistData = await getYoutubeContent(playlistIDs, YOUTUBE_API_KEY); 
  const streams = await getVideoInfo(playlistData, YOUTUBE_API_KEY); 
  return streams; 
}

async function getYoutubeContent(playlistIDs, YOUTUBE_API_KEY) 
{
  const fetchPlaylist = async (playlistId) => { // Arrow function to fetch a single playlist
    const params = new URLSearchParams({
      part: "snippet",
      fields: "items(snippet(resourceId/videoId))",
      playlistId,
      maxResults: "3",
      key: YOUTUBE_API_KEY,
    });

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`; // get videos from a playlist (in this case the "uploads" playlist of a channel)

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`YouTube API returned ${response.status} for playlist "${playlistId}"`);
      }

      return await response.json();

    } catch (error) {
      console.error(
        `Failed to fetch "${playlistId}":`, error
      );

      return null;
    }
  };

  const data = await Promise.all(
    playlistIDs.map(fetchPlaylist)
  );

  return data.filter(Boolean); // Remove any null responses from the array
}

async function getVideoInfo(data, YOUTUBE_API_KEY) {
  const requests = [];
  const videoIds = [];
  const cleanResponse = [];

  for (const playlist of data) {
    const items = playlist?.items;
    if (!items) continue;

    for (const video of items) {
      const id = video?.snippet?.resourceId?.videoId;
      if (id) videoIds.push(id);
    }
  }

  if (videoIds.length === 0) console.warn("No video IDs found in the provided playlists.");

  for (let i = 0; i < videoIds.length; i += 50) {
    const ids = videoIds.slice(i, i + 50).join(',');

    const url = `https://www.googleapis.com/youtube/v3/videos?` + // Get video details for the collected video IDs
    `part=snippet,liveStreamingDetails` + 
    `&fields=items(id,snippet(title,channelId,channelTitle,thumbnails/maxres/url,thumbnails/high/url),liveStreamingDetails)` + 
    `&id=${ids}&key=${YOUTUBE_API_KEY}`;
    
    requests.push(
      fetch(url)
        .then( (res) => {
          if (!res.ok) {
            console.error({status: res.status});
            return null;
          }
          return res.json();
          })
        .catch(err => {
          console.error(err);
          return null;
        })
    );
  }
  const videosResponse = (await Promise.all(requests)).filter(Boolean);

  for (const response of videosResponse) {
    const items = response?.items;
    if (!items) continue;

    for (const video of items) {
      cleanResponse.push({
        id: video.id,
        title: video.snippet.title,
        channelId: video.snippet.channelId,
        channel: video.snippet.channelTitle,
        thumbnailMax: video.snippet.thumbnails.maxres?.url ?? null,
        thumbnailHigh: video.snippet.thumbnails.high?.url ?? null,
        concurrentViewers: video.liveStreamingDetails?.concurrentViewers ?? null,
        actualStartTime: video.liveStreamingDetails?.actualStartTime ?? null,
        actualEndTime: video.liveStreamingDetails?.actualEndTime ?? null,
        scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime ?? null,
      });
    }
  }

  return cleanResponse;
}