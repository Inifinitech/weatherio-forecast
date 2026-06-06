type Props = {
  title: string;
  message?: string;
  icon?: React.ReactNode;
};

export function EmptyState({ title, message, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted mb-3 opacity-40">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {message && <p className="text-sm text-muted mt-1 max-w-xs">{message}</p>}
    </div>
  );
}
