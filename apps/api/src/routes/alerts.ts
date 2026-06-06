import { Hono } from 'hono';
import { getAlertsByFarm, createAlert, deleteAlert } from '../lib/store.js';
import type { Alert, CreateAlertInput } from '@fieldpulse/types';

const router = new Hono();

router.get('/:farmId', async (c) => {
  return c.json(await getAlertsByFarm(c.req.param('farmId')));
});

router.post('/', async (c) => {
  const body = await c.req.json<CreateAlertInput>();

  const alert: Alert = {
    id: `alert-${Date.now()}`,
    farmId: body.farmId,
    metric: body.metric,
    operator: body.operator,
    threshold: body.threshold,
    message: body.message,
    active: true,
    createdAt: new Date().toISOString(),
  };

  return c.json(await createAlert(alert), 201);
});

router.delete('/:id', async (c) => {
  const deleted = await deleteAlert(c.req.param('id'));
  if (!deleted) return c.json({ error: 'Alert not found' }, 404);
  return c.json({ ok: true });
});

export default router;
