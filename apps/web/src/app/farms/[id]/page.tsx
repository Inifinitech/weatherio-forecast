'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TreePine, Bell, Info, MapPin } from 'lucide-react';
import { farmApi, weatherApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/shared/Badge';
import { CurrentConditions } from '@/components/farms/CurrentConditions';
import { DailyForecast } from '@/components/farms/DailyForecast';
import { WeatherCharts } from '@/components/farms/WeatherCharts';
import { AlertPanel } from '@/components/farms/AlertPanel';
import { NextActions } from '@/components/farms/NextActions';

type Tab = 'weather' | 'alerts' | 'info';

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('weather');

  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ['farm', id],
    queryFn: () => farmApi.get(id),
  });

  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', id],
    queryFn: () => weatherApi.forFarm(id, 7),
    enabled: !!farm,
  });

  if (farmLoading) return <LoadingSpinner label="Loading farm…" />;
  if (!farm) return <p className="px-8 py-6 text-sm text-muted">Farm not found.</p>;

  return (
    <div>
      <PageHeader
        title={farm.name}
        subtitle={`${farm.farmer} · ${farm.county} County · ${farm.cropType}`}
        breadcrumbs={[{ label: 'Overview', href: '/dashboard' }, { label: farm.name }]}
        action={
          <Link
            href={`/farms/${farm.id}/trees`}
            className="flex items-center gap-1.5 text-sm px-4 py-2 border border-green-700 text-green-700 rounded-md hover:bg-green-50 transition-colors font-medium"
          >
            <TreePine className="w-4 h-4" />
            Canopy scan
          </Link>
        }
      />

      {/* Tabs */}
      <div className="border-b border-border bg-white px-8">
        <nav className="flex gap-0">
          {([
            { key: 'weather', label: 'Weather & Forecast' },
            { key: 'alerts', label: 'Alerts', icon: Bell },
            { key: 'info', label: 'Farm info', icon: Info },
          ] as { key: Tab; label: string; icon?: React.ComponentType<{ className?: string }> }[]).map(
            ({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={[
                  'flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-colors',
                  tab === key
                    ? 'border-green-700 text-green-700 font-medium'
                    : 'border-transparent text-muted hover:text-ink',
                ].join(' ')}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ),
          )}
        </nav>
      </div>

      <div className="px-8 py-6">
        {/* ─── Weather tab ─── */}
        {tab === 'weather' && (
          <div className="space-y-6 max-w-4xl">
            {weatherLoading && <LoadingSpinner label="Fetching weather data…" />}
            {weather && (
              <>
                <section>
                  <SectionLabel>Field actions — next 24h</SectionLabel>
                  <NextActions farmId={id} />
                </section>

                <section>
                  <SectionLabel>Current conditions</SectionLabel>
                  <CurrentConditions
                    current={weather.current}
                    aiSummary={weather.ai_summary}
                  />
                </section>

                <section>
                  <SectionLabel>7-day forecast</SectionLabel>
                  <DailyForecast days={weather.daily} />
                </section>

                <section>
                  <SectionLabel>Charts</SectionLabel>
                  <div className="bg-white border border-border rounded-lg p-5">
                    <WeatherCharts days={weather.daily} />
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* ─── Alerts tab ─── */}
        {tab === 'alerts' && (
          <div className="max-w-2xl">
            <p className="text-sm text-muted mb-5">
              Configure local advisory thresholds for this farm. On the Free plan,
              these rules help extension teams prioritize field action during high-risk weather.
            </p>
            <AlertPanel farm={farm} />
          </div>
        )}

        {/* ─── Info tab ─── */}
        {tab === 'info' && (
          <div className="max-w-lg space-y-4">
            <InfoRow label="Farm name" value={farm.name} />
            <InfoRow label="Farmer" value={farm.farmer} />
            <InfoRow label="Phone" value={farm.phone} />
            <InfoRow label="County" value={farm.county} />
            <InfoRow label="Crop type" value={farm.cropType} />
            <InfoRow label="Land area" value={`${farm.landAcres} acres`} />
            <InfoRow
              label="Coordinates"
              value={
                <span className="font-mono text-xs">
                  {farm.lat.toFixed(6)}, {farm.lon.toFixed(6)}
                </span>
              }
            />
            <InfoRow label="Notes" value={farm.notes || '—'} />
            <InfoRow
              label="Bomet programme"
              value={
                farm.bomRegistered ? (
                  <Badge label="Registered" variant="green" />
                ) : (
                  <Badge label="Not enrolled" variant="neutral" />
                )
              }
            />
            <InfoRow
              label="Registered on"
              value={new Date(farm.createdAt).toLocaleDateString('en', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />

            <div className="pt-4">
              <a
                href={`https://www.openstreetmap.org/?mlat=${farm.lat}&mlon=${farm.lon}&zoom=14`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium hover:text-green-900 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                View on OpenStreetMap ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">{children}</p>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-2.5 border-b border-border last:border-0">
      <dt className="text-sm text-muted w-36 shrink-0">{label}</dt>
      <dd className="text-sm text-ink font-medium flex-1">{value}</dd>
    </div>
  );
}
