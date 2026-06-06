import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import farmsRouter from './routes/farms.js';
import weatherRouter from './routes/weather.js';
import treesRouter from './routes/trees.js';
import alertsRouter from './routes/alerts.js';
import usageRouter from './routes/usage.js';
import aiRouter from './routes/ai.js';
import quickForecastRouter from './routes/quick-forecast.js';

const app = new Hono();

app.use('*', cors({ origin: ['http://localhost:3000'] }));
app.use('*', logger());

app.route('/farms', farmsRouter);
app.route('/weather', weatherRouter);
app.route('/trees', treesRouter);
app.route('/alerts', alertsRouter);
app.route('/usage', usageRouter);
app.route('/ai', aiRouter);
app.route('/quick', quickForecastRouter);

app.get('/health', (c) => c.json({ ok: true, service: 'farmcast-api' }));

const PORT = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n  FarmCast API  →  http://localhost:${PORT}\n`);
  if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === 'wai_your_key_here') {
    console.log('  ⚠  WEATHER_API_KEY not set — running in mock-data mode\n');
  }
});
