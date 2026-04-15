export type VictoryCondition = 'lowest_score' | 'highest_score' | 'target_score';
export type Locale = 'en' | 'pt-BR';
export type ScoringMode = 'numeric' | 'winner_takes_all' | 'duelo';
export type EliminationTrigger = 'manual' | 'score_threshold';

export interface GameConfig {
  id: string;
  name: string;
  themeColor: string;
  victoryCondition: VictoryCondition;
  winningScore?: number;
  allowNegative: boolean;
  roundBased?: boolean;
  scoringMode?: ScoringMode; // 'numeric' (padrão) ou 'winner_takes_all' (+1 só para o vencedor)
  description: string;
  icon: string;
  imageBase64?: string;
  isCustom?: boolean;
  isBuiltin?: boolean;
  timerEnabled?: boolean;
  duelPointsPerTap?: number;
  duelTimerEnabled?: boolean;
  maxRounds?: number;       // 0 ou undefined = ilimitado
  eliminationMode?: boolean;            // ativa mecânica de eliminação
  allowReentry?: boolean;               // permite reentrada (buy-in)
  eliminationTrigger?: EliminationTrigger; // 'manual' ou 'score_threshold'
  eliminationThreshold?: number;        // elimina quando score ≤ threshold
}

export interface CuratedGame {
  id: string;              // base id — o GameConfig terá id = `lib_${id}`
  name: string;
  category: string;        // agrupa variantes na biblioteca
  description: string;
  rulesText: string;       // regras completas (multi-linha, para exibição)
  tags: string[];
  playerCount: string;     // ex: "2-4 jogadores"
  duration: string;        // ex: "30-60 min"
  config: {
    themeColor: string;
    victoryCondition: VictoryCondition;
    winningScore?: number;
    allowNegative: boolean;
    scoringMode: ScoringMode;
    icon: string;
    maxRounds?: number;
    timerEnabled?: boolean;
  };
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar: string;
  totalScore: number;
  roundScores: number[];
  position?: number;
  eliminated?: boolean;
  eliminatedAtRound?: number;
  eliminationOrder?: number;  // 1 = primeiro eliminado
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
  eliminated?: boolean;
  eliminatedAtRound?: number;
  eliminationOrder?: number;
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

export interface UserTag {
  label: string;
  color: string;
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
  userTag?: UserTag;
  locale: Locale;
}
