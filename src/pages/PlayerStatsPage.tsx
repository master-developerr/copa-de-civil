import { useTournament } from '@/context/TournamentContext';
import { Target, Handshake, Shield } from 'lucide-react';

export default function PlayerStatsPage() {
  const { playerStats, getTeam } = useTournament();

  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).filter(p => p.goals > 0);
  const topAssists = [...playerStats].sort((a, b) => b.assists - a.assists).filter(p => p.assists > 0);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold uppercase mb-8 text-foreground">Player Stats</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Scorers */}
        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-accent" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">Top Scorers</h2>
          </div>
          {topScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No goals scored yet.</p>
          ) : (
            <div className="space-y-2">
              {topScorers.map((p, i) => {
                const team = getTeam(p.teamId);
                return (
                  <div key={p.playerId + i} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? 'bg-accent/10 border border-accent/20' : 'bg-surface'}`}>
                    <span className={`font-display font-bold text-lg w-8 text-center ${i === 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground block truncate">{p.playerName}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        {team?.name || 'Unknown'}
                      </div>
                    </div>
                    <span className="font-display text-2xl font-bold text-foreground">{p.goals}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Assists */}
        <div className="bg-card rounded-xl border border-border p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Handshake className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold uppercase text-foreground">Top Assists</h2>
          </div>
          {topAssists.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No assists recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {topAssists.map((p, i) => {
                const team = getTeam(p.teamId);
                return (
                  <div key={p.playerId + i} className={`flex items-center gap-3 p-3 rounded-lg ${i === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-surface'}`}>
                    <span className={`font-display font-bold text-lg w-8 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground block truncate">{p.playerName}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        {team?.name || 'Unknown'}
                      </div>
                    </div>
                    <span className="font-display text-2xl font-bold text-foreground">{p.assists}</span>
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
