'use client';

import { Droplets, Thermometer, Wind, Eye } from 'lucide-react';
import type { CurrentConditions } from '@fieldpulse/types';

type Props = { current: CurrentConditions; aiSummary?: string | null };

export function CurrentConditions({ current, aiSummary }: Props) {
  const cards = [
    {
      label: 'Temperature',
      value: `${current.temp_c}°C`,
      icon: Thermometer,
      iconClass: 'text-amber-600',
    },
    {
      label: 'Humidity',
      value: `${current.humidity}%`,
      icon: Eye,
      iconClass: 'text-muted',
    },
    {
      label: 'Rainfall today',
      value: `${current.precip_mm} mm`,
      icon: Droplets,
      iconClass: 'text-sky-600',
    },
    {
      label: 'Wind speed',
      value: `${current.wind_kph} km/h`,
      icon: Wind,
      iconClass: 'text-muted',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {cards.map(({ label, value, icon: Icon, iconClass }) => (
          <div
            key={label}
            className="bg-canvas rounded-lg border border-border px-4 py-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
              <span className="text-2xs uppercase tracking-widest text-muted font-medium">
                {label}
              </span>
            </div>
            <p className="text-2xl font-bold tabular text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Condition label */}
      <p className="text-sm text-muted mb-1">
        Currently: <span className="font-medium text-ink">{current.condition}</span>
      </p>

      {/* AI agronomic summary */}
      {aiSummary && (
        <div className="mt-3 bg-green-50 border border-green-100 rounded-md px-4 py-3">
          <p className="text-2xs uppercase tracking-widest text-green-700 font-semibold mb-1">
            AI Summary
          </p>
          <p className="text-sm text-green-900 leading-relaxed">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}
