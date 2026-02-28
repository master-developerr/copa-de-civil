import { useTournament } from '@/context/TournamentContext';
import { Target, Handshake, Shield } from 'lucide-react';

export default function PlayerStatsPage() {
  const { playerStats, getTeam } = useTournament();

  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).filter(p => p.goals > 0);
  const topAssists = [...playerStats].sort((a, b) => b.assists - a.assists).filter(p => p.assists > 0);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl tracking-wide mb-6 text-foreground">PLAYER STATS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Scorers */}
        <div className="bg-card rounded-lg border border-border p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Scorers</h2>
          </div>
          {topScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No goals scored yet.</p>
          ) : (
            <div className="space-y-1.5">
              {topScorers.map((p, i) => {
                const team = getTeam(p.teamId);
                return (
                  <div key={p.playerId + i} className={`flex items-center gap-2.5 p-2.5 rounded-md ${i === 0 ? 'bg-primary/[0.05] border border-primary/10' : 'bg-surface'}`}>
                    <span className={`font-display text-base w-6 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground block truncate">{p.playerName}</span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Shield className="h-2.5 w-2.5" />
                        {team?.name || 'Unknown'}
                      </div>
                    </div>
                    <span className="font-display text-xl text-foreground">{p.goals}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Assists */}
        <div className="bg-card rounded-lg border border-border p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Handshake className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Assists</h2>
          </div>
          {topAssists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No assists recorded yet.</p>
          ) : (
            <div className="space-y-1.5">
              {topAssists.map((p, i) => {
                const team = getTeam(p.teamId);
                return (
                  <div key={p.playerId + i} className={`flex items-center gap-2.5 p-2.5 rounded-md ${i === 0 ? 'bg-primary/[0.05] border border-primary/10' : 'bg-surface'}`}>
                    <span className={`font-display text-base w-6 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-foreground block truncate">{p.playerName}</span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Shield className="h-2.5 w-2.5" />
                        {team?.name || 'Unknown'}
                      </div>
                    </div>
                    <span className="font-display text-xl text-foreground">{p.assists}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
