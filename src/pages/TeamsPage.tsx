import { Link } from 'react-router-dom';
import { Shield, Crown, Users } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

export default function TeamsPage() {
  const { teams, standings } = useTournament();

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl tracking-wide mb-6 text-foreground">TEAMS</h1>

      {teams.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No teams registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map(team => {
            const captain = team.players.find(p => p.isCaptain);
            const stat = standings.find(s => s.teamId === team.id);
            return (
              <Link
                key={team.id}
                to={`/team/${team.id}`}
                className="group bg-card rounded-lg border border-border hover:border-primary/20 transition-all p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-md bg-surface flex items-center justify-center shrink-0">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-10 w-10 rounded-sm object-cover" />
                    ) : (
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg tracking-wide text-foreground group-hover:text-primary transition-colors">
                      {team.name}
                    </h3>
                    {captain && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Crown className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium">{captain.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>{team.players.length} Players</span>
                      {stat && (
                        <>
                          <span>{stat.played} Played</span>
                          <span className="font-bold text-primary">{stat.points} Pts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
