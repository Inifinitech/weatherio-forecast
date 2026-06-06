'use client';

import { useQuery } from '@tanstack/react-query';
import { Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { aiApi, type RiskLevel } from '@/lib/api';

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  Normal: {
    label: 'Normal',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
  },
  Watch: {
    label: 'Watch',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  },
  'Act Now': {
    label: 'Act Now',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
  },
};

export function NextActions({ farmId }: { farmId: string }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ai-actions', farmId],
    queryFn: () => aiApi.actions(farmId),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });

  const risk = data ? RISK_CONFIG[data.riskLevel] : null;

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-ink">Field Actions</span>
          <span className="text-2xs text-muted uppercase tracking-wide">· {data?.timeframe ?? 'Next 24 hours'}</span>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-2xs text-muted">
              {data.source === 'groq' ? 'Groq AI' : 'Rule-based'}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1 rounded text-muted hover:text-ink transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted py-4">
            <RefreshCw className="w-4 h-4 animate-spin text-green-500" />
            Analysing conditions…
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <p className="text-sm text-red-600 py-2">
            Could not load recommendations.{' '}
            <button onClick={() => refetch()} className="underline">Retry</button>
          </p>
        )}

        {/* Result */}
        {data && risk && (
          <div className="space-y-4">
            {/* Risk badge */}
            <div className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 ${risk.bg} ${risk.border}`}>
              <span className="mt-0.5 shrink-0">{risk.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${risk.text}`}>{data.riskLevel}</p>
                <p className={`text-xs mt-0.5 ${risk.text} opacity-80`}>{data.riskReason}</p>
              </div>
            </div>

            {/* Action list */}
            <ol className="space-y-2">
              {data.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-canvas border border-border text-2xs font-bold text-muted flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink leading-snug">{action}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
