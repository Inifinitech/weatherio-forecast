'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DayForecast } from '@fieldpulse/types';

type Props = { days: DayForecast[] };

// Recharts tooltip wrapper — keeps it readable and styled to match the app
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-md px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-ink mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold tabular">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function WeatherCharts({ days }: Props) {
  const data = days.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    'Rain (mm)': d.precip_mm,
    'High °C': d.max_temp_c,
    'Low °C': d.min_temp_c,
    humidity: d.humidity_avg,
  }));

  return (
    <div className="space-y-6">
      {/* Rainfall bar chart */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
          Rainfall — mm per day
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E0DA" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#78716C' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#78716C' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Rain (mm)" fill="#0284C7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature line chart */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
          Temperature range — °C
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E0DA" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#78716C' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#78716C' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="plainline"
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="High °C"
                stroke="#D97706"
                strokeWidth={2}
                dot={{ r: 3, fill: '#D97706' }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Low °C"
                stroke="#40916C"
                strokeWidth={2}
                dot={{ r: 3, fill: '#40916C' }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
