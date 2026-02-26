import { useTournament } from '@/context/TournamentContext';
import MatchCard from '@/components/MatchCard';
import { Calendar } from 'lucide-react';

export default function FixturesPage() {
  const { matches } = useTournament();
  const leagueMatches = matches.filter(m => !m.isFinal);
  const finalMatch = matches.find(m => m.isFinal);

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold uppercase mb-8 text-foreground">Fixtures</h1>

      {leagueMatches.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Tournament hasn't started yet. No fixtures available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold uppercase text-muted-foreground">League Stage</h2>
          {leagueMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

      {finalMatch && (
        <div className="mt-8 space-y-4">
          <h2 className="font-display text-lg font-bold uppercase text-gradient-gold">🏆 Final</h2>
          <div className="border border-accent/20 rounded-xl p-1 bg-accent/5">
            <MatchCard match={finalMatch} />
          </div>
        </div>
      )}
    </div>
  );
}
