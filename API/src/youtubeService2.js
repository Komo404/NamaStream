// ==========================================
// YouTube Service 2 pra dividir as requests de 50 em 2 e pra não dar erro de limite de requisições
// ==========================================

const channelIDs = [
  {name: "Gigi", channelId: "UCDHABijvPBnJm7F-KlNME3w"},
  {name: "Elite_Miko", channelId: "UC-hM6YJuNYVAmUWxeIr9FeA"},
  {name: "Kaela", channelId: "UCZLZ8Jjx_RN2CXloOmgTHVg"},
  {name: "iRyS", channelId: "UC8rcEBzJSleTkf_-agPM20g"},
  {name: "Ina", channelId: "UCMwGHR0BTZuLsmjY_NT5Pwg"},
  {name: "Laplus", channelId: "UCENwRMx5Yh42zWpzURebzTw"},
  {name: "Towa", channelId: "UC1uv2Oq6kNxgATlCiez59hw"},
  {name: "Suisei", channelId: "UC5CwaMl1eIgY8h02uZw7u8A"},
  {name: "Korone", channelId: "UChAnqc_AY5_I3Px5dig3X1Q"},
  {name: "Saba", channelId: "UCxsZ6NCzjU_t4YSxQLBcM5A"},
  {name: "Raora", channelId: "UCl69AEx4MdqMZH7Jtsm7Tig"},
  {name: "Fuwamoco", channelId: "UCt9H_RpQzhxzlyBxFqrdHqA"},
  {name: "Ollie", channelId: "UCYz_5n-uDuChHtLo7My1HnQ"},
  {name: "schachi", channelId: "UCuBEdI-24bquMoP_dACignQ"},
  {name: "Mela", channelId: "UC8eitCE9Z6EwUCs-VUi1blg"},
  {name: "Sopia", channelId: "UCROQtXcp2loQEmvpe5rhJzQ"},
  {name: "Tsuzuri", channelId: "UCy9mgxB8pn2C4aNK_MPthDQ"},
  {name: "Kyoko", channelId: "UCSjQDxud2HkAO2DVD3lwxmw"},
  {name: "Subaru", channelId: "UCvzGlP9oQwU--Y0r9id_jnA"},
  {name: "Anya", channelId: "UC727SQYUvx5pDDGQpTICNWg"},
  {name: "Fubuki", channelId: "UCdn5BQ06XqgXoAxIhbqw5Rg"}
]

const playlistIDs = channelIDs.map( ({ channelId }) => `UU${ channelId.slice(2) }`);

export async function getYoutubeStreams(YOUTUBE_API_KEY) 
{ 
  const playlistData = await getYoutubeContent(playlistIDs, YOUTUBE_API_KEY); 
  const streams = await getVideoInfo(playlistData, YOUTUBE_API_KEY); 
  return streams; 
}

async function getYoutubeContent(playlistIDs, YOUTUBE_API_KEY) 
{
  const fetchPlaylist = async (playlistId) => { // arrow function que retorna uma Promise e playlistId é um parâmetro da função
    const params = new URLSearchParams({
      part: "snippet",
      fields: "items(snippet(resourceId/videoId))",
      playlistId,
      maxResults: "3",
      key: YOUTUBE_API_KEY,
    });

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`;

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

  return data.filter(Boolean); // Remove as playlists que falharam
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