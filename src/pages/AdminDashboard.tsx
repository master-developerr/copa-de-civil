import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '@/context/TournamentContext';
import { Shield, Users, Calendar, Play, LogOut, Plus, Trash2, Crown, Trophy, Star, Pause, Timer, CircleDot, Pencil, Check } from 'lucide-react';
import { Position, Player } from '@/types/tournament';
import StatusBadge from '@/components/StatusBadge';
import LiveTimer from '@/components/LiveTimer';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'ST', 'LW', 'RW'];

type Tab = 'teams' | 'players' | 'matches' | 'tournament';

/** A number input that uses local state while focused to prevent Convex real-time re-renders from overwriting the value mid-edit. */
function DurationInput({ value, defaultVal, onCommit, min, max, className }: {
  value: number | undefined;
  defaultVal: number;
  onCommit: (v: number) => void;
  min: number;
  max: number;
  className?: string;
}) {
  const [localVal, setLocalVal] = useState(String(value || defaultVal));
  const isFocused = useRef(false);

  // Sync from DB only when NOT focused
  useEffect(() => {
    if (!isFocused.current) {
      setLocalVal(String(value || defaultVal));
    }
  }, [value, defaultVal]);

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={localVal}
      onFocus={() => { isFocused.current = true; }}
      onChange={e => setLocalVal(e.target.value)}
      onBlur={e => {
        isFocused.current = false;
        const parsed = parseInt(e.target.value);
        const final = isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
        setLocalVal(String(final));
        onCommit(final);
      }}
      className={className}
    />
  );
}

