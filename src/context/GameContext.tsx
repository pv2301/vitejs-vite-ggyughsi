import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, GameSession, Player, GameConfig, Team, Tournament } from '../types';
import { GAME_CONFIGS } from '../config/games';

interface GameContextType extends AppState {
  availableGames: GameConfig[];
  startNewSession: (gameId: string, players: Player[], teams?: Team[]) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  updateTeamScore: (teamId: string, score: number) => void;
  recordRoundWinner: (winnerId: string) => void; // modo winner_takes_all: +1 para um, 0 para os demais + nextRound
  nextRound: () => void;
  finishSession: () => void;
  addSavedPlayer: (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => void;
  removeSavedPlayer: (playerId: string) => void;
  renameSavedPlayer: (playerId: string, newName: string) => void;
  toggleDarkMode: () => void;
  clearCurrentSession: () => void;
  deleteHistorySession: (sessionId: string) => void;
  createTournament: (name: string, gameId: string, playerIds: string[]) => void;
  linkSessionToTournament: (tournamentId: string, sessionId: string) => void;
  finishTournament: (tournamentId: string) => void;
  deleteTournament: (tournamentId: string) => void;
  addCustomGame: (game: GameConfig) => void;
  deleteCustomGame: (gameId: string) => void;
  updateGameOverride: (gameId: string, overrides: Partial<GameConfig>) => void;
  updateGameImage: (gameId: string, imageBase64: string) => void;
  reorderGames: (fromIndex: number, toIndex: number) => void;
}

const STORAGE_KEY = 'scoremaster_data';

const defaultState: AppState = {
  currentSession: null,
  savedPlayers: [],
  gameHistory: [],
  tournaments: [],
  darkMode: true,
  customGames: [],
  gameOverrides: {},
  gameOrder: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          customGames: parsed.customGames ?? [],
          gameOverrides: parsed.gameOverrides ?? {},
          gameOrder: parsed.gameOrder ?? [],
          // migra torneios antigos sem playerIds/status/gamesPlayed
          tournaments: (parsed.tournaments ?? []).map((t: any) => ({
            status: 'active',
            playerIds: [],
            ...t,
            players: (t.players ?? []).map((p: any) => ({
              gamesPlayed: 0,
              ...p,
            })),
          })),
        };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const baseGames: GameConfig[] = [
    ...GAME_CONFIGS.map(g => ({ ...g, ...(state.gameOverrides[g.id] ?? {}) })),
    ...state.customGames,
  ];

  const availableGames: GameConfig[] = state.gameOrder.length > 0
    ? [
        ...state.gameOrder
          .map(id => baseGames.find(g => g.id === id))
          .filter((g): g is GameConfig => g !== undefined),
        ...baseGames.filter(g => !state.gameOrder.includes(g.id)),
      ]
    : baseGames;

  const getEffectiveConfig = (gameId: string): GameConfig | undefined =>
    availableGames.find(g => g.id === gameId);

  const calcPositions = (players: Player[], victoryCondition: string): Player[] => {
    const sorted = [...players].sort((a, b) => {
      if (victoryCondition === 'lowest_score') return (a.totalScore ?? 0) - (b.totalScore ?? 0);
      return (b.totalScore ?? 0) - (a.totalScore ?? 0);
    });
    return sorted.map((p, i) => ({ ...p, position: i + 1 }));
  };

  const calcTeamPositions = (teams: Team[], victoryCondition: string): Team[] => {
    const sorted = [...teams].sort((a, b) => {
      if (victoryCondition === 'lowest_score') return (a.totalScore ?? 0) - (b.totalScore ?? 0);
      return (b.totalScore ?? 0) - (a.totalScore ?? 0);
    });
    return sorted.map((t, i) => ({ ...t, position: i + 1 }));
  };

