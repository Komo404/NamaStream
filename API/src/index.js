//
// Server handler for the API endpoints
//

import { Hono } from 'hono';
import { returnYoutubeData } from './cache.js';
import { returnYoutubeData2 } from './cache.js';
import { returnTwitchData } from './cache.js';
import { returnWallhavenData } from './wallhavenService.js';
import { refreshYoutubeCache } from './cache.js';
import { refreshYoutubeCache2 } from './cache.js';
import { refreshTwitchCache } from './cache.js';

const server = new Hono();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// First endpoint: Returns YouTube data from cache or refreshes it if outdated
server.get('/v3/youtube/1', async (context) => {
  try {
    const cache = await returnYoutubeData(context.env);

    if (Date.now() - cache.timestamp > 1000 * 60 * 3) {
      const data = await refreshYoutubeCache(context.env.YOUTUBE_API_KEY, context.env);
      return context.json(data, { headers: corsHeaders });
    }

    return context.json(cache.data, { headers: corsHeaders });
  } catch (err) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

// Second endpoint: Same as the first one but with different channels (for double channel capacity)
server.get('/v3/youtube/2', async (context) => {
  try {
    const cache = await returnYoutubeData2(context.env);

    if (Date.now() - cache.timestamp > 1000 * 60 * 3) {
      const data = await refreshYoutubeCache2(context.env.YOUTUBE_API_KEY, context.env);
      return context.json(data, { headers: corsHeaders });
    }

    return context.json(cache.data, { headers: corsHeaders });
  } catch (err) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

server.get('/v3/twitch', async (context) => {
  try {
    const cache = await returnTwitchData(context.env);

    if (Date.now() - cache.timestamp > 1000 * 60 * 1.5) {
      const data = await refreshTwitchCache(
        context.env.Client_Id,
        context.env.Client_Secret,
        context.env
      );

      return context.json(data, { headers: corsHeaders });
    }

    return context.json(cache.data ?? [], { headers: corsHeaders });
  } catch (err) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

server.get('/v3/searchwallhaven', async (context) => {
  const query = context.req.query('q')?.trim();

  if (!query) {
    return context.json(
      {
        error: 'Bad Request',
        message: 'Query parameter "q" is required.',
      },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const data = await returnWallhavenData(query);
    return context.json(data, { headers: corsHeaders });
  } catch (err) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

server.options('*', (c) => { // Handle CORS preflight requests
  return c.text('ok', { headers: corsHeaders });
});

export default {
  fetch: server.fetch,
};