export default function AdminDashboard() {
  const {
    teams, matches, isAdmin, tournamentStarted,
    addTeam, removeTeam, addPlayer, updatePlayer, removePlayer, setCaptain,
    updateMatchStatus, addMatchEvent, updateMatchMinute,
    startTournament, adminLogout, getTeam, leagueComplete,
    activateFinal, finalMatch,
    setMatchDuration, setExtraTimeDuration, startMatchTimer, pauseMatchTimer, startSecondHalf, startExtraTimeSecondHalf,
    startExtraTime, startPenalties, updatePenaltyScore, deleteTournament, uploadLogo
  } = useTournament();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('teams');

  const [teamName, setTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState<Position>('ST');

  const [editingPlayer, setEditingPlayer] = useState<{
    teamId: string;
    playerId: string;
    name: string;
    jerseyNumber: string;
    position: Position;
  } | null>(null);

  const [goalDialog, setGoalDialog] = useState<{
    matchId: string;
    teamId: string;
    teamName: string;
    minute: number;
  } | null>(null);
  const [cardDialog, setCardDialog] = useState<{
    matchId: string;
    teamId: string;
    teamName: string;
    minute: number;
    type: 'yellow_card' | 'red_card';
  } | null>(null);
  const [selectedScorer, setSelectedScorer] = useState('');
  const [selectedAssist, setSelectedAssist] = useState('');

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
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;

    try {
      await uploadLogo(uploadingFor, file);
      setUploadingFor(null);
    } catch (err: any) {
      alert("Failed to upload logo: " + (err.message || String(err)));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const openGoalDialog = (matchId: string, teamId: string, match: any) => {
    const team = getTeam(teamId);
    let minute = match.minute || 0;
    if (match.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - match.timerStartedAt) / 1000) + (match.timerPausedAt || 0);
      const halfOffset = match.currentHalf === 2 ? (match.duration || 45) : 0;
      minute = Math.floor(elapsed / 60) + halfOffset;
    }
    setGoalDialog({ matchId, teamId, teamName: team?.name || 'Unknown', minute });
    setSelectedScorer('');
    setSelectedAssist('');
  };

  const openCardDialog = (matchId: string, teamId: string, match: any, type: 'yellow_card' | 'red_card') => {
    const team = getTeam(teamId);
    let minute = match.minute || 0;
    if (match.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - match.timerStartedAt) / 1000) + (match.timerPausedAt || 0);
      const halfOffset = match.currentHalf === 2 ? (match.duration || 45) : 0;
      minute = Math.floor(elapsed / 60) + halfOffset;
    }
    setCardDialog({ matchId, teamId, teamName: team?.name || 'Unknown', minute, type });
    setSelectedScorer(''); // we'll reuse selectedScorer to hold the picked player's ID
  };

  const confirmGoal = () => {
    if (!goalDialog || !selectedScorer) return;
    const team = getTeam(goalDialog.teamId);
    const scorer = team?.players.find(p => p.id === selectedScorer);
    const assister = selectedAssist ? team?.players.find(p => p.id === selectedAssist) : undefined;
    if (!scorer) return;

    addMatchEvent(goalDialog.matchId, {
      type: 'goal',
      minute: goalDialog.minute,
      playerId: scorer.id,
      playerName: scorer.name,
      teamId: goalDialog.teamId,
      assistPlayerId: assister?.id,
      assistPlayerName: assister?.name,
    });

    updateMatchMinute(goalDialog.matchId, goalDialog.minute);
    setGoalDialog(null);
  };

  const confirmCard = () => {
    if (!cardDialog || !selectedScorer) return;
    const team = getTeam(cardDialog.teamId);
    const player = team?.players.find(p => p.id === selectedScorer);
    if (!player) return;

    addMatchEvent(cardDialog.matchId, {
      type: cardDialog.type,
      minute: cardDialog.minute,
      playerId: player.id,
      playerName: player.name,
      teamId: cardDialog.teamId,
    });

    updateMatchMinute(cardDialog.matchId, cardDialog.minute);
    setCardDialog(null);
  };

  const tabs: { id: Tab; label: string; icon: typeof Shield }[] = [
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'tournament', label: 'Tournament', icon: Trophy },
  ];

  const inputClass = "px-3 py-2 rounded-md bg-surface border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";
  const btnPrimary = "flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity";
  const btnSecondary = "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors";

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl tracking-wide text-foreground">ADMIN</h1>
        <button
          onClick={() => { adminLogout(); navigate('/'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-5 overflow-x-auto border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div className="space-y-4">
          {!tournamentStarted && (
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Add Team ({teams.length}/4)</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className={`flex-1 ${inputClass}`}
                  maxLength={50}
                />
                <button onClick={handleAddTeam} disabled={teams.length >= 4} className={`${btnPrimary} disabled:opacity-50`}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-card rounded-md border border-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-surface flex items-center justify-center shrink-0 border border-border">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain" />
                    ) : (
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium text-sm text-foreground">{team.name}</span>
                  <span className="text-[11px] text-muted-foreground">{team.players.length} players</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setUploadingFor(team.id);
                      fileInputRef.current?.click();
                    }}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    title="Upload Logo"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  {!tournamentStarted && (
                    <button onClick={() => removeTeam(team.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            className="hidden"
            accept="image/*"
          />

        </div>
      )}

      {/* Players Tab */}
      {tab === 'players' && (
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Add Player</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} className={inputClass}>
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Player name" maxLength={50} className={inputClass} />
              <input type="number" value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} placeholder="Jersey #" min={1} max={99} className={inputClass} />
              <select value={position} onChange={e => setPosition(e.target.value as Position)} className={inputClass}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={handleAddPlayer} className={`mt-2.5 ${btnPrimary}`}>
              <Plus className="h-3.5 w-3.5" /> Add Player
            </button>
          </div>

          {teams.map(team => (
            <div key={team.id} className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{team.name}</h3>
              {team.players.length === 0 ? (
                <p className="text-xs text-muted-foreground">No players yet.</p>
              ) : (
                <div className="space-y-0.5">
                  {team.players.map(p => {
                    const isEditing = editingPlayer?.teamId === team.id && editingPlayer?.playerId === p.id;

                    if (isEditing) {
                      return (
                        <div key={p.id} className="flex items-center gap-1.5 py-1.5 bg-surface/50 rounded-md px-2 border border-primary/20">
                          <input
                            type="number"
                            value={editingPlayer.jerseyNumber}
                            onChange={e => setEditingPlayer({ ...editingPlayer, jerseyNumber: e.target.value })}
                            className="w-8 text-center font-mono text-[11px] px-1 py-0.5 rounded bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            min={1} max={99}
                          />
                          <input
                            type="text"
                            value={editingPlayer.name}
                            onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                            className="flex-1 text-sm px-2 py-0.5 rounded bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            maxLength={50}
                          />
                          <select
                            value={editingPlayer.position}
                            onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value as Position })}
                            className="text-[11px] px-1 py-0.5 rounded bg-surface border border-border text-foreground focus:outline-none"
                          >
                            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                          </select>
                          <button
                            onClick={() => {
                              const jersey = parseInt(editingPlayer.jerseyNumber);
                              updatePlayer(team.id, p.id, {
                                name: editingPlayer.name.trim() || p.name,
                                position: editingPlayer.position,
                                jerseyNumber: isNaN(jersey) ? p.jerseyNumber : jersey,
                              });
                              setEditingPlayer(null);
                            }}
                            className="p-1 text-primary hover:text-primary/80 transition-colors"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={p.id} className="flex items-center gap-2 text-sm py-1.5">
                        <span className="font-mono text-muted-foreground w-5 text-center text-[11px]">{p.jerseyNumber}</span>
                        <span className="text-foreground flex-1 text-sm">{p.name}</span>
                        {p.isCaptain && <Crown className="h-3 w-3 text-primary" />}
                        <span className="text-[11px] text-muted-foreground">{p.position}</span>
                        <button
                          onClick={() => setEditingPlayer({
                            teamId: team.id,
                            playerId: p.id,
                            name: p.name,
                            jerseyNumber: String(p.jerseyNumber),
                            position: p.position as Position,
                          })}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit player"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setCaptain(team.id, p.id)}
                          className={`p-1 rounded transition-colors ${p.isCaptain ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                          title="Set as captain"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                        <button onClick={() => removePlayer(team.id, p.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Matches Tab */}
      {tab === 'matches' && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Start the tournament to generate fixtures.</p>
          ) : (
            matches.map(match => {
              const home = getTeam(match.homeTeamId);
              const away = getTeam(match.awayTeamId);
              if (!home || !away) return null;

              const isLive = match.status === 'live' || match.status === 'extra_time';
              const isHalfTime = match.status === 'half_time';
              const isUpcoming = match.status === 'upcoming';
              const isCompleted = match.status === 'completed';
              const isPenalties = match.status === 'penalties';

              return (
                <div key={match.id} className={`bg-card rounded-lg border p-4 space-y-3 ${isLive ? 'border-destructive/20' : isHalfTime ? 'border-primary/15' : 'border-border'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {match.isFinal ? '🏆 Final' : `Matchday ${match.matchDay}`}
                    </span>
                    <div className="flex items-center gap-2">
                      {isLive && <LiveTimer match={match} />}
                      <StatusBadge status={match.status} />
                      {isLive && match.currentHalf && (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {match.currentHalf === 1 ? '1H' : match.currentHalf === 2 ? '2H' : 'ET'}
                        </span>
                      )}
                    </div>
                  </div>

                  {isUpcoming && (
                    <div className="flex items-center justify-center gap-2">
                      <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                      <label className="text-[11px] text-muted-foreground">Half duration:</label>
                      <DurationInput
                        value={match.duration}
                        defaultVal={15}
                        min={1}
                        max={90}
                        onCommit={v => setMatchDuration(match.id, v)}
                        className="w-14 text-center px-1.5 py-1 rounded-md bg-surface border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <span className="text-[11px] text-muted-foreground">min</span>
                    </div>
                  )}

                  {/* Scoreboard */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="font-medium text-sm text-foreground">{home.name}</span>
                      {isLive && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openGoalDialog(match.id, match.homeTeamId, match)}
                            className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20 px-2`}
                            title="Goal"
                          >
                            ⚽
                          </button>
                          <button
                            onClick={() => openCardDialog(match.id, match.homeTeamId, match, 'yellow_card')}
                            className={`${btnSecondary} bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-2`}
                            title="Yellow Card"
                          >
                            🟨
                          </button>
                          <button
                            onClick={() => openCardDialog(match.id, match.homeTeamId, match, 'red_card')}
                            className={`${btnSecondary} bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2`}
                            title="Red Card"
                          >
                            🟥
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-4xl text-foreground">
                          {isUpcoming ? '-' : match.homeScore}
                        </span>
                        <span className="text-muted-foreground text-sm">:</span>
                        <span className="font-display text-4xl text-foreground">
                          {isUpcoming ? '-' : match.awayScore}
                        </span>
                      </div>

                      {match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined && (
                        <div className="text-xs font-semibold text-muted-foreground mt-1">
                          Penalties: ({match.homePenaltyScore}) - ({match.awayPenaltyScore})
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <span className="font-medium text-sm text-foreground">{away.name}</span>
                      {isLive && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => openGoalDialog(match.id, match.awayTeamId, match)}
                            className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20 px-2`}
                            title="Goal"
                          >
                            ⚽
                          </button>
                          <button
                            onClick={() => openCardDialog(match.id, match.awayTeamId, match, 'yellow_card')}
                            className={`${btnSecondary} bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-2`}
                            title="Yellow Card"
                          >
                            🟨
                          </button>
                          <button
                            onClick={() => openCardDialog(match.id, match.awayTeamId, match, 'red_card')}
                            className={`${btnSecondary} bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2`}
                            title="Red Card"
                          >
                            🟥
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Events */}
                  {match.events.length > 0 && (
                    <div className="border-t border-border pt-2 space-y-0.5">
                      {match.events
                        .sort((a: any, b: any) => a.minute - b.minute)
                        .map((event: any) => (
                          <div key={event.id} className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono text-muted-foreground w-5 text-right">{event.minute}'</span>
                            <span>{event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : '🟥'}</span>
                            <span className="text-foreground font-medium">{event.playerName}</span>
                            {event.assistPlayerName && (
                              <span className="text-muted-foreground">(assist: {event.assistPlayerName})</span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {isUpcoming && (
                      <button onClick={() => startMatchTimer(match.id)} className={`${btnSecondary} bg-destructive/10 text-destructive hover:bg-destructive/20`}>
                        <Play className="h-3 w-3" /> Kick Off
                      </button>
                    )}
                    {isLive && (
                      <>
                        {match.timerStartedAt ? (
                          <button onClick={() => pauseMatchTimer(match.id)} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                            <Pause className="h-3 w-3" /> Pause
                          </button>
                        ) : (
                          <button onClick={() => startMatchTimer(match.id)} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                            <Play className="h-3 w-3" /> Resume
                          </button>
                        )}
                        {match.currentHalf === 1 && (
                          <button onClick={() => updateMatchStatus(match.id, 'half_time')} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                            Half Time
                          </button>
                        )}
                        {match.currentHalf === 'et1' && (
                          <button onClick={() => updateMatchStatus(match.id, 'half_time')} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                            ET Half Time
                          </button>
                        )}
                        {(match.currentHalf === 2 || match.currentHalf === 'et2') && (
                          <button onClick={() => updateMatchStatus(match.id, 'completed')} className={`${btnSecondary} bg-secondary text-muted-foreground hover:bg-secondary/80`}>
                            Full Time
                          </button>
                        )}
                      </>
                    )}
                    {isHalfTime && match.currentHalf === 1 && (
                      <button onClick={() => startSecondHalf(match.id)} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                        <Play className="h-3 w-3" /> Start 2nd Half
                      </button>
                    )}
                    {isHalfTime && match.currentHalf === 'et1' && (
                      <button onClick={() => startExtraTimeSecondHalf(match.id)} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                        <Play className="h-3 w-3" /> Start ET 2nd Half
                      </button>
                    )}
                    {isCompleted && (
                      <>
                        <div className="flex items-center gap-2 mr-2">
                          <DurationInput
                            value={match.extraTimeDuration}
                            defaultVal={15}
                            min={1}
                            max={30}
                            onCommit={v => setExtraTimeDuration(match.id, v)}
                            className="w-12 text-center px-1.5 py-1 rounded-md bg-surface border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                          <span className="text-[11px] text-muted-foreground leading-none">ET min</span>
                        </div>
                        <button onClick={() => startExtraTime(match.id)} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                          Extra Time
                        </button>
                        <button onClick={() => startPenalties(match.id)} className={`${btnSecondary} bg-primary/10 text-primary hover:bg-primary/20`}>
                          Penalties
                        </button>
                        <button onClick={() => updateMatchStatus(match.id, 'upcoming')} className={`${btnSecondary} bg-secondary text-secondary-foreground hover:bg-secondary/80 ml-auto`}>
                          Reset
                        </button>
                      </>
                    )}

                    {isPenalties && (
                      <div className="flex items-center gap-2 p-2 border border-border rounded-md bg-surface/50 w-full mt-2">
                        <span className="text-xs font-semibold text-muted-foreground">Penalties:</span>
                        <input
                          type="number" min={0}
                          value={match.homePenaltyScore ?? ''}
                          onChange={e => updatePenaltyScore(match.id, parseInt(e.target.value) || 0, match.awayPenaltyScore || 0)}
                          className="w-12 text-center px-1.5 py-1 rounded-md bg-surface border border-border text-xs"
                          placeholder={home.name}
                        />
                        <span className="text-xs text-muted-foreground">-</span>
                        <input
                          type="number" min={0}
                          value={match.awayPenaltyScore ?? ''}
                          onChange={e => updatePenaltyScore(match.id, match.homePenaltyScore || 0, parseInt(e.target.value) || 0)}
                          className="w-12 text-center px-1.5 py-1 rounded-md bg-surface border border-border text-xs"
                          placeholder={away.name}
                        />
                        <button
                          onClick={() => updateMatchStatus(match.id, 'completed')}
                          className={`${btnSecondary} bg-primary text-primary-foreground hover:bg-primary/90 ml-auto`}
                        >
                          End
                        </button>
                      </div>
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
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Tournament Control</h3>
            <div className="space-y-2">
              {[
                { label: 'Teams Registered', value: `${teams.length}/4` },
                { label: 'Tournament Started', value: tournamentStarted ? 'Yes' : 'No', highlight: tournamentStarted },
                { label: 'League Complete', value: leagueComplete ? 'Yes' : 'No', highlight: leagueComplete },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-medium ${item.highlight ? 'text-primary' : 'text-foreground'}`}>
                    {item.value}
                  </span>
                </div>
              ))}

              {!tournamentStarted && (
                <button
                  onClick={startTournament}
                  disabled={teams.length !== 4}
                  className={`w-full mt-3 ${btnPrimary} justify-center py-2.5 disabled:opacity-50`}
                >
                  <Play className="h-3.5 w-3.5" /> Start Tournament
                </button>
              )}

              {leagueComplete && !finalMatch && (
                <button
                  onClick={activateFinal}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Trophy className="h-3.5 w-3.5" /> Activate Final
                </button>
              )}
            </div>

            <div className="pt-8 mt-4 border-t border-destructive/20">
              <h4 className="text-sm font-semibold text-destructive mb-2">Danger Zone</h4>
              <button
                onClick={deleteTournament}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors border border-destructive/20"
              >
                <Trash2 className="h-4 w-4" /> Delete Entire Tournament
              </button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">This will permanently wipe all teams, matches, predictions, and settings.</p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Dialog */}
      <Dialog open={!!goalDialog} onOpenChange={(open) => !open && setGoalDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide text-lg">⚽ GOAL — {goalDialog?.teamName}</DialogTitle>
            <DialogDescription className="text-xs">
              Minute {goalDialog?.minute}' — Select scorer and optional assist.
            </DialogDescription>
          </DialogHeader>
          {goalDialog && (() => {
            const team = getTeam(goalDialog.teamId);
            const players = team?.players || [];
            return (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Goal Scorer *</label>
                  <div className="space-y-0.5 max-h-44 overflow-y-auto">
                    {players.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedScorer(p.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${selectedScorer === p.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface hover:bg-surface-hover text-foreground'
                          }`}
                      >
                        <span className="font-mono text-[11px] text-muted-foreground w-5">{p.jerseyNumber}</span>
                        <span className="flex-1">{p.name}</span>
                        <span className="text-[11px] text-muted-foreground">{p.position}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Assist (optional)</label>
                  <div className="space-y-0.5 max-h-44 overflow-y-auto">
                    <button
                      onClick={() => setSelectedAssist('')}
                      className={`w-full px-3 py-2 rounded-md text-sm transition-colors text-left ${selectedAssist === '' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface hover:bg-surface-hover text-muted-foreground'
                        }`}
                    >
                      No assist
                    </button>
                    {players.filter(p => p.id !== selectedScorer).map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedAssist(p.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${selectedAssist === p.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface hover:bg-surface-hover text-foreground'
                          }`}
                      >
                        <span className="font-mono text-[11px] text-muted-foreground w-5">{p.jerseyNumber}</span>
                        <span className="flex-1">{p.name}</span>
                        <span className="text-[11px] text-muted-foreground">{p.position}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={confirmGoal}
                  disabled={!selectedScorer}
                  className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  Confirm Goal
                </button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Card Dialog */}
      <Dialog open={!!cardDialog} onOpenChange={(open) => !open && setCardDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wide text-lg">
              {cardDialog?.type === 'yellow_card' ? '🟨 YELLOW CARD' : '🟥 RED CARD'} — {cardDialog?.teamName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Minute {cardDialog?.minute}' — Select the player who received the card.
            </DialogDescription>
          </DialogHeader>
          {cardDialog && (() => {
            const team = getTeam(cardDialog.teamId);
            const players = team?.players || [];
            return (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Player *</label>
                  <div className="space-y-0.5 max-h-44 overflow-y-auto">
                    {players.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedScorer(p.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${selectedScorer === p.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface hover:bg-surface-hover text-foreground'
                          }`}
                      >
                        <span className="font-mono text-[11px] text-muted-foreground w-5">{p.jerseyNumber}</span>
                        <span className="flex-1">{p.name}</span>
                        <span className="text-[11px] text-muted-foreground">{p.position}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={confirmCard}
                  disabled={!selectedScorer}
                  className={`w-full py-2.5 rounded-md text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity ${cardDialog.type === 'yellow_card' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                >
                  Confirm Card
                </button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div >
  );
}
