import StandingsTable from '@/components/StandingsTable';

export default function StandingsPage() {
  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold uppercase mb-8 text-foreground">Standings</h1>
      <div className="bg-card rounded-xl border border-border p-4 md:p-6">
        <StandingsTable />
      </div>
    </div>
  );
}
