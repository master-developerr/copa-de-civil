import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '@/context/TournamentContext';
import { Shield, Users, Calendar, Play, LogOut, Plus, Trash2, Crown, Trophy, Star } from 'lucide-react';
import { Position } from '@/types/tournament';
import StatusBadge from '@/components/StatusBadge';

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'ST', 'LW', 'RW'];

type Tab = 'teams' | 'players' | 'matches' | 'tournament';

export default function AdminDashboard() {
  const {
    teams, matches, isAdmin, tournamentStarted,
    addTeam, removeTeam, addPlayer, removePlayer, setCaptain,
    updateMatchStatus, updateMatchScore, addMatchEvent, updateMatchMinute,
    startTournament, adminLogout, getTeam, leagueComplete,
    activateFinal, finalMatch,
  } = useTournament();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('teams');

  // Team form
  const [teamName, setTeamName] = useState('');
  // Player form
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState<Position>('ST');

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const handleAddTeam = () => {
    if (!teamName.trim()) return;
    addTeam(teamName.trim());
    setTeamName('');
  };

  const handleAddPlayer = () => {
    if (!selectedTeamId || !playerName.trim() || !jerseyNumber) return;
    addPlayer(selectedTeamId, {
      name: playerName.trim(),
      jerseyNumber: parseInt(jerseyNumber),
      position,
    });
    setPlayerName('');
    setJerseyNumber('');
  };

  const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'tournament', label: 'Tournament', icon: Trophy },
  ];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold uppercase text-foreground">Admin Dashboard</h1>
        <button
          onClick={() => { adminLogout(); navigate('/'); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div className="space-y-6">
          {!tournamentStarted && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold mb-3 text-foreground">Add Team ({teams.length}/4)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  maxLength={50}
                />
                <button
                  onClick={handleAddTeam}
                  disabled={teams.length >= 4}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="font-display font-semibold uppercase text-foreground">{team.name}</span>
                  <span className="text-xs text-muted-foreground">{team.players.length} players</span>
                </div>
                {!tournamentStarted && (
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players Tab */}
      {tab === 'players' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3 text-foreground">Add Player</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Player name"
                maxLength={50}
                className="px-3 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="number"
                value={jerseyNumber}
                onChange={e => setJerseyNumber(e.target.value)}
                placeholder="Jersey #"
                min={1}
                max={99}
                className="px-3 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <select
                value={position}
                onChange={e => setPosition(e.target.value as Position)}
                className="px-3 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button
              onClick={handleAddPlayer}
              className="mt-3 flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Add Player
            </button>
          </div>

          {teams.map(team => (
            <div key={team.id} className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display font-bold uppercase text-sm mb-3 text-foreground">{team.name}</h3>
              {team.players.length === 0 ? (
                <p className="text-sm text-muted-foreground">No players yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {team.players.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-sm py-1.5">
                      <span className="font-mono text-muted-foreground w-6 text-center text-xs">{p.jerseyNumber}</span>
                      <span className="text-foreground flex-1">{p.name}</span>
                      {p.isCaptain && <Crown className="h-3.5 w-3.5 text-accent" />}
                      <span className="text-xs text-muted-foreground">{p.position}</span>
                      <button
                        onClick={() => setCaptain(team.id, p.id)}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          p.isCaptain ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-accent'
                        }`}
                        title="Set as captain"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removePlayer(team.id, p.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Matches Tab */}
      {tab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Start the tournament to generate fixtures.</p>
          ) : (
            matches.map(match => {
              const home = getTeam(match.homeTeamId);
              const away = getTeam(match.awayTeamId);
              if (!home || !away) return null;

              return (
                <div key={match.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {match.isFinal ? '🏆 Final' : `Match Day ${match.matchDay}`}
                    </span>
                    <StatusBadge status={match.status} />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <span className="font-display font-bold uppercase text-sm text-foreground">{home.name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={match.homeScore}
                        onChange={e => updateMatchScore(match.id, parseInt(e.target.value) || 0, match.awayScore)}
                        className="w-14 text-center px-2 py-1 rounded bg-surface border border-border text-foreground font-display text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="text-muted-foreground">-</span>
                      <input
                        type="number"
                        min={0}
                        value={match.awayScore}
                        onChange={e => updateMatchScore(match.id, match.homeScore, parseInt(e.target.value) || 0)}
                        className="w-14 text-center px-2 py-1 rounded bg-surface border border-border text-foreground font-display text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <span className="font-display font-bold uppercase text-sm text-foreground">{away.name}</span>
                  </div>

                  {match.status === 'live' && (
                    <div className="flex items-center justify-center gap-2">
                      <label className="text-xs text-muted-foreground">Minute:</label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={match.minute || 0}
                        onChange={e => updateMatchMinute(match.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center px-2 py-1 rounded bg-surface border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {match.status === 'upcoming' && (
                      <button
                        onClick={() => updateMatchStatus(match.id, 'live')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
                      >
                        <Play className="h-3 w-3" /> Go Live
                      </button>
                    )}
                    {match.status === 'live' && (
                      <button
                        onClick={() => updateMatchStatus(match.id, 'completed')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors"
                      >
                        Full Time
                      </button>
                    )}
                    {match.status === 'completed' && (
                      <button
                        onClick={() => updateMatchStatus(match.id, 'upcoming')}
                        className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tournament Tab */}
      {tab === 'tournament' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-3 text-foreground">Tournament Control</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Teams Registered</span>
                <span className="font-bold text-foreground">{teams.length}/4</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Tournament Started</span>
                <span className={`font-bold ${tournamentStarted ? 'text-primary' : 'text-muted-foreground'}`}>
                  {tournamentStarted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">League Complete</span>
                <span className={`font-bold ${leagueComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                  {leagueComplete ? 'Yes' : 'No'}
                </span>
              </div>

              {!tournamentStarted && (
                <button
                  onClick={startTournament}
                  disabled={teams.length !== 4}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Play className="h-4 w-4" /> Start Tournament
                </button>
              )}

              {leagueComplete && !finalMatch && (
                <button
                  onClick={activateFinal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  <Trophy className="h-4 w-4" /> Activate Final
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
