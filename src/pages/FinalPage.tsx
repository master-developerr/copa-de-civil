import { Trophy, Shield } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';
import MatchCard from '@/components/MatchCard';

export default function FinalPage() {
  const { finalMatch, getTeam, leagueComplete, getTopTwo } = useTournament();

  const topTwo = getTopTwo();
  const team1 = topTwo[0] ? getTeam(topTwo[0]) : undefined;
  const team2 = topTwo[1] ? getTeam(topTwo[1]) : undefined;

  const champion = finalMatch?.status === 'completed'
    ? (finalMatch.homeScore > finalMatch.awayScore
        ? getTeam(finalMatch.homeTeamId)
        : finalMatch.awayScore > finalMatch.homeScore
          ? getTeam(finalMatch.awayTeamId)
          : undefined)
    : undefined;

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display text-3xl font-bold uppercase mb-8 text-foreground">The Final</h1>

      {champion && (
        <div className="text-center py-12 mb-8 bg-accent/5 border border-accent/20 rounded-xl">
          <Trophy className="h-16 w-16 text-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-4xl font-bold uppercase text-gradient-gold mb-2">
            Champion
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-16 w-16 rounded-xl bg-surface flex items-center justify-center">
              {champion.logo ? (
                <img src={champion.logo} alt={champion.name} className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <Shield className="h-8 w-8 text-accent" />
              )}
            </div>
            <span className="font-display text-3xl font-bold uppercase text-foreground">{champion.name}</span>
          </div>
        </div>
      )}

      {finalMatch ? (
        <div className="border border-accent/20 rounded-xl p-1 bg-accent/5">
          <MatchCard match={finalMatch} />
        </div>
      ) : leagueComplete ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Trophy className="h-12 w-12 text-accent mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">League stage complete!</p>
          {team1 && team2 && (
            <p className="text-foreground font-semibold">
              <span className="text-primary">{team1.name}</span> vs <span className="text-primary">{team2.name}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">Waiting for admin to activate the Final.</p>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>The Final will be available after the league stage is complete.</p>
        </div>
      )}
    </div>
  );
}
