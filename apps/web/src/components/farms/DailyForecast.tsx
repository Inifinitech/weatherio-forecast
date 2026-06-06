import type { DayForecast } from '@fieldpulse/types';
import { Droplets } from 'lucide-react';

const CONDITION_COLOR: Record<string, string> = {
  sunny: 'text-amber-600',
  clear: 'text-amber-600',
  rain: 'text-sky-600',
  'heavy rain': 'text-sky-700',
  'light rain': 'text-sky-500',
  drizzle: 'text-sky-400',
  cloudy: 'text-muted',
  'partly cloudy': 'text-muted',
};

function conditionColor(condition: string): string {
  return CONDITION_COLOR[condition.toLowerCase()] ?? 'text-muted';
}

export function DailyForecast({ days }: { days: DayForecast[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
        const dateNum = new Date(day.date).getDate();
        return (
          <div
            key={day.date}
            className="flex flex-col items-center bg-canvas border border-border rounded-md py-3 px-1"
          >
            <p className="text-2xs uppercase tracking-wide text-muted font-medium">{label}</p>
            <p className="text-2xs text-muted mt-0.5">{dateNum}</p>

            <p className={`text-xs font-semibold mt-2 leading-tight text-center ${conditionColor(day.condition)}`}>
              {day.condition}
            </p>

            <div className="mt-2 text-center">
              <p className="text-sm font-bold tabular text-ink">{day.max_temp_c}°</p>
              <p className="text-2xs text-muted tabular">{day.min_temp_c}°</p>
            </div>

            {day.precip_mm > 0 && (
              <div className="flex items-center gap-0.5 mt-2">
                <Droplets className="w-2.5 h-2.5 text-sky-500" />
                <span className="text-2xs text-sky-600 tabular">{day.precip_mm}mm</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
