import { useTournament } from '@/context/TournamentContext';
import MatchCard from '@/components/MatchCard';
import { Calendar } from 'lucide-react';

export default function FixturesPage() {
  const { matches } = useTournament();
  const leagueMatches = matches.filter(m => !m.isFinal);
  const finalMatch = matches.find(m => m.isFinal);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl tracking-wide mb-6 text-foreground">FIXTURES</h1>

      {leagueMatches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Tournament hasn't started yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">League Stage</h2>
          {leagueMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {finalMatch && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">🏆 Final</h2>
          <div className="border border-primary/15 rounded-lg p-1 bg-primary/[0.02]">
            <MatchCard match={finalMatch} />
          </div>
        </div>
      )}
    </div>
  );
}
