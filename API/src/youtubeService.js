// ==========================================
// 1. Pega 3 vídeos de cada canal (getYoutubeContent)
// 2. Pega as informações de cada vídeo (getVideoInfo)
// ==========================================

const channelIDs = [
  // Coloque os canais aqui
  // Ex: {name: "nak", channelId: "UCfGiBuBA0H7FNbtP4LMP8-g"}
]

const playlistIDs = channelIDs.map( ({ channelId }) => `UU${ channelId.slice(2) }`);

export async function getStreams(YOUTUBE_API_KEY) 
{ 
  const playlistData = await getYoutubeContent(playlistIDs, YOUTUBE_API_KEY); 
  const streams = await getVideoInfo(playlistData, YOUTUBE_API_KEY); 
  return streams; 
}

async function getYoutubeContent(playlistIDs, YOUTUBE_API_KEY) {
  const playlists = [];

  for (let i = 0; i < playlistIDs.length; i += 6) {
    const batch = playlistIDs.slice(i, i + 6);

    const chunk = await Promise.all(
      batch.map(async (playlistId) => {

        const url = `https://www.googleapis.com/youtube/v3/playlistItems` + `?part=snippet` +
        `&fields=items(snippet(resourceId/videoId))` +
        `&playlistId=${playlistId}&maxResults=3&key=${YOUTUBE_API_KEY}`;

        try {
          const res = await fetch(url);

          if (!res.ok) {
            console.error("YT API error:", playlistId, res.status);
            return null;
          }

          return res.json();
        } catch (e) {
          console.error("Fetch error:", playlistId, e.message);
          return null;
        }
      })
    );

    for (const playlist of chunk) {
      if (playlist) 
        playlists.push(playlist);
    }
  }

  return playlists;
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

  if (videoIds.length === 0) console.warn("Nenhum vídeo encontrado em algum canal");

  for (let i = 0; i < videoIds.length; i += 50) {
    const ids = videoIds.slice(i, i + 50).join(',');

    const url = `https://www.googleapis.com/youtube/v3/videos?` + 
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