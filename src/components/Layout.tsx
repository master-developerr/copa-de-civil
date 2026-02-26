import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart3, Shield, Zap, Target } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

const navItems = [
  { to: '/', label: 'Home', icon: Zap },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/fixtures', label: 'Fixtures', icon: Calendar },
  { to: '/standings', label: 'Standings', icon: BarChart3 },
  { to: '/stats', label: 'Stats', icon: Target },
  { to: '/final', label: 'Final', icon: Trophy },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { getLiveMatch, isAdmin } = useTournament();
  const liveMatch = getLiveMatch();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" />
            <span className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
              College Cup
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {liveMatch && (
              <Link to={`/match/${liveMatch.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30">
                <span className="h-2 w-2 rounded-full bg-destructive live-pulse" />
                <span className="text-xs font-semibold text-destructive uppercase">Live</span>
              </Link>
            )}
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}