  const startNewSession = (gameId: string, players: Player[], teams?: Team[]) => {
    const newSession: GameSession = {
      id: Date.now().toString(),
      gameId,
      players: players.map(p => ({ ...p, totalScore: 0, roundScores: [], position: 1 })),
      teams: teams?.map(t => ({ ...t, totalScore: 0, roundScores: [], position: 1 })),
      currentRound: 1,
      status: 'active',
      startedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, currentSession: newSession }));
  };

  const updatePlayerScore = (playerId: string, score: number) => {
    setState(prev => {
      if (!prev.currentSession) return prev;
      const gameConfig = getEffectiveConfig(prev.currentSession.gameId);
      if (!gameConfig) return prev;
      const updatedPlayers = prev.currentSession.players.map(player => {
        if (player.id === playerId) {
          const newRoundScores = [...player.roundScores, score];
          const newTotal = newRoundScores.reduce((a, b) => a + b, 0);
          return { ...player, roundScores: newRoundScores, totalScore: newTotal };
        }
        return player;
      });
      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          players: calcPositions(updatedPlayers, gameConfig.victoryCondition),
        },
      };
    });
  };

  const updateTeamScore = (teamId: string, score: number) => {
    setState(prev => {
      if (!prev.currentSession?.teams) return prev;
      const gameConfig = getEffectiveConfig(prev.currentSession.gameId);
      if (!gameConfig) return prev;
      const updatedTeams = prev.currentSession.teams.map(team => {
        if (team.id === teamId) {
          const newRoundScores = [...team.roundScores, score];
          const newTotal = newRoundScores.reduce((a, b) => a + b, 0);
          return { ...team, roundScores: newRoundScores, totalScore: newTotal };
        }
        return team;
      });
      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          teams: calcTeamPositions(updatedTeams, gameConfig.victoryCondition),
        },
      };
    });
  };

  // Modo winner_takes_all: registra +1 para o vencedor, 0 para os demais, avança rodada
  const recordRoundWinner = (winnerId: string) => {
    setState(prev => {
      if (!prev.currentSession) return prev;
      const gameConfig = getEffectiveConfig(prev.currentSession.gameId);
      if (!gameConfig) return prev;

      const isTeamMode = !!prev.currentSession.teams?.length;

      if (isTeamMode) {
        const updatedTeams = (prev.currentSession.teams ?? []).map(team => {
          const score = team.id === winnerId ? 1 : 0;
          const newRoundScores = [...team.roundScores, score];
          return { ...team, roundScores: newRoundScores, totalScore: newRoundScores.reduce((a, b) => a + b, 0) };
        });
        return {
          ...prev,
          currentSession: {
            ...prev.currentSession,
            teams: calcTeamPositions(updatedTeams, gameConfig.victoryCondition),
            currentRound: prev.currentSession.currentRound + 1,
          },
        };
      } else {
        const updatedPlayers = prev.currentSession.players.map(player => {
          const score = player.id === winnerId ? 1 : 0;
          const newRoundScores = [...player.roundScores, score];
          return { ...player, roundScores: newRoundScores, totalScore: newRoundScores.reduce((a, b) => a + b, 0) };
        });
        return {
          ...prev,
          currentSession: {
            ...prev.currentSession,
            players: calcPositions(updatedPlayers, gameConfig.victoryCondition),
            currentRound: prev.currentSession.currentRound + 1,
          },
        };
      }
    });
  };

  const nextRound = () => setState(prev =>
    prev.currentSession
      ? { ...prev, currentSession: { ...prev.currentSession, currentRound: prev.currentSession.currentRound + 1 } }
      : prev
  );

  const finishSession = () => setState(prev => {
    if (!prev.currentSession) return prev;
    const finished = { ...prev.currentSession, status: 'finished' as const, finishedAt: new Date().toISOString() };
    return { ...prev, currentSession: null, gameHistory: [finished, ...prev.gameHistory] };
  });

  const clearCurrentSession = () => setState(prev => ({ ...prev, currentSession: null }));
  const addSavedPlayer = (p: any) => setState(prev => ({ ...prev, savedPlayers: [...prev.savedPlayers, p] }));
  const removeSavedPlayer = (id: string) => setState(prev => ({ ...prev, savedPlayers: prev.savedPlayers.filter(p => p.id !== id) }));
  const renameSavedPlayer = (id: string, newName: string) => setState(prev => ({ ...prev, savedPlayers: prev.savedPlayers.map(p => p.id === id ? { ...p, name: newName } : p) }));
  const deleteHistorySession = (id: string) => setState(prev => ({ ...prev, gameHistory: prev.gameHistory.filter(s => s.id !== id) }));
  const toggleDarkMode = () => setState(prev => ({ ...prev, darkMode: !prev.darkMode }));

  const createTournament = (name: string, gameId: string, playerIds: string[]) => {
    const t: Tournament = {
      id: Date.now().toString(),
      name,
      gameId,
      playerIds,
      sessions: [],
      players: playerIds.map(pid => ({ playerId: pid, totalPoints: 0, wins: 0, gamesPlayed: 0 })),
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setState(prev => ({ ...prev, tournaments: [...prev.tournaments, t] }));
  };

  const linkSessionToTournament = (tournamentId: string, sessionId: string) => {
    setState(prev => {
      const session = prev.gameHistory.find(s => s.id === sessionId);
      if (!session) return prev;

      const gameConfig = getEffectiveConfig(session.gameId);
      const isLowest = gameConfig?.victoryCondition === 'lowest_score';
      const sorted = [...session.players].sort((a, b) =>
        isLowest ? (a.totalScore ?? 0) - (b.totalScore ?? 0) : (b.totalScore ?? 0) - (a.totalScore ?? 0)
      );
      const winnerId = sorted[0]?.id;

      return {
        ...prev,
        tournaments: prev.tournaments.map(t => {
          if (t.id !== tournamentId) return t;
          const updatedPlayers = t.players.map(tp => {
            const sessionPlayer = session.players.find(p => p.id === tp.playerId);
            if (!sessionPlayer) return tp;
            return {
              ...tp,
              totalPoints: tp.totalPoints + (sessionPlayer.totalScore ?? 0),
              wins: tp.wins + (sessionPlayer.id === winnerId ? 1 : 0),
              gamesPlayed: tp.gamesPlayed + 1,
            };
          });
          return { ...t, sessions: [...t.sessions, sessionId], players: updatedPlayers };
        }),
      };
    });
  };

  const finishTournament = (tournamentId: string) =>
    setState(prev => ({
      ...prev,
      tournaments: prev.tournaments.map(t => t.id === tournamentId ? { ...t, status: 'finished' as const } : t),
    }));

  const deleteTournament = (tournamentId: string) =>
    setState(prev => ({ ...prev, tournaments: prev.tournaments.filter(t => t.id !== tournamentId) }));

  const addCustomGame = (game: GameConfig) => setState(prev => ({ ...prev, customGames: [...prev.customGames, game] }));

  const deleteCustomGame = (gameId: string) => setState(prev => ({
    ...prev,
    customGames: prev.customGames.filter(g => g.id !== gameId),
    gameOrder: prev.gameOrder.filter(id => id !== gameId),
  }));

  const updateGameOverride = (gameId: string, overrides: Partial<GameConfig>) =>
    setState(prev => ({
      ...prev,
      gameOverrides: { ...prev.gameOverrides, [gameId]: { ...(prev.gameOverrides[gameId] ?? {}), ...overrides } },
      customGames: prev.customGames.map(g => g.id === gameId ? { ...g, ...overrides } : g),
    }));

  const updateGameImage = (gameId: string, imageBase64: string) =>
    setState(prev => ({
      ...prev,
      gameOverrides: { ...prev.gameOverrides, [gameId]: { ...(prev.gameOverrides[gameId] ?? {}), imageBase64 } },
      customGames: prev.customGames.map(g => g.id === gameId ? { ...g, imageBase64 } : g),
    }));

  const reorderGames = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const currentOrder = prev.gameOrder.length > 0
        ? prev.gameOrder
        : [...GAME_CONFIGS.map(g => g.id), ...prev.customGames.map(g => g.id)];
      const newOrder = [...currentOrder];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return { ...prev, gameOrder: newOrder };
    });
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        availableGames,
        startNewSession,
        updatePlayerScore,
        updateTeamScore,
        recordRoundWinner,
        nextRound,
        finishSession,
        addSavedPlayer,
        removeSavedPlayer,
        renameSavedPlayer,
        toggleDarkMode,
        clearCurrentSession,
        deleteHistorySession,
        createTournament,
        linkSessionToTournament,
        finishTournament,
        deleteTournament,
        addCustomGame,
        deleteCustomGame,
        updateGameOverride,
        updateGameImage,
        reorderGames,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
