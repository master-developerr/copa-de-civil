import StandingsTable from '@/components/StandingsTable';

export default function StandingsPage() {
  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl tracking-wide mb-6 text-foreground">STANDINGS</h1>
      <div className="bg-card rounded-lg border border-border p-4 md:p-5">
        <StandingsTable />
      </div>
    </div>
  );
}
