import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, GameSession, Player, Tournament } from '../types';
import { getGameConfig } from '../config/games';

interface GameContextType extends AppState {
  startNewSession: (gameId: string, players: Player[]) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  nextRound: () => void;
  finishSession: () => void;
  addSavedPlayer: (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => void;
  removeSavedPlayer: (playerId: string) => void;
  toggleDarkMode: () => void;
  clearCurrentSession: () => void;
  deleteHistorySession: (sessionId: string) => void;
  createTournament: (name: string, gameId: string) => void;
  addSessionToTournament: (tournamentId: string, sessionId: string) => void;
}

const STORAGE_KEY = 'scoremaster_data';

const defaultState: AppState = {
  currentSession: null,
  savedPlayers: [],
  gameHistory: [],
  tournaments: [],
  darkMode: true,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
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

  const calculatePlayerPosition = (players: Player[], victoryCondition: string): Player[] => {
    const sorted = [...players].sort((a, b) => {
      if (victoryCondition === 'lowest_score') {
        return a.totalScore - b.totalScore;
      }
      return b.totalScore - a.totalScore;
    });

    return sorted.map((player, index) => ({ ...player, position: index + 1 }));
  };

  const startNewSession = (gameId: string, players: Player[]) => {
    const newSession: GameSession = {
      id: Date.now().toString(),
      gameId,
      players: players.map(p => ({ ...p, totalScore: 0, roundScores: [], position: 1 })),
      currentRound: 1,
      status: 'active',
      startedAt: new Date().toISOString(),
    };

    setState(prev => ({ ...prev, currentSession: newSession }));
  };

  const updatePlayerScore = (playerId: string, score: number) => {
    setState(prev => {
      if (!prev.currentSession) return prev;

      const gameConfig = getGameConfig(prev.currentSession.gameId);
      if (!gameConfig) return prev;

      const updatedPlayers = prev.currentSession.players.map(player => {
        if (player.id === playerId) {
          const newRoundScores = [...player.roundScores, score];
          const newTotalScore = newRoundScores.reduce((sum, s) => sum + s, 0);
          return {
            ...player,
            roundScores: newRoundScores,
            totalScore: newTotalScore,
          };
        }
        return player;
      });

      const rankedPlayers = calculatePlayerPosition(updatedPlayers, gameConfig.victoryCondition);

      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          players: rankedPlayers,
        },
      };
    });
  };

  const nextRound = () => {
    setState(prev => {
      if (!prev.currentSession) return prev;

      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          currentRound: prev.currentSession.currentRound + 1,
        },
      };
    });
  };

  const finishSession = () => {
    setState(prev => {
      if (!prev.currentSession) return prev;

      const finishedSession: GameSession = {
        ...prev.currentSession,
        status: 'finished',
        finishedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        currentSession: null,
        gameHistory: [finishedSession, ...prev.gameHistory],
      };
    });
  };

  const clearCurrentSession = () => {
    setState(prev => ({ ...prev, currentSession: null }));
  };

  const addSavedPlayer = (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => {
    setState(prev => ({
      ...prev,
      savedPlayers: [...prev.savedPlayers, player],
    }));
  };

  const removeSavedPlayer = (playerId: string) => {
    setState(prev => ({
      ...prev,
      savedPlayers: prev.savedPlayers.filter(p => p.id !== playerId),
    }));
  };

  const deleteHistorySession = (sessionId: string) => {
    setState(prev => ({
      ...prev,
      gameHistory: prev.gameHistory.filter(s => s.id !== sessionId),
    }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const createTournament = (name: string, gameId: string) => {
    const newTournament: Tournament = {
      id: Date.now().toString(),
      name,
      gameId,
      sessions: [],
      players: [],
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      tournaments: [...prev.tournaments, newTournament],
    }));
  };

  const addSessionToTournament = (tournamentId: string, sessionId: string) => {
    setState(prev => ({
      ...prev,
      tournaments: prev.tournaments.map(t => {
        if (t.id === tournamentId) {
          return { ...t, sessions: [...t.sessions, sessionId] };
        }
        return t;
      }),
    }));
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        startNewSession,
        updatePlayerScore,
        nextRound,
        finishSession,
        addSavedPlayer,
        removeSavedPlayer,
        toggleDarkMode,
        clearCurrentSession,
        deleteHistorySession,
        createTournament,
        addSessionToTournament,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
