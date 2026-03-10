import { MatchStatus } from '@/types/tournament';

const statusConfig: Record<MatchStatus, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-secondary text-secondary-foreground' },
  live: { label: 'LIVE', className: 'bg-destructive/10 text-destructive border border-destructive/20' },
  half_time: { label: 'HT', className: 'bg-primary/10 text-primary border border-primary/20' },
  completed: { label: 'FT', className: 'bg-secondary text-muted-foreground' },
  extra_time: { label: 'ET', className: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' },
  penalties: { label: 'PENS', className: 'bg-purple-500/10 text-purple-500 border border-purple-500/20' },
};

export default function StatusBadge({ status }: { status: MatchStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${config?.className || ''}`}>
      {(status === 'live' || status === 'extra_time') && <span className="h-1.5 w-1.5 rounded-full bg-current live-pulse" />}
      {config?.label || status}
    </span>
  );
}
