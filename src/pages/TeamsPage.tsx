import { Link } from 'react-router-dom';
import { Shield, Crown, Users } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

export default function TeamsPage() {
  const { teams, standings } = useTournament();

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold uppercase mb-8 text-foreground">Teams</h1>

      {teams.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No teams registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map(team => {
            const captain = team.players.find(p => p.isCaptain);
            const stat = standings.find(s => s.teamId === team.id);
            return (
              <Link
                key={team.id}
                to={`/team/${team.id}`}
                className="group bg-card rounded-xl border border-border hover:border-primary/30 hover:glow-green transition-all p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-surface flex items-center justify-center shrink-0">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl font-bold uppercase text-foreground group-hover:text-primary transition-colors">
                      {team.name}
                    </h3>
                    {captain && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="h-3.5 w-3.5 text-accent" />
                        <span className="text-sm text-accent font-medium">{captain.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{team.players.length} Players</span>
                      {stat && (
                        <>
                          <span>{stat.played} Played</span>
                          <span className="font-bold text-foreground">{stat.points} Pts</span>
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
