import React from 'react';
import { motion } from 'framer-motion';
import { History, Moon, Sun, Trophy } from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { GAME_CONFIGS } from '../config/games';
import { useGame } from '../context/GameContext';

interface DashboardProps {
  onSelectGame: (gameId: string) => void;
  onOpenHistory: () => void;
  onOpenTournaments: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectGame,
  onOpenHistory,
  onOpenTournaments,
}) => {
  const { darkMode, toggleDarkMode, gameHistory } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8 pt-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">ScoreMaster</h1>
            <p className="text-slate-400">Gerencie suas partidas com estilo</p>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-yellow-400" />
              ) : (
                <Moon className="w-6 h-6 text-slate-400" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenTournaments}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Trophy className="w-6 h-6 text-yellow-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenHistory}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors relative"
            >
              <History className="w-6 h-6 text-blue-400" />
              {gameHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {gameHistory.length}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Escolha seu Jogo</h2>
          <div className="space-y-3">
            {GAME_CONFIGS.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard game={game} onClick={() => onSelectGame(game.id)} />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-sm pb-8"
        >
          <p>Desenvolvido com React & Tailwind</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
