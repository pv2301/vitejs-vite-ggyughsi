import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, GameSession, Player, GameConfig } from '../types';
import { GAME_CONFIGS, getGameConfig } from '../config/games';

// 1. Interface atualizada com a lista de jogos
interface GameContextType extends AppState {
  availableGames: GameConfig[]; 
  startNewSession: (gameId: string, players: Player[], sessionId?: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  nextRound: () => void;
  finishSession: () => void;
  addSavedPlayer: (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => void;
  removeSavedPlayer: (playerId: string) => void;
  renameSavedPlayer: (playerId: string, newName: string) => void;
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
      const scoreA = a.totalScore ?? 0;
      const scoreB = b.totalScore ?? 0;
      if (victoryCondition === 'lowest_score') return scoreA - scoreB;
      return scoreB - scoreA;
    });
    return sorted.map((player, index) => ({ ...player, position: index + 1 }));
  };

  const startNewSession = (gameId: string, players: Player[], sessionId?: string) => {
    const newSession: GameSession = {
      id: sessionId ?? Date.now().toString(),
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
          const newTotal = newRoundScores.reduce((a, b) => a + b, 0);
          return { ...player, roundScores: newRoundScores, totalScore: newTotal };
        }
        return player;
      });
      return { ...prev, currentSession: { ...prev.currentSession, players: calculatePlayerPosition(updatedPlayers, gameConfig.victoryCondition) } };
    });
  };

  // Funções auxiliares
  const nextRound = () => setState(prev => prev.currentSession ? { ...prev, currentSession: { ...prev.currentSession, currentRound: prev.currentSession.currentRound + 1 } } : prev);
  const finishSession = () => setState(prev => prev.currentSession ? { ...prev, currentSession: null, gameHistory: [{ ...prev.currentSession, status: 'finished', finishedAt: new Date().toISOString() }, ...prev.gameHistory] } : prev);
  const clearCurrentSession = () => setState(prev => ({ ...prev, currentSession: null }));
  const addSavedPlayer = (p: any) => setState(prev => ({ ...prev, savedPlayers: [...prev.savedPlayers, p] }));
  const removeSavedPlayer = (id: string) => setState(prev => ({ ...prev, savedPlayers: prev.savedPlayers.filter(p => p.id !== id) }));
  const renameSavedPlayer = (id: string, newName: string) => setState(prev => ({ ...prev, savedPlayers: prev.savedPlayers.map(p => p.id === id ? { ...p, name: newName } : p) }));
  const deleteHistorySession = (id: string) => setState(prev => ({ ...prev, gameHistory: prev.gameHistory.filter(s => s.id !== id) }));
  const toggleDarkMode = () => setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  const createTournament = (name: string, gameId: string) => setState(prev => ({ ...prev, tournaments: [...prev.tournaments, { id: Date.now().toString(), name, gameId, sessions: [], players: [], createdAt: new Date().toISOString() }] }));
  const addSessionToTournament = (tId: string, sId: string) => setState(prev => ({ ...prev, tournaments: prev.tournaments.map(t => t.id === tId ? { ...t, sessions: [...t.sessions, sId] } : t) }));

  return (
    <GameContext.Provider
      value={{
        ...state,
        availableGames: GAME_CONFIGS, // <--- AQUI ESTÁ A CHAVE PARA O LAYOUT NOVO FUNCIONAR
        startNewSession,
        updatePlayerScore,
        nextRound,
        finishSession,
        addSavedPlayer,
        removeSavedPlayer,
        renameSavedPlayer,
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
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};