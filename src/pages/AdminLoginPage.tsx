import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LogIn, UserPlus } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

export default function AdminLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, adminRegister } = useTournament();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'register') {
      if (!code.trim()) { setError('Admin code is required.'); return; }
      const success = adminRegister(name.trim(), password, code.trim());
      if (!success) { setError('Invalid admin code.'); return; }
    } else {
      const success = adminLogin(name.trim(), password);
      if (!success) { setError('Invalid credentials.'); return; }
    }
    navigate('/admin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 mb-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl tracking-wide text-foreground">
            {mode === 'login' ? 'ADMIN LOGIN' : 'ADMIN REGISTER'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="Admin name"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Admin Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="Enter access code"
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {mode === 'login' ? <LogIn className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-3"
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
