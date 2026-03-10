import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import { useTournament } from '@/context/TournamentContext';

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { adminLogin } = useTournament();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Admin code is required.');
      return;
    }

    const success = adminLogin(code.trim());
    if (!success) {
      setError('Invalid admin code.');
      return;
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
            ADMIN LOGIN
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          <div className="w-full">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-center">Admin Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-center"
              placeholder="Enter access code"
            />
          </div>

          {error && <p className="text-xs text-destructive text-center w-full">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <LogIn className="h-3.5 w-3.5" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
