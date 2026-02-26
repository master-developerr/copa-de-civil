import { useTournament } from '@/context/TournamentContext';

interface Props {
  mini?: boolean;
}

export default function StandingsTable({ mini = false }: Props) {
  const { standings, getTeam } = useTournament();

  if (standings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No standings available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-3 px-2 font-medium">#</th>
            <th className="text-left py-3 px-2 font-medium">Team</th>
            <th className="text-center py-3 px-2 font-medium">P</th>
            {!mini && (
              <>
                <th className="text-center py-3 px-2 font-medium">W</th>
                <th className="text-center py-3 px-2 font-medium">D</th>
                <th className="text-center py-3 px-2 font-medium">L</th>
                <th className="text-center py-3 px-2 font-medium hidden sm:table-cell">GF</th>
                <th className="text-center py-3 px-2 font-medium hidden sm:table-cell">GA</th>
              </>
            )}
            <th className="text-center py-3 px-2 font-medium">GD</th>
            <th className="text-center py-3 px-2 font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => {
            const team = getTeam(row.teamId);
            const isTopTwo = i < 2;
            return (
              <tr
                key={row.teamId}
                className={`border-b border-border/50 transition-colors hover:bg-secondary/50 ${
                  isTopTwo ? 'bg-primary/5' : ''
                }`}
              >
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                    isTopTwo ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="font-display font-semibold uppercase text-sm">
                    {team?.name || 'Unknown'}
                  </span>
                </td>
                <td className="text-center py-3 px-2">{row.played}</td>
                {!mini && (
                  <>
                    <td className="text-center py-3 px-2">{row.wins}</td>
                    <td className="text-center py-3 px-2">{row.draws}</td>
                    <td className="text-center py-3 px-2">{row.losses}</td>
                    <td className="text-center py-3 px-2 hidden sm:table-cell">{row.goalsFor}</td>
                    <td className="text-center py-3 px-2 hidden sm:table-cell">{row.goalsAgainst}</td>
                  </>
                )}
                <td className="text-center py-3 px-2 font-medium">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                <td className="text-center py-3 px-2">
                  <span className="font-display font-bold text-foreground">{row.points}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
