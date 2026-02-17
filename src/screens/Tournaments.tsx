import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Plus, X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GAME_CONFIGS } from '../config/games';

interface TournamentsProps {
  onBack: () => void;
}

export const Tournaments: React.FC<TournamentsProps> = ({ onBack }) => {
  const { tournaments, createTournament } = useGame();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(GAME_CONFIGS[0].id);

  const handleCreateTournament = () => {
    if (!tournamentName.trim()) return;

    createTournament(tournamentName.trim(), selectedGameId);
    setTournamentName('');
    setShowCreateForm(false);
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
            <h1 className="text-3xl font-bold text-white">Torneios</h1>
            <p className="text-slate-400 text-sm mt-1">Gerencie competições de múltiplas partidas</p>
          </div>
        </div>

        {!showCreateForm && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="w-full p-6 mb-6 border-2 border-dashed border-slate-600 rounded-xl hover:border-slate-500 transition-colors text-slate-400 hover:text-slate-300 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Criar Novo Torneio</span>
          </motion.button>
        )}

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-800/50 p-6 rounded-xl border-2 border-slate-700 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Novo Torneio</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome do Torneio
                  </label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Ex: Campeonato de Skyjo 2024"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Jogo</label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    {GAME_CONFIGS.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateTournament}
                  disabled={!tournamentName.trim()}
                  className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors"
                >
                  Criar Torneio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tournaments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhum torneio criado</h3>
            <p className="text-slate-500">Crie um torneio para rastrear múltiplas partidas</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {tournaments.map((tournament) => {
                const gameConfig = GAME_CONFIGS.find((g) => g.id === tournament.gameId);
                if (!gameConfig) return null;

                return (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-slate-800/50 p-6 rounded-xl border-2 border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${gameConfig.themeColor}33` }}
                      >
                        <Trophy className="w-8 h-8" style={{ color: gameConfig.themeColor }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                        <p className="text-slate-400 text-sm mb-3">{gameConfig.name}</p>
                        <div className="flex gap-4 text-sm text-slate-400">
                          <span>{tournament.sessions.length} partidas</span>
                          <span>•</span>
                          <span>{tournament.players.length} jogadores</span>
                        </div>
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
