'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Droplets, Wind, TreePine, ArrowRight } from 'lucide-react';
import type { Farm } from '@fieldpulse/types';
import { weatherApi } from '@/lib/api';
import { Badge } from '@/components/shared/Badge';

function conditionToVariant(condition?: string): 'sky' | 'amber' | 'neutral' {
  const lower = (condition ?? '').toLowerCase();
  if (lower.includes('rain') || lower.includes('storm') || lower.includes('drizzle'))
    return 'sky';
  if (lower.includes('sun') || lower.includes('clear') || lower.includes('hot'))
    return 'amber';
  return 'neutral';
}

export function FarmCard({ farm }: { farm: Farm }) {
  const { data: weather, isLoading } = useQuery({
    queryKey: ['weather', farm.id],
    queryFn: () => weatherApi.forFarm(farm.id, 3),
  });

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden hover:border-green-300 transition-colors">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-ink text-sm truncate">{farm.name}</h3>
            <p className="text-xs text-muted mt-0.5">{farm.farmer}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge label={farm.county} variant="green" />
            {farm.bomRegistered && (
              <span className="text-2xs text-green-600 font-medium">Bomet Programme</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs text-muted">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>
            {farm.cropType} · {farm.landAcres} ac ·{' '}
            <span className="font-mono text-2xs">{farm.lat.toFixed(4)}, {farm.lon.toFixed(4)}</span>
          </span>
        </div>
      </div>

      {/* Weather strip */}
      <div className="px-5 py-4">
        {isLoading && (
          <div className="h-14 flex items-center">
            <span className="text-xs text-muted animate-pulse">Fetching conditions…</span>
          </div>
        )}

        {weather && (
          <>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular text-ink">
                  {weather.current.temp_c}
                </span>
                <span className="text-base text-muted">°C</span>
              </div>
              <Badge
                label={weather.current.condition}
                variant={conditionToVariant(weather.current.condition)}
              />
            </div>

            <div className="flex gap-4 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-600" />
                {weather.current.precip_mm} mm today
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {weather.current.wind_kph} km/h
              </span>
              <span>{weather.current.humidity}% humidity</span>
            </div>

            {/* 3-day mini strip */}
            {weather.daily.slice(1, 4).length > 0 && (
              <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2">
                {weather.daily.slice(1, 4).map((day) => {
                  const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                  return (
                    <div key={day.date} className="text-center">
                      <p className="text-2xs text-muted uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-medium tabular mt-0.5">{day.max_temp_c}°</p>
                      <p className="text-2xs text-sky-600 mt-0.5">{day.precip_mm}mm</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2">
        <Link
          href={`/farms/${farm.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border border-green-700 text-green-700 rounded-md hover:bg-green-50 transition-colors"
        >
          View Farm <ArrowRight className="w-3 h-3" />
        </Link>
        <Link
          href={`/farms/${farm.id}/trees`}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border text-muted rounded-md hover:bg-canvas transition-colors"
        >
          <TreePine className="w-3 h-3" />
          Scan
        </Link>
      </div>
    </div>
  );
}
