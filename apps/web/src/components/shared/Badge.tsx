type Variant = 'green' | 'amber' | 'red' | 'sky' | 'neutral';

const styles: Record<Variant, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  sky: 'bg-sky-50 text-sky-600 border-sky-100',
  neutral: 'bg-canvas text-muted border-border',
};

type Props = {
  label: string;
  variant?: Variant;
};

export function Badge({ label, variant = 'neutral' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        styles[variant],
      ].join(' ')}
    >
      {label}
    </span>
  );
}
