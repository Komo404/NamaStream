//
// Handler do server. Hono é o framework para facilitar fazer o server 
//

import { Hono } from 'hono';
import { returnYoutubeData } from './cache.js';
import { returnYoutubeData2 } from './cache.js';
import { returnTwitchData } from './cache.js';
import { returnWallhavenData } from './wallhavenService.js';
import { refreshYoutubeCache } from './cache.js';
import { refreshYoutubeCache2 } from './cache.js';
import { refreshTwitchCache } from './cache.js';

interface Env {
  YOUTUBE_API_KEY: string;
  Client_Id: string;
  Client_Secret: string;
}

import type {
  ScheduledController,
  ExecutionContext
} from "@cloudflare/workers-types";

const server = new Hono<{ Bindings: Env }>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // faz com que permita qualquer origem
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

server.get('/v3/youtube/1', async (context) => {
  try {
    let cache = await returnYoutubeData(context.env);

    if (Date.now() - cache.timestamp > 1000 * 60 * 1.5) {
      const data = await refreshYoutubeCache(context.env.YOUTUBE_API_KEY, context.env);
      return context.json(data, { headers: corsHeaders });
    }

    return context.json(cache.data, { headers: corsHeaders });

  } catch (err: any) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});


server.get('/v3/youtube/2', async (context) => {
  try {
    let cache = await returnYoutubeData2(context.env);

    if (Date.now() - cache.timestamp > 1000 * 60 * 1.5) {
      const data = await refreshYoutubeCache2(context.env.YOUTUBE_API_KEY, context.env);

      return context.json(data, { headers: corsHeaders });
    }

    return context.json(cache.data, { headers: corsHeaders });

  } catch (err: any) {
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
    
  } catch (err: any) {
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

  } catch (err: any) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

// requisição options (faz automático antes/junto de um fetch) AKA preflight request para lidar com CORS, tem que ter uma resposta 200 e os headers de CORS pra funcionar
server.options('*', (c) => {
    return c.text('ok', { headers: corsHeaders });
});

export default {
  fetch: server.fetch,

  scheduled: async (
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) => {
    console.log("Cron disparou!");

    await Promise.all([
      fetch("https://namastream.migueloliv-dev.workers.dev/v3/youtube/1"),
      fetch("https://namastream.migueloliv-dev.workers.dev/v3/youtube/2"),
      fetch("https://namastream.migueloliv-dev.workers.dev/v3/twitch")
    ]);

    console.log("Refresh de cache solicitado pra todos os endpoints");
  }
};