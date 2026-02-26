import { useParams, Link } from 'react-router-dom';
import { Shield, Crown, ArrowLeft } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

const positionOrder = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getTeam, standings } = useTournament();
  const team = getTeam(id || '');
  const stat = standings.find(s => s.teamId === id);

  if (!team) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        <p>Team not found.</p>
        <Link to="/teams" className="text-primary hover:underline mt-4 inline-block">← Back to Teams</Link>
      </div>
    );
  }

  const sortedPlayers = [...team.players].sort((a, b) => {
    return positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position);
  });

  return (
    <div className="container py-8">
      <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Teams
      </Link>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-surface flex items-center justify-center">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <Shield className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase text-foreground">{team.name}</h1>
            {team.description && <p className="text-sm text-muted-foreground mt-1">{team.description}</p>}
          </div>
        </div>

        {stat && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-6">
            {[
              { label: 'Played', value: stat.played },
              { label: 'Wins', value: stat.wins },
              { label: 'Draws', value: stat.draws },
              { label: 'Losses', value: stat.losses },
              { label: 'Goals', value: stat.goalsFor },
              { label: 'Points', value: stat.points, highlight: true },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-lg bg-surface">
                <div className={`font-display text-2xl font-bold ${s.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Squad */}
      <h2 className="font-display text-xl font-bold uppercase mb-4 text-foreground">Squad</h2>
      {sortedPlayers.length === 0 ? (
        <p className="text-muted-foreground">No players registered yet.</p>
      ) : (
        <div className="space-y-2">
          {sortedPlayers.map(player => (
            <div
              key={player.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                player.isCaptain
                  ? 'bg-accent/5 border-accent/20'
                  : 'bg-card border-border'
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center font-display font-bold text-sm text-foreground">
                {player.jerseyNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{player.name}</span>
                  {player.isCaptain && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                      <Crown className="h-3 w-3" /> Captain
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground bg-surface px-2 py-1 rounded">
                {player.position}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
