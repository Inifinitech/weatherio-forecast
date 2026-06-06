import { Hono } from 'hono';
import { alerts } from '../lib/store.js';
import type { Alert, CreateAlertInput } from '@fieldpulse/types';

const router = new Hono();

// GET /alerts/:farmId — list alerts for a farm
router.get('/:farmId', (c) => {
  const farmAlerts = alerts.filter((a) => a.farmId === c.req.param('farmId'));
  return c.json(farmAlerts);
});

// POST /alerts — create a new alert threshold for a farm
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

  alerts.push(alert);
  return c.json(alert, 201);
});

// DELETE /alerts/:id — remove an alert
router.delete('/:id', (c) => {
  const idx = alerts.findIndex((a) => a.id === c.req.param('id'));
  if (idx === -1) return c.json({ error: 'Alert not found' }, 404);
  alerts.splice(idx, 1);
  return c.json({ ok: true });
});

export default router;
