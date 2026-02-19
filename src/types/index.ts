export type VictoryCondition = 'lowest_score' | 'highest_score' | 'target_score';

export interface GameConfig {
  id: string;
  name: string;
  themeColor: string;
  victoryCondition: VictoryCondition;
  winningScore?: number;
  allowNegative: boolean;
  roundBased: boolean;
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

export interface GameSession {
  id: string;
  gameId: string;
  players: Player[];
  currentRound: number;
  status: 'setup' | 'active' | 'finished';
  startedAt: string;
  finishedAt?: string;
}

export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  sessions: string[];
  players: {
    playerId: string;
    totalPoints: number;
    wins: number;
  }[];
  createdAt: string;
}

export interface AppState {
  currentSession: GameSession | null;
  savedPlayers: Omit<Player, 'totalScore' | 'roundScores' | 'position'>[];
  gameHistory: GameSession[];
  tournaments: Tournament[];
  darkMode: boolean;
  customGames: GameConfig[];
  gameOverrides: Record<string, Partial<GameConfig>>;
  gameOrder: string[]; // IDs dos jogos na ordem desejada
}
