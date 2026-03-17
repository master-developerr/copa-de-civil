import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Team, Player, Match, MatchEvent, StandingsRow, PlayerStats, MatchStatus, Prediction } from '@/types/tournament';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// Extended Match Type for Context mapping (to handle IDs)
export type ConvexMatch = Omit<Match, 'id' | 'homeTeamId' | 'awayTeamId'> & {
  _id: Id<"matches">;
  homeTeamId: Id<"teams"> | string;
  awayTeamId: Id<"teams"> | string;
};

interface TournamentContextType {
  teams: Team[];
  matches: Match[];
  standings: StandingsRow[];
  playerStats: PlayerStats[];
  predictions: Prediction[];
  isAdmin: boolean;
  tournamentStarted: boolean;
  isPredictorOpen: boolean;
  addPrediction: (prediction: Omit<Prediction, 'id' | 'createdAt'>) => void;
  addTeam: (name: string, description?: string, logo?: string) => boolean;
  removeTeam: (id: string) => void;
  addPlayer: (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'isCaptain'>) => boolean;
  updatePlayer: (teamId: string, playerId: string, updates: { name?: string; position?: string; jerseyNumber?: number }) => void;
  removePlayer: (teamId: string, playerId: string) => void;
  setCaptain: (teamId: string, playerId: string) => void;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number) => void;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, 'id'>) => void;
  updateMatchMinute: (matchId: string, minute: number) => void;
  startExtraTime: (matchId: string) => void;
  startPenalties: (matchId: string) => void;
  updatePenaltyScore: (matchId: string, homeScore: number, awayScore: number) => void;
  setMatchDuration: (matchId: string, duration: number) => void;
  setExtraTimeDuration: (matchId: string, duration: number) => void;
  startMatchTimer: (matchId: string) => void;
  pauseMatchTimer: (matchId: string) => void;
  startSecondHalf: (matchId: string) => void;
  startExtraTimeSecondHalf: (matchId: string) => void;
  startTournament: () => boolean;
  adminLogin: (code: string) => boolean;
  adminLogout: () => void;
  getTeam: (id: string) => Team | undefined;
  getMatch: (id: string) => Match | undefined;
  getLiveMatch: () => Match | undefined;
  getTopTwo: () => string[];
  activateFinal: () => boolean;
  leagueComplete: boolean;
  finalMatch: Match | undefined;
  deleteTournament: () => void;
  uploadLogo: (teamId: string, file: File) => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

const ADMIN_SESSION_KEY = 'admin_session';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
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
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return rows;
}

