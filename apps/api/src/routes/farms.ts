import { Hono } from 'hono';
import { farms } from '../lib/store.js';
import type { CreateFarmInput, Farm } from '@fieldpulse/types';

const router = new Hono();

// GET /farms — list all farms
router.get('/', (c) => {
  return c.json(farms);
});

// GET /farms/:id — get one farm
router.get('/:id', (c) => {
  const farm = farms.find((f) => f.id === c.req.param('id'));
  if (!farm) return c.json({ error: 'Farm not found' }, 404);
  return c.json(farm);
});

// POST /farms — register a new farm
router.post('/', async (c) => {
  const body = await c.req.json<CreateFarmInput>();

  const farm: Farm = {
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

  farms.push(farm);
  return c.json(farm, 201);
});

// DELETE /farms/:id — remove a farm
router.delete('/:id', (c) => {
  const idx = farms.findIndex((f) => f.id === c.req.param('id'));
  if (idx === -1) return c.json({ error: 'Farm not found' }, 404);
  farms.splice(idx, 1);
  return c.json({ ok: true });
});

export default router;
