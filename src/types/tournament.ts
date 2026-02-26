export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LM' | 'RM' | 'ST' | 'LW' | 'RW';

export type MatchStatus = 'upcoming' | 'live' | 'half_time' | 'completed';

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: Position;
  teamId: string;
  isCaptain: boolean;
  photo?: string;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card';
  minute: number;
  playerId?: string;
  playerName: string;
  teamId: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  matchDay: number;
  minute?: number;
  events: MatchEvent[];
  isFinal: boolean;
  duration?: number; // half duration in minutes (e.g. 45 = 45 min halves)
  timerStartedAt?: number; // timestamp when timer started
  timerPausedAt?: number; // accumulated seconds when paused
  currentHalf?: 1 | 2;
}

export interface StandingsRow {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  teamId: string;
  goals: number;
  assists: number;
}

export interface Admin {
  id: string;
  name: string;
  password: string;
}

export interface TournamentState {
  teams: Team[];
  matches: Match[];
  admins: Admin[];
  adminCode: string;
  tournamentStarted: boolean;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  players: Player[];
}
