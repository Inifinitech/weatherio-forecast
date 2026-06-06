import type { StoredTreeScan } from '@fieldpulse/types';
import { CheckCircle, AlertTriangle, XCircle, Leaf } from 'lucide-react';

type Props = { result: StoredTreeScan };

export function AnalysisResult({ result: r }: Props) {
  const total = r.tree_health.healthy + r.tree_health.needs_care + r.tree_health.needs_replacement;
  const healthPct = total > 0 ? Math.round((r.tree_health.healthy / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Trees counted" value={String(r.total_tree_count)} accent="green" />
        <Metric
          label="Density / acre"
          value={r.tree_density_per_acre ? `${r.tree_density_per_acre.toFixed(1)}` : '—'}
          accent="neutral"
        />
        <Metric
          label="Canopy cover"
          value={r.canopy_coverage_pct ? `${r.canopy_coverage_pct.toFixed(1)}%` : '—'}
          accent="neutral"
        />
        <Metric
          label="Confidence"
          value={`${Math.round(r.confidence_score * 100)}%`}
          accent={r.confidence_score >= 0.8 ? 'green' : 'amber'}
        />
      </div>

      {/* Species guess */}
      {r.tree_species_guess && (
        <div className="flex items-center gap-2 text-sm">
          <Leaf className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-muted">Likely species:</span>
          <span className="font-medium text-ink">{r.tree_species_guess}</span>
        </div>
      )}

      {/* Health breakdown */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-3">
          Canopy health breakdown
        </p>
        <HealthBar
          healthy={r.tree_health.healthy}
          needsCare={r.tree_health.needs_care}
          needsReplacement={r.tree_health.needs_replacement}
          total={total}
        />
        <div className="grid grid-cols-3 gap-2 mt-3">
          <HealthCount icon="healthy" label="Healthy" count={r.tree_health.healthy} />
          <HealthCount icon="care" label="Needs care" count={r.tree_health.needs_care} />
          <HealthCount icon="replace" label="Replace" count={r.tree_health.needs_replacement} />
        </div>
        <p className="text-xs text-muted mt-2">{healthPct}% of trees in healthy condition</p>
      </div>

      {/* Overlay image (if available) */}
      {r.overlay_image_url && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
            Annotated overlay
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.overlay_image_url}
            alt="Tree crown annotated overlay"
            className="w-full rounded-lg border border-border object-cover max-h-72"
          />
        </div>
      )}

      {/* Observations */}
      {r.observations.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
            Observations
          </p>
          <ul className="space-y-1.5">
            {r.observations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500" />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {r.recommendations.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">
            Recommendations
          </p>
          <ul className="space-y-1.5">
            {r.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-2xs text-muted">
        Analysis ID: <span className="font-mono">{r.analysis_id}</span> ·{' '}
        {new Date(r.timestamp).toLocaleString()}
      </p>
    </div>
  );
}

// Sub-components

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'green' | 'amber' | 'neutral';
}) {
  const borderMap = { green: 'border-l-green-500', amber: 'border-l-amber-600', neutral: 'border-l-border' };
  return (
    <div className={`bg-canvas border border-border border-l-2 rounded-lg px-4 py-3 ${borderMap[accent]}`}>
      <p className="text-2xs uppercase tracking-widest text-muted font-medium">{label}</p>
      <p className="text-2xl font-bold tabular text-ink mt-1">{value}</p>
    </div>
  );
}

function HealthBar({
  healthy,
  needsCare,
  needsReplacement,
  total,
}: {
  healthy: number;
  needsCare: number;
  needsReplacement: number;
  total: number;
}) {
  if (total === 0) return null;
  return (
    <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
      <div
        className="bg-green-500 transition-all"
        style={{ width: `${(healthy / total) * 100}%` }}
      />
      <div
        className="bg-amber-500 transition-all"
        style={{ width: `${(needsCare / total) * 100}%` }}
      />
      <div
        className="bg-red-600 transition-all"
        style={{ width: `${(needsReplacement / total) * 100}%` }}
      />
    </div>
  );
}

function HealthCount({
  icon,
  label,
  count,
}: {
  icon: 'healthy' | 'care' | 'replace';
  label: string;
  count: number;
}) {
  const icons = {
    healthy: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
    care: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    replace: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  };
  return (
    <div className="flex items-center gap-1.5 text-sm">
      {icons[icon]}
      <span className="text-muted">{label}:</span>
      <span className="font-semibold tabular text-ink">{count}</span>
    </div>
  );
}
