'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { farmApi, usageApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { FarmCard } from '@/components/dashboard/FarmCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { QuickWeatherCard } from '@/components/QuickWeatherCard';
import { RiskZonesCard } from '@/components/RiskZonesCard';

export default function DashboardPage() {
  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ['farms'],
    queryFn: farmApi.list,
  });

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: usageApi.get,
  });

  const requestPct = usage
    ? Math.round((usage.total_requests / usage.plan_limit) * 100)
    : null;

  return (
    <div>
      <PageHeader
        title="Portfolio Overview"
        subtitle={`${new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        action={
          <Link
            href="/farms/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-900 transition-colors font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Register farm
          </Link>
        }
      />

      <div className="px-8 py-6 space-y-8">
        {/* Quick Location & Risk Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickWeatherCard />
          <RiskZonesCard />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Registered farms"
            value={farms.length}
            accent="green"
          />
          <StatCard
            label="Bomet programme"
            value={farms.filter((f) => f.bomRegistered).length}
            sub="Registered farmers"
            accent="green"
          />
          <StatCard
            label="API requests used"
            value={usage ? `${usage.total_requests.toLocaleString()}` : '—'}
            sub={
              requestPct !== null
                ? `${requestPct}% of ${usage?.plan_limit.toLocaleString()} (${usage?.plan} plan)`
                : 'Loading…'
            }
            accent={requestPct !== null && requestPct > 80 ? 'red' : 'neutral'}
          />
          <StatCard
            label="AI requests"
            value={usage ? usage.ai_requests.toLocaleString() : '—'}
            sub={usage ? `of ${usage.ai_limit} limit` : undefined}
            accent="neutral"
          />
        </div>

        {/* Farm grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-widest">
              Managed farms
            </h2>
            {farms.length > 0 && (
              <Link
                href="/farms/new"
                className="text-xs text-green-700 hover:text-green-900 font-medium transition-colors"
              >
                + Add farm
              </Link>
            )}
          </div>

          {farmsLoading && <LoadingSpinner label="Fetching farms…" />}

          {!farmsLoading && farms.length === 0 && (
            <div className="border border-dashed border-border rounded-xl">
              <EmptyState
                title="No farms registered yet"
                message="Register your first farm to start seeing weather forecasts, setting alerts, and running canopy scans."
              />
              <div className="flex justify-center pb-8">
                <Link
                  href="/farms/new"
                  className="flex items-center gap-1.5 text-sm px-5 py-2 bg-green-700 text-white rounded-md hover:bg-green-900 transition-colors font-medium"
                >
                  <PlusCircle className="w-4 h-4" />
                  Register first farm
                </Link>
              </div>
            </div>
          )}

          {farms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {farms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
          )}
        </section>

        {/* Usage meter */}
        {usage && (
          <section id="usage">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-widest mb-4">
              API Usage — {usage.plan} plan
            </h2>
            <div className="bg-white border border-border rounded-lg p-5 space-y-4">
              <UsageMeter
                label="Total requests"
                used={usage.total_requests}
                limit={usage.plan_limit}
                color="bg-green-500"
              />
              <UsageMeter
                label="AI summaries"
                used={usage.ai_requests}
                limit={usage.ai_limit}
                color="bg-amber-500"
              />
              <p className="text-xs text-muted pt-1">
                Billing period:{' '}
                {new Date(usage.billing_start).toLocaleDateString()} –{' '}
                {new Date(usage.billing_end).toLocaleDateString()}
                {' · '}
                Limits reset 30 days from subscription date
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function UsageMeter({
  label,
  used,
  limit,
  color,
}: {
  label: string;
  used: number;
  limit: number;
  color: string;
}) {
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular text-muted">
          {used.toLocaleString()} / {limit.toLocaleString()}
          <span className="ml-2 font-semibold text-ink">{pct}%</span>
        </span>
      </div>
      <div className="h-2 bg-canvas border border-border rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
