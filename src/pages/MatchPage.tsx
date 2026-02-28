import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Crown } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';
import StatusBadge from '@/components/StatusBadge';

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const { getMatch, getTeam } = useTournament();
  const match = getMatch(id || '');

  if (!match) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        <p className="text-sm">Match not found.</p>
        <Link to="/fixtures" className="text-primary hover:underline mt-4 inline-block text-sm">← Back to Fixtures</Link>
      </div>
    );
  }

  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);

  if (!home || !away) return null;

  const homeCaptain = home.players.find(p => p.isCaptain);
  const awayCaptain = away.players.find(p => p.isCaptain);

  return (
    <div className="container py-8 max-w-3xl">
      <Link to="/fixtures" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Fixtures
      </Link>

      {/* Scoreboard */}
      <div className={`rounded-lg border p-6 md:p-8 mb-5 ${
        match.isFinal ? 'bg-primary/[0.02] border-primary/15' : 'bg-card border-border'
      }`}>
        {match.isFinal && (
          <div className="text-center mb-3">
            <span className="text-gradient-gold font-display text-lg tracking-wider">🏆 FINAL</span>
          </div>
        )}
        <div className="text-center mb-4">
          <StatusBadge status={match.status} />
          {match.status === 'live' && match.minute !== undefined && (
            <span className="ml-2 text-xs font-bold text-destructive">{match.minute}'</span>
          )}
          {match.status === 'half_time' && (
            <span className="ml-2 text-xs font-bold text-primary">Half Time</span>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 md:gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-md bg-surface flex items-center justify-center">
              {home.logo ? (
                <img src={home.logo} alt={home.name} className="h-10 w-10 md:h-12 md:w-12 rounded-sm object-cover" />
              ) : (
                <Shield className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <span className="font-display text-sm md:text-base tracking-wide text-center">{home.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-4xl md:text-5xl text-foreground">
              {match.status === 'upcoming' ? '-' : match.homeScore}
            </span>
            <span className="text-muted-foreground text-sm">:</span>
            <span className="font-display text-4xl md:text-5xl text-foreground">
              {match.status === 'upcoming' ? '-' : match.awayScore}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-md bg-surface flex items-center justify-center">
              {away.logo ? (
                <img src={away.logo} alt={away.name} className="h-10 w-10 md:h-12 md:w-12 rounded-sm object-cover" />
              ) : (
                <Shield className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <span className="font-display text-sm md:text-base tracking-wide text-center">{away.name}</span>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {match.events.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 md:p-5 mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Match Events</h3>
          <div className="space-y-2">
            {match.events
              .sort((a, b) => a.minute - b.minute)
              .map(event => (
                <div key={event.id} className="flex items-center gap-2.5 text-sm">
                  <span className="font-mono text-muted-foreground text-xs w-7 text-right">{event.minute}'</span>
                  <span className="text-sm">
                    {event.type === 'goal' && '⚽'}
                    {event.type === 'yellow_card' && '🟨'}
                    {event.type === 'red_card' && '🟥'}
                  </span>
                  <span className="text-foreground font-medium text-sm">{event.playerName}</span>
                  {event.assistPlayerName && (
                    <span className="text-muted-foreground text-[11px]">(assist: {event.assistPlayerName})</span>
                  )}
                  <span className="text-muted-foreground text-[11px]">
                    ({getTeam(event.teamId)?.name})
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Lineups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { team: home, captain: homeCaptain },
          { team: away, captain: awayCaptain },
        ].map(({ team, captain }) => (
          <div key={team.id} className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{team.name}</h3>
            <div className="space-y-1">
              {team.players.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="font-mono text-muted-foreground w-5 text-center text-[11px]">{p.jerseyNumber}</span>
                  <span className="text-foreground flex-1 text-sm">{p.name}</span>
                  {p.isCaptain && <Crown className="h-3 w-3 text-primary" />}
                  <span className="text-[11px] text-muted-foreground">{p.position}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
