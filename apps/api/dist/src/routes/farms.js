import { Hono } from 'hono';
import { getFarms, getFarmById, createFarm, deleteFarm } from '../lib/store.js';
const router = new Hono();
router.get('/', async (c) => {
    return c.json(await getFarms());
});
router.get('/:id', async (c) => {
    const farm = await getFarmById(c.req.param('id'));
    if (!farm)
        return c.json({ error: 'Farm not found' }, 404);
    return c.json(farm);
});
router.post('/', async (c) => {
    const body = await c.req.json();
    const farm = {
        id: `farm-${Date.now()}`,
        name: body.name,
        farmer: body.farmer,
        phone: body.phone,
        county: body.county,
        lat: body.lat,
        lon: body.lon,
        landAcres: body.landAcres,
        cropType: body.cropType,
        notes: body.notes ?? '',
        createdAt: new Date().toISOString(),
        bomRegistered: false,
    };
    return c.json(await createFarm(farm), 201);
});
router.delete('/:id', async (c) => {
    const deleted = await deleteFarm(c.req.param('id'));
    if (!deleted)
        return c.json({ error: 'Farm not found' }, 404);
    return c.json({ ok: true });
});
export default router;
