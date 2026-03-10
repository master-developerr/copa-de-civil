import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart3, Shield, Target, Lightbulb } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

const navItems = [
  { to: '/', label: 'Home', icon: Trophy },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/fixtures', label: 'Fixtures', icon: Calendar },
  { to: '/standings', label: 'Standings', icon: BarChart3 },
  { to: '/stats', label: 'Stats', icon: Target },
  { to: '/predictor', label: 'Predictor', icon: Lightbulb },
  { to: '/final', label: 'Finals', icon: Trophy },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { getLiveMatch, isAdmin } = useTournament();
  const liveMatch = getLiveMatch();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-xl tracking-wide text-foreground">
              COPA DE CIVIL
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {liveMatch && (
              <Link to={`/match/${liveMatch.id}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive live-pulse" />
                <span className="text-[11px] font-semibold text-destructive uppercase">Live</span>
              </Link>
            )}
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs font-medium">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
