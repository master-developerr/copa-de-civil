import { Link } from 'react-router-dom';
import { useTournament } from '@/context/TournamentContext';
import StatusBadge from './StatusBadge';
import { Match } from '@/types/tournament';
import { Shield } from 'lucide-react';

export default function MatchCard({ match }: { match: Match }) {
  const { getTeam } = useTournament();
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);

  if (!home || !away) return null;

  return (
    <Link
      to={`/match/${match.id}`}
      className="block bg-card rounded-lg border border-border hover:border-primary/30 transition-all hover:glow-green p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">
          {match.isFinal ? '🏆 FINAL' : `Match Day ${match.matchDay}`}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center">
            {home.logo ? (
              <img src={home.logo} alt={home.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <span className="font-display text-sm font-semibold uppercase">{home.name}</span>
        </div>

        <div className="flex items-center gap-3 px-4">
          <span className={`font-display text-2xl font-bold ${match.status !== 'upcoming' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.status === 'upcoming' ? '-' : match.homeScore}
          </span>
          <span className="text-muted-foreground text-xs">vs</span>
          <span className={`font-display text-2xl font-bold ${match.status !== 'upcoming' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.status === 'upcoming' ? '-' : match.awayScore}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-display text-sm font-semibold uppercase text-right">{away.name}</span>
          <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center">
            {away.logo ? (
              <img src={away.logo} alt={away.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {match.status === 'live' && match.minute !== undefined && (
        <div className="mt-3 text-center">
          <span className="text-xs font-bold text-destructive">{match.minute}'</span>
        </div>
      )}
    </Link>
  );
}
