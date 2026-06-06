import { Hono } from 'hono';
import { treeScans } from '../lib/store.js';
import { analyzeTreeImage } from '../lib/weather.js';
const router = new Hono();
// POST /trees/analyze
// Accepts multipart/form-data with an image field + optional metadata
router.post('/analyze', async (c) => {
    const formData = await c.req.formData();
    const farmId = formData.get('farmId') ?? 'unassigned';
    // Forward the form data to WeatherAI (or mock in dev mode)
    let result;
    try {
        result = await analyzeTreeImage(formData);
    }
    catch (err) {
        return c.json({ error: err.message }, 502);
    }
    // Persist the scan locally so history can be retrieved
    const stored = { ...result, farmId };
    treeScans.unshift(stored); // newest first
    return c.json(stored, 201);
});
// GET /trees/history/:farmId
// Returns past analyses for a specific farm, newest first
router.get('/history/:farmId', (c) => {
    const farmId = c.req.param('farmId');
    const history = treeScans.filter((s) => s.farmId === farmId);
    return c.json(history);
});
// GET /trees/history
// Returns all scans across all farms
router.get('/history', (c) => {
    return c.json(treeScans);
});
export default router;
