import { useTournament } from '@/context/TournamentContext';

interface Props {
  mini?: boolean;
}

export default function StandingsTable({ mini = false }: Props) {
  const { standings, getTeam } = useTournament();

  if (standings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No standings available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">#</th>
            <th className="text-left py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Team</th>
            <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">P</th>
            {!mini && (
              <>
                <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">W</th>
                <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">D</th>
                <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">L</th>
                <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">GF</th>
                <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">GA</th>
              </>
            )}
            <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">GD</th>
            <th className="text-center py-2.5 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const team = getTeam(row.teamId);
            const isTopTwo = i < 2;
            return (
              <tr
                key={row.teamId}
                className={`border-b border-border/30 transition-colors hover:bg-secondary/30 ${
                  isTopTwo ? 'bg-primary/[0.03]' : ''
                }`}
              >
                <td className="py-2.5 px-2">
                  <span className={`inline-flex items-center justify-center h-5 w-5 rounded text-[11px] font-bold ${
                    isTopTwo ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-2.5 px-2">
                  <span className="font-semibold text-sm text-foreground">
                    {team?.name || 'Unknown'}
                  </span>
                </td>
                <td className="text-center py-2.5 px-2 text-muted-foreground">{row.played}</td>
                {!mini && (
                  <>
                    <td className="text-center py-2.5 px-2 text-muted-foreground">{row.wins}</td>
                    <td className="text-center py-2.5 px-2 text-muted-foreground">{row.draws}</td>
                    <td className="text-center py-2.5 px-2 text-muted-foreground">{row.losses}</td>
                    <td className="text-center py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{row.goalsFor}</td>
                    <td className="text-center py-2.5 px-2 text-muted-foreground hidden sm:table-cell">{row.goalsAgainst}</td>
                  </>
                )}
                <td className="text-center py-2.5 px-2 font-medium text-foreground">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                <td className="text-center py-2.5 px-2">
                  <span className="font-bold text-primary">{row.points}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
