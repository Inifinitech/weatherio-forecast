import { Hono } from 'hono';
import { getUsage } from '../lib/weather.js';

const router = new Hono();

// GET /usage — API quota and billing period stats
router.get('/', async (c) => {
  try {
    const data = await getUsage();
    return c.json(data);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 502);
  }
});

export default router;
