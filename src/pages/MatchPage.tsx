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
        <p>Match not found.</p>
        <Link to="/fixtures" className="text-primary hover:underline mt-4 inline-block">← Back to Fixtures</Link>
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
      <Link to="/fixtures" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Fixtures
      </Link>

      {/* Scoreboard */}
      <div className={`rounded-xl border p-8 mb-6 ${
        match.isFinal ? 'bg-accent/5 border-accent/20' : 'bg-card border-border'
      }`}>
        {match.isFinal && (
          <div className="text-center mb-4">
            <span className="text-gradient-gold font-display font-bold uppercase tracking-wider">🏆 Final</span>
          </div>
        )}
        <div className="text-center mb-4">
          <StatusBadge status={match.status} />
          {match.status === 'live' && match.minute !== undefined && (
            <span className="ml-2 text-sm font-bold text-destructive">{match.minute}'</span>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-surface flex items-center justify-center">
              {home.logo ? (
                <img src={home.logo} alt={home.name} className="h-12 w-12 md:h-16 md:w-16 rounded-lg object-cover" />
              ) : (
                <Shield className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <span className="font-display text-sm md:text-lg font-bold uppercase text-center">{home.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-5xl md:text-6xl font-bold text-foreground">
              {match.status === 'upcoming' ? '-' : match.homeScore}
            </span>
            <span className="text-muted-foreground text-xl">:</span>
            <span className="font-display text-5xl md:text-6xl font-bold text-foreground">
              {match.status === 'upcoming' ? '-' : match.awayScore}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-surface flex items-center justify-center">
              {away.logo ? (
                <img src={away.logo} alt={away.name} className="h-12 w-12 md:h-16 md:w-16 rounded-lg object-cover" />
              ) : (
                <Shield className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <span className="font-display text-sm md:text-lg font-bold uppercase text-center">{away.name}</span>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      {match.events.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="font-display font-bold uppercase mb-4 text-foreground">Match Events</h3>
          <div className="space-y-3">
            {match.events
              .sort((a, b) => a.minute - b.minute)
              .map(event => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-muted-foreground w-8 text-right">{event.minute}'</span>
                  <span>
                    {event.type === 'goal' && '⚽'}
                    {event.type === 'yellow_card' && '🟨'}
                    {event.type === 'red_card' && '🟥'}
                  </span>
                  <span className="text-foreground font-medium">{event.playerName}</span>
                  <span className="text-muted-foreground text-xs">
                    ({getTeam(event.teamId)?.name})
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Lineups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { team: home, captain: homeCaptain },
          { team: away, captain: awayCaptain },
        ].map(({ team, captain }) => (
          <div key={team.id} className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-display font-bold uppercase text-sm mb-3 text-foreground">{team.name}</h3>
            <div className="space-y-1.5">
              {team.players.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <span className="font-mono text-muted-foreground w-6 text-center text-xs">{p.jerseyNumber}</span>
                  <span className="text-foreground flex-1">{p.name}</span>
                  {p.isCaptain && <Crown className="h-3.5 w-3.5 text-accent" />}
                  <span className="text-xs text-muted-foreground">{p.position}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
