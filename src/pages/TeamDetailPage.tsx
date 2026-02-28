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
        <p className="text-sm">Team not found.</p>
        <Link to="/teams" className="text-primary hover:underline mt-4 inline-block text-sm">← Back to Teams</Link>
      </div>
    );
  }

  const sortedPlayers = [...team.players].sort((a, b) => {
    return positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position);
  });

  return (
    <div className="container py-8">
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Teams
      </Link>

      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-md bg-surface flex items-center justify-center">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="h-12 w-12 rounded-sm object-cover" />
            ) : (
              <Shield className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl tracking-wide text-foreground">{team.name}</h1>
            {team.description && <p className="text-xs text-muted-foreground mt-0.5">{team.description}</p>}
          </div>
        </div>

        {stat && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-5">
            {[
              { label: 'Played', value: stat.played },
              { label: 'Wins', value: stat.wins },
              { label: 'Draws', value: stat.draws },
              { label: 'Losses', value: stat.losses },
              { label: 'Goals', value: stat.goalsFor },
              { label: 'Points', value: stat.points, highlight: true },
            ].map(s => (
              <div key={s.label} className="text-center p-2.5 rounded-md bg-surface">
                <div className={`font-display text-xl ${s.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Squad */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Squad</h2>
      {sortedPlayers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No players registered yet.</p>
      ) : (
        <div className="space-y-1">
          {sortedPlayers.map(player => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                player.isCaptain
                  ? 'bg-primary/[0.03] border-primary/10'
                  : 'bg-card border-border'
              }`}
            >
              <div className="h-8 w-8 rounded-md bg-surface flex items-center justify-center font-display text-sm text-foreground">
                {player.jerseyNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-sm text-foreground">{player.name}</span>
                  {player.isCaptain && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                      <Crown className="h-2.5 w-2.5" /> C
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground bg-surface px-1.5 py-0.5 rounded">
                {player.position}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
