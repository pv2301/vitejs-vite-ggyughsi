import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, AlertCircle } from 'lucide-react';
import { PlayerRow } from '../components/PlayerRow';
import { getGameConfig } from '../config/games';
import { useGame } from '../context/GameContext';

interface ActiveGameProps {
  onFinish: () => void;
  onQuit: () => void;
}

export const ActiveGame: React.FC<ActiveGameProps> = ({ onFinish, onQuit }) => {
  const { currentSession, updatePlayerScore, nextRound, finishSession } = useGame();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  if (!currentSession) {
    return null;
  }

  const gameConfig = getGameConfig(currentSession.gameId);

  if (!gameConfig) {
    return null;
  }

  const handleScoreSubmit = (playerId: string, score: number) => {
    updatePlayerScore(playerId, score);
  };

  const allPlayersScored = currentSession.players.every(
    (p) => p.roundScores.length === currentSession.currentRound
  );

  const handleNextRound = () => {
    nextRound();
  };

  const handleFinishGame = () => {
    finishSession();
    onFinish();
  };

  const checkWinCondition = () => {
    if (!gameConfig.winningScore) return false;

    return currentSession.players.some((player) => {
      if (gameConfig.victoryCondition === 'lowest_score') {
        return player.totalScore >= gameConfig.winningScore!;
      } else if (gameConfig.victoryCondition === 'highest_score') {
        return player.totalScore >= gameConfig.winningScore!;
      } else if (gameConfig.victoryCondition === 'target_score') {
        return player.totalScore >= gameConfig.winningScore!;
      }
      return false;
    });
  };

  const winConditionMet = checkWinCondition();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{gameConfig.name}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Rodada {currentSession.currentRound} • {currentSession.players.length} jogadores
            </p>
          </div>
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-red-400" />
          </button>
        </div>

        {winConditionMet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-400 font-semibold">Condição de vitória atingida!</p>
              <p className="text-yellow-300/80 text-sm">
                Um jogador atingiu {gameConfig.winningScore} pontos
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {currentSession.players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isLeader={player.position === 1}
                isLast={player.position === currentSession.players.length}
                onScoreSubmit={(score) => handleScoreSubmit(player.id, score)}
                showInput={player.roundScores.length < currentSession.currentRound}
                themeColor={gameConfig.themeColor}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
          <div className="max-w-4xl mx-auto flex gap-3">
            {allPlayersScored && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextRound}
                className="flex-1 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-white text-lg transition-colors"
              >
                Próxima Rodada
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinishGame}
              className="flex-1 p-4 rounded-xl font-bold text-white text-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: gameConfig.themeColor }}
            >
              <Trophy className="w-6 h-6" />
              Finalizar Partida
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowQuitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 p-6 rounded-2xl max-w-md w-full border-2 border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-2">Abandonar Partida?</h3>
              <p className="text-slate-400 mb-6">
                Todo o progresso da partida atual será perdido.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onQuit}
                  className="flex-1 p-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-colors"
                >
                  Abandonar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
