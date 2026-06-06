import { Hono } from 'hono';
import { farms } from '../lib/store.js';
import { getWeather } from '../lib/weather.js';
import { getAiActions } from '../lib/ai.js';

const router = new Hono();

// POST /ai/actions
// Body: { farmId: string }
// Returns risk level + prioritized field actions for the next 24 hours.
router.post('/actions', async (c) => {
  const { farmId } = await c.req.json<{ farmId: string }>();

  const farm = farms.find((f) => f.id === farmId);
  if (!farm) return c.json({ error: 'Farm not found' }, 404);

  let weather;
  try {
    weather = await getWeather(farm.lat, farm.lon, 3);
  } catch (err) {
    return c.json({ error: `Weather fetch failed: ${(err as Error).message}` }, 502);
  }

  const result = await getAiActions(farm, weather);

  return c.json({
    farmId: farm.id,
    farmName: farm.name,
    ...result,
  });
});

export default router;
