import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Team, Player, Match, MatchEvent, StandingsRow, Admin, TournamentState, MatchStatus } from '@/types/tournament';

interface TournamentContextType {
  teams: Team[];
  matches: Match[];
  standings: StandingsRow[];
  isAdmin: boolean;
  tournamentStarted: boolean;
  addTeam: (name: string, description?: string, logo?: string) => boolean;
  removeTeam: (id: string) => void;
  addPlayer: (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'isCaptain'>) => boolean;
  removePlayer: (teamId: string, playerId: string) => void;
  setCaptain: (teamId: string, playerId: string) => void;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number) => void;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, 'id'>) => void;
  updateMatchMinute: (matchId: string, minute: number) => void;
  startTournament: () => boolean;
  adminLogin: (name: string, password: string) => boolean;
  adminRegister: (name: string, password: string, code: string) => boolean;
  adminLogout: () => void;
  getTeam: (id: string) => Team | undefined;
  getMatch: (id: string) => Match | undefined;
  getLiveMatch: () => Match | undefined;
  getTopTwo: () => string[];
  activateFinal: () => boolean;
  leagueComplete: boolean;
  finalMatch: Match | undefined;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

const STORAGE_KEY = 'tournament_data';
const ADMIN_SESSION_KEY = 'admin_session';
const DEFAULT_ADMIN_CODE = 'TOURNEY2024';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function generateLeagueMatches(teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchDay = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: generateId(),
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        matchDay: matchDay++,
        events: [],
        isFinal: false,
      });
    }
  }
  return matches;
}

function calculateStandings(teams: Team[], matches: Match[]): StandingsRow[] {
  const leagueMatches = matches.filter(m => !m.isFinal && m.status === 'completed');
  const rows: StandingsRow[] = teams.map(t => ({
    teamId: t.id,
    played: 0, wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
  }));

  for (const match of leagueMatches) {
    const home = rows.find(r => r.teamId === match.homeTeamId);
    const away = rows.find(r => r.teamId === match.awayTeamId);
    if (!home || !away) continue;

    home.played++; away.played++;
    home.goalsFor += match.homeScore; home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore; away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.wins++; home.points += 3; away.losses++;
    } else if (match.homeScore < match.awayScore) {
      away.wins++; away.points += 3; home.losses++;
    } else {
      home.draws++; away.draws++; home.points++; away.points++;
    }
  }

  rows.forEach(r => r.goalDifference = r.goalsFor - r.goalsAgainst);

  // Sort: points > GD > GF
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return rows;
}

const defaultState: TournamentState = {
  teams: [],
  matches: [],
  admins: [],
  adminCode: DEFAULT_ADMIN_CODE,
  tournamentStarted: false,
};

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TournamentState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultState;
    } catch { return defaultState; }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const standings = calculateStandings(state.teams, state.matches);
  const leagueMatches = state.matches.filter(m => !m.isFinal);
  const leagueComplete = leagueMatches.length > 0 && leagueMatches.every(m => m.status === 'completed');
  const finalMatch = state.matches.find(m => m.isFinal);

  const getTopTwo = useCallback(() => {
    if (standings.length < 2) return [];
    return [standings[0].teamId, standings[1].teamId];
  }, [standings]);

  const addTeam = (name: string, description?: string, logo?: string): boolean => {
    if (state.teams.length >= 4) return false;
    if (state.tournamentStarted) return false;
    setState(s => ({
      ...s,
      teams: [...s.teams, { id: generateId(), name, description, logo, players: [] }],
    }));
    return true;
  };

  const removeTeam = (id: string) => {
    if (state.tournamentStarted) return;
    setState(s => ({ ...s, teams: s.teams.filter(t => t.id !== id) }));
  };

  const addPlayer = (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'isCaptain'>): boolean => {
    const team = state.teams.find(t => t.id === teamId);
    if (!team) return false;
    const newPlayer: Player = { ...player, id: generateId(), teamId, isCaptain: false };
    setState(s => ({
      ...s,
      teams: s.teams.map(t => t.id === teamId ? { ...t, players: [...t.players, newPlayer] } : t),
    }));
    return true;
  };

  const removePlayer = (teamId: string, playerId: string) => {
    setState(s => ({
      ...s,
      teams: s.teams.map(t => t.id === teamId
        ? { ...t, players: t.players.filter(p => p.id !== playerId) }
        : t),
    }));
  };

  const setCaptain = (teamId: string, playerId: string) => {
    setState(s => ({
      ...s,
      teams: s.teams.map(t => t.id === teamId
        ? { ...t, players: t.players.map(p => ({ ...p, isCaptain: p.id === playerId })) }
        : t),
    }));
  };

  const startTournament = (): boolean => {
    if (state.teams.length !== 4) return false;
    const matches = generateLeagueMatches(state.teams);
    setState(s => ({ ...s, tournamentStarted: true, matches }));
    return true;
  };

  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === matchId ? { ...m, status } : m),
    }));
  };

  const updateMatchScore = (matchId: string, homeScore: number, awayScore: number) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === matchId ? { ...m, homeScore, awayScore } : m),
    }));
  };

  const addMatchEvent = (matchId: string, event: Omit<MatchEvent, 'id'>) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === matchId
        ? { ...m, events: [...m.events, { ...event, id: generateId() }] }
        : m),
    }));
  };

  const updateMatchMinute = (matchId: string, minute: number) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === matchId ? { ...m, minute } : m),
    }));
  };

  const activateFinal = (): boolean => {
    if (!leagueComplete) return false;
    const top2 = getTopTwo();
    if (top2.length < 2) return false;
    if (finalMatch) return false;
    const fm: Match = {
      id: generateId(),
      homeTeamId: top2[0],
      awayTeamId: top2[1],
      homeScore: 0,
      awayScore: 0,
      status: 'upcoming',
      matchDay: 7,
      events: [],
      isFinal: true,
    };
    setState(s => ({ ...s, matches: [...s.matches, fm] }));
    return true;
  };

  const adminRegister = (name: string, password: string, code: string): boolean => {
    if (code !== state.adminCode) return false;
    setState(s => ({
      ...s,
      admins: [...s.admins, { id: generateId(), name, password }],
    }));
    setIsAdmin(true);
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  };

  const adminLogin = (name: string, password: string): boolean => {
    const admin = state.admins.find(a => a.name === name && a.password === password);
    if (!admin) return false;
    setIsAdmin(true);
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const getTeam = (id: string) => state.teams.find(t => t.id === id);
  const getMatch = (id: string) => state.matches.find(m => m.id === id);
  const getLiveMatch = () => state.matches.find(m => m.status === 'live');

  return (
    <TournamentContext.Provider value={{
      teams: state.teams, matches: state.matches, standings, isAdmin,
      tournamentStarted: state.tournamentStarted,
      addTeam, removeTeam, addPlayer, removePlayer, setCaptain,
      updateMatchStatus, updateMatchScore, addMatchEvent, updateMatchMinute,
      startTournament, adminLogin, adminRegister, adminLogout,
      getTeam, getMatch, getLiveMatch, getTopTwo,
      activateFinal, leagueComplete, finalMatch,
    }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
}
