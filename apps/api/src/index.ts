import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app.js';

const PORT = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n  FieldCast API  →  http://localhost:${PORT}\n`);
  if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === 'wai_your_key_here') {
    console.log('  ⚠  WEATHER_API_KEY not set — running in mock-data mode\n');
  }
});
