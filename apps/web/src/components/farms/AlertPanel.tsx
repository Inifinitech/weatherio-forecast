'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, PlusCircle } from 'lucide-react';
import type { Alert, AlertMetric, AlertOperator, Farm } from '@fieldpulse/types';
import { alertsApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';

const METRIC_LABELS: Record<AlertMetric, string> = {
  rainfall: 'Rainfall (mm)',
  temp_max: 'Max temperature (°C)',
  temp_min: 'Min temperature (°C)',
  humidity: 'Humidity (%)',
  wind_speed: 'Wind speed (km/h)',
};

type Props = { farm: Farm };

export function AlertPanel({ farm }: Props) {
  const qc = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', farm.id],
    queryFn: () => alertsApi.list(farm.id),
  });

  const addMutation = useMutation({
    mutationFn: alertsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', farm.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: alertsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', farm.id] }),
  });

  const [form, setForm] = useState({
    metric: 'rainfall' as AlertMetric,
    operator: 'gt' as AlertOperator,
    threshold: '',
    message: '',
    open: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addMutation.mutate({
      farmId: farm.id,
      metric: form.metric,
      operator: form.operator,
      threshold: Number(form.threshold),
      message: form.message || `Alert triggered at {farm}: ${METRIC_LABELS[form.metric]} ${form.operator === 'gt' ? '>' : '<'} ${form.threshold}`,
    });
    setForm((f) => ({ ...f, threshold: '', message: '', open: false }));
  }

  return (
    <div>
      {/* List */}
      {isLoading && <p className="text-sm text-muted py-4">Loading alerts…</p>}

      {!isLoading && alerts.length === 0 && (
        <EmptyState
          icon={<Bell className="w-10 h-10" />}
          title="No alerts configured"
          message="Set local threshold rules so field teams can quickly spot weather risk and act early."
        />
      )}

      {alerts.length > 0 && (
        <div className="space-y-2 mb-5">
          {alerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onDelete={() => deleteMutation.mutate(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Add alert */}
      {form.open ? (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3 bg-canvas">
          <p className="text-xs font-semibold text-ink uppercase tracking-widest">New alert</p>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs text-muted mb-1">When…</label>
              <select
                value={form.metric}
                onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value as AlertMetric }))}
                className="w-full border border-border rounded px-2 py-1.5 text-sm bg-white text-ink focus:outline-none focus:border-green-500"
              >
                {(Object.entries(METRIC_LABELS) as [AlertMetric, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Is</label>
              <select
                value={form.operator}
                onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value as AlertOperator }))}
                className="w-full border border-border rounded px-2 py-1.5 text-sm bg-white text-ink focus:outline-none focus:border-green-500"
              >
                <option value="gt">Above</option>
                <option value="lt">Below</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">Threshold value</label>
            <input
              type="number"
              required
              value={form.threshold}
              onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
              className="w-full border border-border rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-green-500"
              placeholder="e.g. 20"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              Advisory note{' '}
              <span className="text-2xs normal-case">(optional — use {'{farm}'} for farm name)</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={2}
              className="w-full border border-border rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-green-500 resize-none"
              placeholder="Heavy rain expected at {farm}. Prioritize drainage inspection."
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, open: false }))}
              className="text-sm px-3 py-1.5 text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="text-sm px-4 py-1.5 bg-green-700 text-white rounded hover:bg-green-900 transition-colors disabled:opacity-60"
            >
              {addMutation.isPending ? 'Saving…' : 'Save alert'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setForm((f) => ({ ...f, open: true }))}
          className="flex items-center gap-1.5 text-sm text-green-700 font-medium hover:text-green-900 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add alert threshold
        </button>
      )}
    </div>
  );
}

function AlertRow({ alert, onDelete }: { alert: Alert; onDelete: () => void }) {
  const operatorLabel = alert.operator === 'gt' ? 'above' : 'below';
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3 border border-border rounded-lg bg-white">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink font-medium">
          {METRIC_LABELS[alert.metric]}{' '}
          <span className="text-muted font-normal">
            {operatorLabel} {alert.threshold}
          </span>
        </p>
        <p className="text-xs text-muted mt-0.5 truncate">{alert.message}</p>
      </div>
      <button
        onClick={onDelete}
        className="shrink-0 p-1 text-muted hover:text-red-600 transition-colors"
        title="Remove alert"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
