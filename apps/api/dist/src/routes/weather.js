import { Hono } from 'hono';
import { farms } from '../lib/store.js';
import { getWeather } from '../lib/weather.js';
const router = new Hono();
// GET /weather/farm/:farmId?days=7
// Returns full weather + forecast for a registered farm
router.get('/farm/:farmId', async (c) => {
    const farm = farms.find((f) => f.id === c.req.param('farmId'));
    if (!farm)
        return c.json({ error: 'Farm not found' }, 404);
    const days = Math.min(Number(c.req.query('days') ?? 7), 7);
    try {
        const data = await getWeather(farm.lat, farm.lon, days);
        return c.json(data);
    }
    catch (err) {
        return c.json({ error: err.message }, 502);
    }
});
export default router;
