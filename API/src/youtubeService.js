// ==========================================
// Pega os vídeos dos canais
// O processo é dividido em 2 etapas:
// 1. Pegar os vídeos dos canais (getYoutubeContent)
// 2. Pegar as informações de cada vídeo (getVideoInfo)
// ==========================================

const channelIDs = [
  // Coloque os canais aqui
  // Ex: {name: "nak", channelId: "UCfGiBuBA0H7FNbtP4LMP8-g"}
]

const playlistIDs = channelIDs.map(el => {
  return {
    name: el.name,
    playlistID: "UU" + el.channelId.slice(2)
  };
});

export async function getStreams(YOUTUBE_API_KEY) 
{ 
  const playlistData = await getYoutubeContent(playlistIDs, YOUTUBE_API_KEY); 
  const streams = await getVideoInfo(playlistData, YOUTUBE_API_KEY); 
  return streams; 
}

async function getYoutubeContent(playlistIDs, YOUTUBE_API_KEY) 
{
  const responses = [];

  for (let i = 0; i < playlistIDs.length; i+= 6) { // Itera o array de 6 em 6
    const promises = [];

    const actualElements = playlistIDs.slice(i, i + 6); // Fatia os ids de 6 em 6
    
    for (const id of actualElements) {
      promises.push(fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id.playlistID}&maxResults=3&key=${YOUTUBE_API_KEY}`)) //Para cada elemento da iteração (6 elementos), faz um fetch para cada 
    };

    const chunk = await Promise.all(promises);
    responses.push(...chunk);
  }

  const data = await Promise.all( 
    responses.map(res => res.json() 
  )); 

  return data;
}

async function getVideoInfo(data, YOUTUBE_API_KEY) {
  const videoIds = data.flatMap(el => el?.items?.map(v => v.snippet.resourceId.videoId) ?? []);

  if (videoIds.length === 0) {
    console.warn("Nenhum vídeo encontrado em algum canal");
    return [];
  }

  const requests = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const ids = videoIds.slice(i, i + 50).join(',');
    requests.push(
      fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids}&key=${YOUTUBE_API_KEY}`)
        .then(res => res.json())
    );
  }

  const videosResponse = await Promise.all(requests);
  return videosResponse;
}