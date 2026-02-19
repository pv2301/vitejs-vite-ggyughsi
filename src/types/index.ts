export type VictoryCondition = 'lowest_score' | 'highest_score' | 'target_score';
export type ScoringMode = 'numeric' | 'winner_takes_all';

export interface GameConfig {
  id: string;
  name: string;
  themeColor: string;
  victoryCondition: VictoryCondition;
  winningScore?: number;
  allowNegative: boolean;
  roundBased: boolean;
  scoringMode?: ScoringMode; // 'numeric' (padrão) ou 'winner_takes_all' (+1 só para o vencedor)
  description: string;
  icon: string;
  imageBase64?: string;
  isCustom?: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  totalScore: number;
  roundScores: number[];
  position?: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  playerIds: string[]; // IDs dos savedPlayers membros do time
  playerNames: string[]; // nomes dos membros (cache para exibição)
  totalScore: number;
  roundScores: number[];
  position?: number;
}

export interface GameSession {
  id: string;
  gameId: string;
  players: Player[];
  teams?: Team[]; // presente quando jogando em modo times
  currentRound: number;
  status: 'setup' | 'active' | 'finished';
  startedAt: string;
  finishedAt?: string;
}

export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  playerIds: string[]; // jogadores fixos do torneio
  sessions: string[];
  players: {
    playerId: string;
    totalPoints: number;
    wins: number;
    gamesPlayed: number;
  }[];
  createdAt: string;
  status: 'active' | 'finished';
}

export interface AppState {
  currentSession: GameSession | null;
  savedPlayers: Omit<Player, 'totalScore' | 'roundScores' | 'position'>[];
  gameHistory: GameSession[];
  tournaments: Tournament[];
  darkMode: boolean;
  customGames: GameConfig[];
  gameOverrides: Record<string, Partial<GameConfig>>;
  gameOrder: string[];
}
