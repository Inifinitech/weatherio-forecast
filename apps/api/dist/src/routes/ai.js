import { Hono } from 'hono';
import { getFarmById } from '../lib/store.js';
import { getWeather } from '../lib/weather.js';
import { getAiActions } from '../lib/ai.js';
const router = new Hono();
router.post('/actions', async (c) => {
    const { farmId } = await c.req.json();
    const farm = await getFarmById(farmId);
    if (!farm)
        return c.json({ error: 'Farm not found' }, 404);
    let weather;
    try {
        weather = await getWeather(farm.lat, farm.lon, 3);
    }
    catch (err) {
        return c.json({ error: `Weather fetch failed: ${err.message}` }, 502);
    }
    const result = await getAiActions(farm, weather);
    return c.json({
        farmId: farm.id,
        farmName: farm.name,
        ...result,
    });
});
export default router;
