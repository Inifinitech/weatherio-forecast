type Props = {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'green' | 'amber' | 'red' | 'neutral';
};

const accentBorder: Record<string, string> = {
  green: 'border-l-green-500',
  amber: 'border-l-amber-600',
  red: 'border-l-red-600',
  neutral: 'border-l-border',
};

export function StatCard({ label, value, sub, accent = 'neutral' }: Props) {
  return (
    <div
      className={[
        'bg-white border border-border border-l-2 rounded-lg px-5 py-4',
        accentBorder[accent],
      ].join(' ')}
    >
      <p className="text-2xs uppercase tracking-widest text-muted font-medium">{label}</p>
      <p className="text-3xl font-bold text-ink mt-1 tabular">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}
