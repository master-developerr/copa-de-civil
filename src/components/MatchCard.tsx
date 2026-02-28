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
      className="block bg-card rounded-lg border border-border hover:border-primary/20 transition-all p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
          {match.isFinal ? '🏆 Final' : `Matchday ${match.matchDay}`}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-md bg-surface flex items-center justify-center shrink-0">
            {home.logo ? (
              <img src={home.logo} alt={home.name} className="h-7 w-7 rounded-sm object-cover" />
            ) : (
              <Shield className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <span className="font-display text-sm tracking-wide truncate">{home.name}</span>
        </div>

        <div className="flex items-center gap-2.5 px-3">
          <span className={`font-display text-2xl ${match.status !== 'upcoming' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.status === 'upcoming' ? '-' : match.homeScore}
          </span>
          <span className="text-muted-foreground text-[10px] uppercase">vs</span>
          <span className={`font-display text-2xl ${match.status !== 'upcoming' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {match.status === 'upcoming' ? '-' : match.awayScore}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
          <span className="font-display text-sm tracking-wide truncate text-right">{away.name}</span>
          <div className="h-9 w-9 rounded-md bg-surface flex items-center justify-center shrink-0">
            {away.logo ? (
              <img src={away.logo} alt={away.name} className="h-7 w-7 rounded-sm object-cover" />
            ) : (
              <Shield className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {match.status === 'live' && match.minute !== undefined && (
        <div className="mt-2 text-center">
          <span className="text-[11px] font-bold text-destructive">{match.minute}'</span>
        </div>
      )}
    </Link>
  );
}
