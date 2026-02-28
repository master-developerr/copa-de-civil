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
      <h1 className="font-display text-3xl tracking-wide mb-6 text-foreground">THE FINAL</h1>

      {champion && (
        <div className="text-center py-10 mb-6 bg-primary/[0.03] border border-primary/10 rounded-lg">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
          <h2 className="font-display text-2xl md:text-4xl text-gradient-gold mb-2">
            CHAMPION
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-14 w-14 rounded-md bg-surface flex items-center justify-center">
              {champion.logo ? (
                <img src={champion.logo} alt={champion.name} className="h-10 w-10 rounded-sm object-cover" />
              ) : (
                <Shield className="h-6 w-6 text-primary" />
              )}
            </div>
            <span className="font-display text-2xl tracking-wide text-foreground">{champion.name}</span>
          </div>
        </div>
      )}

      {finalMatch ? (
        <div className="border border-primary/10 rounded-lg p-1 bg-primary/[0.02]">
          <MatchCard match={finalMatch} />
        </div>
      ) : leagueComplete ? (
        <div className="text-center py-10 bg-card rounded-lg border border-border">
          <Trophy className="h-10 w-10 text-primary mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground mb-1">League stage complete!</p>
          {team1 && team2 && (
            <p className="text-foreground font-medium text-sm">
              <span className="text-primary">{team1.name}</span> vs <span className="text-primary">{team2.name}</span>
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-2">Waiting for admin to activate the Final.</p>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">The Final will be available after the league stage is complete.</p>
        </div>
      )}
    </div>
  );
}