function calculatePlayerStats(matches: Match[]): PlayerStats[] {
  const statsMap: Record<string, PlayerStats> = {};

  for (const match of matches) {
    for (const event of match.events) {
      if (event.type === 'goal') {
        // Goal scorer
        const key = event.playerId || event.playerName;
        if (!statsMap[key]) {
          statsMap[key] = {
            playerId: event.playerId || '',
            playerName: event.playerName,
            teamId: event.teamId,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
          };
        }
        statsMap[key].goals++;

        // Assist
        if (event.assistPlayerId) {
          const aKey = event.assistPlayerId;
          if (!statsMap[aKey]) {
            statsMap[aKey] = {
              playerId: event.assistPlayerId,
              playerName: event.assistPlayerName || '',
              teamId: event.teamId,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0,
            };
          }
          statsMap[aKey].assists++;
        }
      } else if (event.type === 'yellow_card' || event.type === 'red_card') {
        const key = event.playerId || event.playerName;
        if (!statsMap[key]) {
          statsMap[key] = {
            playerId: event.playerId || '',
            playerName: event.playerName,
            teamId: event.teamId,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
          };
        }
        if (event.type === 'yellow_card') statsMap[key].yellowCards++;
        if (event.type === 'red_card') statsMap[key].redCards++;
      }
    }
  }

  return Object.values(statsMap).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    if (a.redCards !== b.redCards) return a.redCards - b.redCards;
    return a.yellowCards - b.yellowCards;
  });
}

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  // Convex Queries (Realtime Streams)
  const convexTeams = useQuery(api.teams.get) || [];
  const convexMatches = useQuery(api.matches.get) || [];
  const convexPredictions = useQuery(api.predictions.get) || [];
  const convexSettings = useQuery(api.settings.get);

  // Mapped data states to fit legacy application interface
  const teams: Team[] = convexTeams.map(t => ({
    ...t,
    id: t._id,
    players: (t.players as any[]).map(p => ({ ...p, teamId: t._id })) as Player[]
  }));
  const matches: Match[] = convexMatches.map(m => ({
    ...m,
    id: m._id,
    status: m.status as MatchStatus,
    currentHalf: m.currentHalf as any,
    events: (m.events as any[]).map(e => ({ ...e, type: e.type as any })) as MatchEvent[]
  }));
  const predictions: Prediction[] = convexPredictions.map(p => ({ ...p, id: p._id }));

  // Helper to handle storage URLs
  const getStorageUrl = (storageId: string | undefined) => {
    if (!storageId) return undefined;
    if (storageId.startsWith('http')) return storageId;
    return `https://${import.meta.env.VITE_CONVEX_URL.split('//')[1]}/api/storage/${storageId}`;
  };

  const teamsWithLogos = teams.map(t => ({
    ...t,
    logo: getStorageUrl(t.logo)
  }));


  const tournamentStarted = convexSettings?.tournamentStarted || false;

  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(ADMIN_SESSION_KEY) === 'true');

  // Convex Mutations
  const initSettings = useMutation(api.settings.initialize);
  const toggleTournament = useMutation(api.settings.toggleTournamentStarted);
  const deleteTournamentMutation = useMutation(api.settings.deleteTournament);

  const addTeamMutation = useMutation(api.teams.add);
  const removeTeamMutation = useMutation(api.teams.remove);
  const addPlayerMutation = useMutation(api.teams.addPlayer);
  const removePlayerMutation = useMutation(api.teams.removePlayer);
  const updatePlayerMutation = useMutation(api.teams.updatePlayer);
  const setCaptainMutation = useMutation(api.teams.setCaptain);

  const initLeague = useMutation(api.matches.initializeLeague);
  const updateStatusMut = useMutation(api.matches.updateStatus);
  const updateScoreMut = useMutation(api.matches.updateScore);
  const addEventMut = useMutation(api.matches.addEvent);
  const updateMinuteMut = useMutation(api.matches.updateMinute);
  const startTimerMut = useMutation(api.matches.startTimer);
  const pauseTimerMut = useMutation(api.matches.pauseTimer);
  const startSecondHalfMut = useMutation(api.matches.startSecondHalf);
  const startExtraTimeMut = useMutation(api.matches.startExtraTime);
  const startExtraTimeSecondHalfMut = useMutation(api.matches.startExtraTimeSecondHalf);
  const setDurationsMut = useMutation(api.matches.setDurations);
  const startPenaltiesMut = useMutation(api.matches.startPenalties);
  const updatePenaltyScoreMut = useMutation(api.matches.updatePenaltyScore);
  const createFinalMut = useMutation(api.matches.createFinal);

  const addPredictionMutation = useMutation(api.predictions.add);
  const generateUploadUrl = useMutation(api.teams.generateUploadUrl);
  const updateLogoMutation = useMutation(api.teams.updateLogo);


  useEffect(() => {
    initSettings();
  }, []);

  const standings = calculateStandings(teams, matches);
  const playerStats = calculatePlayerStats(matches);
  const leagueMatches = matches.filter(m => !m.isFinal);
  const leagueComplete = leagueMatches.length > 0 && leagueMatches.every(m => m.status === 'completed');
  const finalMatch = matches.find(m => m.isFinal);

  const matchDay3Completed = matches.length > 0 && matches.filter(m => m.matchDay <= 3).every(m => m.status === 'completed');
  const matchDay4Started = matches.some(m => m.matchDay > 3 && m.status !== 'upcoming');
  const isPredictorOpen = matches.length > 0 && !(matchDay3Completed || matchDay4Started);

  const getTopTwo = useCallback(() => {
    if (standings.length < 2) return [];
    return [standings[0].teamId, standings[1].teamId];
  }, [standings]);

  // Rewired Public Methods
  const addTeam = (name: string, description?: string, logo?: string): boolean => {
    if (teams.length >= 4 || tournamentStarted) return false;
    addTeamMutation({ name, description, logo });
    return true;
  };

  const removeTeam = (id: string) => {
    if (tournamentStarted) return;
    removeTeamMutation({ id: id as Id<"teams"> });
  };

  const addPlayer = (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'isCaptain'>): boolean => {
    addPlayerMutation({ teamId: teamId as Id<"teams">, player: { ...player, id: generateId(), isCaptain: false } });
    return true;
  };

  const removePlayer = (teamId: string, playerId: string) => removePlayerMutation({ teamId: teamId as Id<"teams">, playerId });
  const updatePlayer = (teamId: string, playerId: string, updates: { name?: string; position?: string; jerseyNumber?: number }) => {
    updatePlayerMutation({ teamId: teamId as Id<"teams">, playerId, ...updates });
  };
  const setCaptain = (teamId: string, playerId: string) => setCaptainMutation({ teamId: teamId as Id<"teams">, playerId });

  const startTournament = (): boolean => {
    if (teams.length !== 4) return false;

    const pairings = [
      [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]
    ];
    let matchDay = 1;
    const pairs = pairings.map(pair => ({
      home: teams[pair[0]].id,
      away: teams[pair[1]].id,
      matchDay: matchDay++
    }));

    initLeague({ pairs });
    toggleTournament({ started: true });
    return true;
  };

  const adminLogin = (code: string): boolean => {
    if (!convexSettings) return false;
    if (code !== convexSettings.adminCode) return false;
    setIsAdmin(true);
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
    // Logic from API is replicated via updating status, frontend handles resetting timers etc with patches
    updateStatusMut({ id: matchId as Id<"matches">, status });
  }

  const updateMatchScore = (matchId: string, homeScore: number, awayScore: number) => {
    updateScoreMut({ id: matchId as Id<"matches">, homeScore, awayScore });
  }

  const addMatchEvent = (matchId: string, event: Omit<MatchEvent, 'id'>) => {
    addEventMut({ id: matchId as Id<"matches">, event: { ...event, id: generateId() } });

    const match = matches.find(m => m.id === matchId);
    if (match && event.type === 'goal') {
      if (event.teamId === match.homeTeamId) {
        updateScoreMut({ id: matchId as Id<"matches">, homeScore: match.homeScore + 1, awayScore: match.awayScore });
      } else {
        updateScoreMut({ id: matchId as Id<"matches">, homeScore: match.homeScore, awayScore: match.awayScore + 1 });
      }
    }
  }

  const updateMatchMinute = (matchId: string, minute: number) => updateMinuteMut({ id: matchId as Id<"matches">, minute });
  const setMatchDuration = (matchId: string, duration: number) => setDurationsMut({ id: matchId as Id<"matches">, duration });
  const setExtraTimeDuration = (matchId: string, duration: number) => setDurationsMut({ id: matchId as Id<"matches">, extraTimeDuration: duration });

  const startMatchTimer = (matchId: string) => startTimerMut({ id: matchId as Id<"matches"> });
  const pauseMatchTimer = (matchId: string) => pauseTimerMut({ id: matchId as Id<"matches"> });
  const startSecondHalf = (matchId: string) => startSecondHalfMut({ id: matchId as Id<"matches"> });
  const startExtraTime = (matchId: string) => startExtraTimeMut({ id: matchId as Id<"matches"> });
  const startExtraTimeSecondHalf = (matchId: string) => startExtraTimeSecondHalfMut({ id: matchId as Id<"matches"> });
  const startPenalties = (matchId: string) => startPenaltiesMut({ id: matchId as Id<"matches"> });
  const updatePenaltyScore = (matchId: string, homeScore: number, awayScore: number) => updatePenaltyScoreMut({ id: matchId as Id<"matches">, homeScore, awayScore });

  const activateFinal = (): boolean => {
    if (!leagueComplete) return false;
    const top2 = getTopTwo();
    if (top2.length < 2) return false;
    if (finalMatch) return false;

    createFinalMut({ homeTeamId: top2[0], awayTeamId: top2[1] });
    return true;
  };

  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getMatch = (id: string) => matches.find(m => m.id === id);
  const getLiveMatch = () => matches.find(m => m.status === 'live' || m.status === 'half_time' || m.status === 'extra_time' || m.status === 'penalties');

  const addPrediction = (prediction: Omit<Prediction, 'id' | 'createdAt'>) => {
    addPredictionMutation(prediction);
  };

  const deleteTournament = useCallback(async () => {
    if (window.confirm("Are you SURE you want to completely delete the tournament? All teams, matches, and predictions will be wiped forever!")) {
      await deleteTournamentMutation();
      // Convex real-time subscriptions will auto-update the UI
      setIsAdmin(false);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, [deleteTournamentMutation]);

  const uploadLogo = async (teamId: string, file: File) => {
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();
      
      // 2. POST file to Convex
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      const { storageId } = await result.json();
      
      // 3. Update team logo with storageId
      await updateLogoMutation({ teamId: teamId as Id<"teams">, storageId });
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  };


  return (
    <TournamentContext.Provider value={{
      teams: teamsWithLogos, matches, standings, playerStats,
      predictions,
      isAdmin,
      tournamentStarted,
      isPredictorOpen,
      addPrediction,
      addTeam, removeTeam, addPlayer, updatePlayer, removePlayer, setCaptain,
      updateMatchStatus, updateMatchScore, addMatchEvent, updateMatchMinute,
      setMatchDuration, setExtraTimeDuration, startMatchTimer, pauseMatchTimer, startSecondHalf, startExtraTimeSecondHalf,
      startExtraTime, startPenalties, updatePenaltyScore,
      startTournament, adminLogin, adminLogout,
      getTeam, getMatch, getLiveMatch, getTopTwo,
      activateFinal, leagueComplete, finalMatch, deleteTournament,
      uploadLogo,
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
