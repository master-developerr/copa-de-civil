import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Users, Calendar, BarChart3 } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';
import StandingsTable from '@/components/StandingsTable';
import MatchCard from '@/components/MatchCard';
import heroBanner from '@/assets/hero-banner.png';

export default function LandingPage() {
  const { teams, matches, getLiveMatch } = useTournament();
  const liveMatch = getLiveMatch();
  const upcomingMatch = matches.find(m => m.status === 'upcoming');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        <div className="relative container py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">College Football Tournament</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase leading-tight mb-4">
            <span className="text-gradient-gold">College Cup</span>
            <br />
            <span className="text-foreground">2024</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            4 teams. 7 matches. 1 champion.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/fixtures"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              View Fixtures <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/standings"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
            >
              Standings
            </Link>
          </div>
        </div>
      </section>

      {/* Live Match */}
      {liveMatch && (
        <section className="container -mt-8 relative z-10 mb-8">
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-1">
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <span className="h-2 w-2 rounded-full bg-destructive live-pulse" />
              <span className="text-xs font-bold text-destructive uppercase tracking-wider">Live Now</span>
            </div>
            <MatchCard match={liveMatch} />
          </div>
        </section>
      )}

      <div className="container py-8 space-y-12">
        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { to: '/teams', icon: Users, label: 'Teams', count: teams.length },
            { to: '/fixtures', icon: Calendar, label: 'Fixtures', count: matches.length },
            { to: '/standings', icon: BarChart3, label: 'Standings', count: '' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-2 p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:glow-green transition-all"
            >
              <item.icon className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold text-sm uppercase">{item.label}</span>
              {item.count !== '' && (
                <span className="text-xs text-muted-foreground">{item.count} registered</span>
              )}
            </Link>
          ))}
        </div>

        {/* Upcoming Match */}
        {upcomingMatch && !liveMatch && (
          <section>
            <h2 className="font-display text-xl font-bold uppercase mb-4 text-foreground">Next Match</h2>
            <MatchCard match={upcomingMatch} />
          </section>
        )}

        {/* Standings Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">Standings</h2>
            <Link to="/standings" className="text-sm text-primary hover:underline">View Full Table →</Link>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <StandingsTable mini />
          </div>
        </section>
      </div>
    </div>
  );
}
