import type { GameConfig } from '../types';

export const GAME_CONFIGS: GameConfig[] = [
  {
    id: 'skyjo',
    name: 'Skyjo',
    themeColor: '#3b82f6',
    victoryCondition: 'lowest_score',
    winningScore: 100,
    allowNegative: true,
    description: 'Mantenha sua pontuação baixa para vencer',
    icon: 'cloud',
  },
  {
    id: 'take6',
    name: 'Take 6',
    themeColor: '#ef4444',
    victoryCondition: 'lowest_score',
    winningScore: 66,
    allowNegative: false,
    description: 'Evite pegar cartas de penalidade',
    icon: 'hexagon',
  },
  {
    id: 'uno',
    name: 'UNO',
    themeColor: '#f59e0b',
    victoryCondition: 'highest_score',
    allowNegative: false,
    scoringMode: 'winner_takes_all',
    description: 'Maior pontuação vence',
    icon: 'circle',
  },
  {
    id: 'catan',
    name: 'Catan',
    themeColor: '#10b981',
    victoryCondition: 'highest_score',
    allowNegative: false,
    scoringMode: 'winner_takes_all',
    description: 'Maior pontuação vence',
    icon: 'mountain',
  },
  {
    id: 'generic',
    name: 'Genérico',
    themeColor: '#8b5cf6',
    victoryCondition: 'highest_score',
    allowNegative: true,
    description: 'Para qualquer jogo de mesa',
    icon: 'dices',
  },
];

export const getGameConfig = (gameId: string): GameConfig | undefined => {
  return GAME_CONFIGS.find((game) => game.id === gameId);
};
