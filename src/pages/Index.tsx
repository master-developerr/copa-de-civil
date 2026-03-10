import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Users, Calendar, BarChart3, Lightbulb } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';
import StandingsTable from '@/components/StandingsTable';
import MatchCard from '@/components/MatchCard';
import heroBanner from '@/assets/hero-banner.png';

export default function LandingPage() {
  const { teams, matches, getLiveMatch, predictions } = useTournament();
  const liveMatch = getLiveMatch();
  const upcomingMatch = matches.find(m => m.status === 'upcoming');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        </div>
        <div className="relative container py-16 md:py-28 text-center">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
            College Football Tournament
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-none mb-3">
            <span className="text-gradient-gold">COPA DE CIVIL</span>
          </h1>
          <p className="font-display text-3xl md:text-4xl text-foreground/80 mb-2">March 13</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
            4 teams. 7 matches. 1 champion.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/fixtures"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              View Fixtures <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/standings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              Standings
            </Link>
          </div>
        </div>
      </section>

      {/* Live Match */}
      {liveMatch && (
        <section className="container -mt-6 relative z-10 mb-6">
          <div className="bg-card border border-destructive/20 rounded-lg p-1">
            <div className="flex items-center gap-2 px-3 pt-2 pb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive live-pulse" />
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Live Now</span>
            </div>
            <MatchCard match={liveMatch} />
          </div>
        </section>
      )}

      <div className="container py-6 space-y-8">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/teams', icon: Users, label: 'Teams', count: teams.length },
            { to: '/fixtures', icon: Calendar, label: 'Fixtures', count: matches.length },
            { to: '/standings', icon: BarChart3, label: 'Standings', count: '' },
            { to: '/predictor', icon: Lightbulb, label: 'Predictor', count: predictions.length },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1.5 p-4 rounded-lg bg-card border border-border hover:border-primary/20 transition-all"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="font-semibold text-xs uppercase tracking-wider text-foreground">{item.label}</span>
              {item.count !== '' && (
                <span className="text-[11px] text-muted-foreground">{item.count}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Predictor Banner */}
        <section>
          <Link to="/predictor" className="block w-full rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-5 hover:border-primary/40 transition-all relative overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-primary/5 -skew-x-12 translate-x-8 group-hover:translate-x-0 transition-transform duration-500" />
            <div className="relative flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg text-foreground tracking-wide">PREDICT & WIN</h2>
                </div>
                <p className="text-sm text-muted-foreground">Guess the finalists, the winner, and the exact score of the Final Match to win exciting prizes!</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center -mr-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </section>

        {/* Upcoming Match */}
        {upcomingMatch && !liveMatch && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Next Match</h2>
            <MatchCard match={upcomingMatch} />
          </section>
        )}

        {/* Standings Preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Standings</h2>
            <Link to="/standings" className="text-xs text-primary hover:underline">View Full →</Link>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <StandingsTable mini />
          </div>
        </section>
      </div>
    </div>
  );
}
