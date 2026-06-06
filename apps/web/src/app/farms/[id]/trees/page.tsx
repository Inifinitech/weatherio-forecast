'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TreePine, Clock } from 'lucide-react';
import { farmApi, treesApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { ImageUpload } from '@/components/trees/ImageUpload';
import { AnalysisResult } from '@/components/trees/AnalysisResult';
import type { StoredTreeScan } from '@fieldpulse/types';

export default function TreesPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [latestResult, setLatestResult] = useState<StoredTreeScan | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const { data: farm, isLoading: farmLoading } = useQuery({
    queryKey: ['farm', id],
    queryFn: () => farmApi.get(id),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['trees-history', id],
    queryFn: () => treesApi.history(id),
  });

  async function handleAnalyse(formData: FormData) {
    setIsAnalysing(true);
    setAnalysisError(null);
    try {
      const result = await treesApi.analyze(formData);
      setLatestResult(result);
      qc.invalidateQueries({ queryKey: ['trees-history', id] });
    } catch (err) {
      setAnalysisError((err as Error).message);
    } finally {
      setIsAnalysing(false);
    }
  }

  if (farmLoading) return <LoadingSpinner label="Loading farm…" />;
  if (!farm) return <p className="px-8 py-6 text-sm text-muted">Farm not found.</p>;

  return (
    <div>
      <PageHeader
        title="Canopy Health Scanner"
        subtitle={`${farm.name} · ${farm.county}`}
        breadcrumbs={[
          { label: 'Overview', href: '/dashboard' },
          { label: farm.name, href: `/farms/${farm.id}` },
          { label: 'Canopy scan' },
        ]}
      />

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        {/* Upload panel */}
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              Upload farm image
            </p>
            <p className="text-sm text-muted">
              Upload a drone, aerial, or satellite image. The AI will count tree crowns,
              assess canopy health, and produce agronomic recommendations.
            </p>
          </div>

          <ImageUpload
            onSubmit={handleAnalyse}
            isLoading={isAnalysing}
            farmId={id}
            county={farm.county}
            landAcres={farm.landAcres}
          />

          {analysisError && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {analysisError}
            </div>
          )}

          {isAnalysing && (
            <div className="mt-4 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-green-800">Analysis in progress</p>
              <p className="text-xs text-green-700 mt-0.5">
                OpenCV is counting tree crowns and Gemini AI is generating recommendations…
              </p>
            </div>
          )}
        </section>

        {/* Results panel */}
        <section>
          {!latestResult && !isAnalysing && (
            <div className="h-full flex flex-col">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                Latest result
              </p>
              <div className="flex-1 border border-dashed border-border rounded-xl">
                <EmptyState
                  icon={<TreePine className="w-10 h-10" />}
                  title="No scan yet"
                  message="Upload an image and run analysis to see tree count, health breakdown, and AI recommendations here."
                />
              </div>
            </div>
          )}

          {latestResult && !isAnalysing && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                Analysis result
              </p>
              <div className="bg-white border border-border rounded-lg p-5">
                <AnalysisResult result={latestResult} />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Scan history */}
      {history.length > 0 && (
        <div className="px-8 pb-8 max-w-5xl">
          <div className="border-t border-border pt-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Scan history — {history.length} past {history.length === 1 ? 'scan' : 'scans'}
            </p>
            <div className="space-y-3">
              {history.map((scan) => (
                <HistoryRow
                  key={scan.analysis_id}
                  scan={scan}
                  onView={() => setLatestResult(scan)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryRow({
  scan,
  onView,
}: {
  scan: StoredTreeScan;
  onView: () => void;
}) {
  const healthPct =
    scan.tree_health.healthy > 0
      ? Math.round(
          (scan.tree_health.healthy /
            (scan.tree_health.healthy +
              scan.tree_health.needs_care +
              scan.tree_health.needs_replacement)) *
            100,
        )
      : 0;

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border border-border rounded-lg">
      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-2xs text-muted uppercase tracking-wide">Date</p>
          <p className="font-medium text-ink">
            {new Date(scan.timestamp).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-2xs text-muted uppercase tracking-wide">Trees</p>
          <p className="font-bold tabular text-ink">{scan.total_tree_count}</p>
        </div>
        <div>
          <p className="text-2xs text-muted uppercase tracking-wide">Canopy</p>
          <p className="font-medium tabular text-ink">{scan.canopy_coverage_pct ? `${scan.canopy_coverage_pct.toFixed(1)}%` : '—'}</p>
        </div>
        <div>
          <p className="text-2xs text-muted uppercase tracking-wide">Health</p>
          <p className="font-medium tabular text-green-700">{healthPct}% good</p>
        </div>
      </div>
      <button
        onClick={onView}
        className="text-xs text-green-700 font-medium hover:text-green-900 transition-colors shrink-0"
      >
        View →
      </button>
    </div>
  );
}
