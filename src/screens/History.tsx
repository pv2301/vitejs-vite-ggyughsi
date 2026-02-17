import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Eye, Calendar, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getGameConfig } from '../config/games';
import type { GameSession } from '../types';

interface HistoryProps {
  onBack: () => void;
  onViewSession: (session: GameSession) => void;
}

export const History: React.FC<HistoryProps> = ({ onBack, onViewSession }) => {
  const { gameHistory, deleteHistorySession } = useGame();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6 pt-4">
          <button
            onClick={onBack}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Histórico de Partidas</h1>
            <p className="text-slate-400 text-sm mt-1">{gameHistory.length} partidas salvas</p>
          </div>
        </div>

        {gameHistory.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhuma partida ainda</h3>
            <p className="text-slate-500">Suas partidas finalizadas aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {gameHistory.map((session) => {
                const gameConfig = getGameConfig(session.gameId);
                if (!gameConfig) return null;

                const winner = [...session.players].sort((a, b) => {
                  if (gameConfig.victoryCondition === 'lowest_score') {
                    return a.totalScore - b.totalScore;
                  }
                  return b.totalScore - a.totalScore;
                })[0];

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-slate-800/50 rounded-xl border-2 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${gameConfig.themeColor}33` }}
                        >
                          <span className="text-2xl">{gameConfig.icon === 'cloud' ? '☁️' : '🎲'}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{gameConfig.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(session.startedAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: winner.color }}
                        >
                          {winner.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{winner.name} venceu</p>
                          <p className="text-slate-400 text-sm">
                            {winner.totalScore} pontos em {session.currentRound} rodadas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <Users className="w-4 h-4" />
                        <span>{session.players.length} jogadores</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewSession(session)}
                          className="flex-1 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja remover esta partida do histórico?')) {
                              deleteHistorySession(session.id);
                            }
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};
