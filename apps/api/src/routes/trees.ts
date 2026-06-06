import { Hono } from 'hono';
import { getTreeScans, createTreeScan } from '../lib/store.js';
import { analyzeTreeImage } from '../lib/weather.js';
import type { StoredTreeScan } from '@fieldpulse/types';

const router = new Hono();

router.post('/analyze', async (c) => {
  const formData = await c.req.formData();
  const farmId = (formData.get('farmId') as string | null) ?? 'unassigned';

  let result;
  try {
    result = await analyzeTreeImage(formData);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 502);
  }

  const stored: StoredTreeScan = { ...result, farmId };
  return c.json(await createTreeScan(stored), 201);
});

router.get('/history/:farmId', async (c) => {
  return c.json(await getTreeScans(c.req.param('farmId')));
});

router.get('/history', async (c) => {
  return c.json(await getTreeScans());
});

export default router;
