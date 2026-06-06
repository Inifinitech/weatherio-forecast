import { Hono } from 'hono';
import { getFarmById } from '../lib/store.js';
import { getWeather } from '../lib/weather.js';

const router = new Hono();

router.get('/farm/:farmId', async (c) => {
  const farm = await getFarmById(c.req.param('farmId'));
  if (!farm) return c.json({ error: 'Farm not found' }, 404);

  const days = Math.min(Number(c.req.query('days') ?? 7), 7);

  try {
    const data = await getWeather(farm.lat, farm.lon, days);
    return c.json(data);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 502);
  }
});

export default router;
