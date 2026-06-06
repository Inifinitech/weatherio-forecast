import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initSchema } from './lib/db.js';

import farmsRouter from './routes/farms.js';
import weatherRouter from './routes/weather.js';
import treesRouter from './routes/trees.js';
import alertsRouter from './routes/alerts.js';
import usageRouter from './routes/usage.js';
import aiRouter from './routes/ai.js';
import quickForecastRouter from './routes/quick-forecast.js';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

const app = new Hono();

app.use('*', cors({ origin: allowedOrigins }));
app.use('*', logger());

const schemaReady = initSchema();

app.use('*', async (c, next) => {
  await schemaReady;
  return next();
});

app.route('/farms', farmsRouter);
app.route('/weather', weatherRouter);
app.route('/trees', treesRouter);
app.route('/alerts', alertsRouter);
app.route('/usage', usageRouter);
app.route('/ai', aiRouter);
app.route('/quick', quickForecastRouter);

app.get('/health', (c) => c.json({ ok: true, service: 'farmcast-api' }));

export default app;
