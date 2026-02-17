import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { Player } from '../types';

interface PlayerSelectorProps {
  selectedPlayers: Omit<Player, 'totalScore' | 'roundScores' | 'position'>[];
  savedPlayers: Omit<Player, 'totalScore' | 'roundScores' | 'position'>[];
  onAddPlayer: (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => void;
  onRemovePlayer: (playerId: string) => void;
  themeColor: string;
}

const AVATARS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎤', '🎧', '🎬', '⚡', '🔥', '⭐', '💎', '🏆'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  selectedPlayers,
  savedPlayers,
  onAddPlayer,
  onRemovePlayer,
  themeColor,
}) => {
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleCreatePlayer = () => {
    if (!newPlayerName.trim()) return;

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
    };

    onAddPlayer(newPlayer);
    setNewPlayerName('');
    setShowNewPlayerForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Jogadores Selecionados</h3>
        <span className="text-sm text-slate-400">{selectedPlayers.length} jogadores</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {selectedPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: player.color }}
              >
                {player.avatar}
              </div>
              <span className="flex-1 text-white font-medium">{player.name}</span>
              <button
                onClick={() => onRemovePlayer(player.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {savedPlayers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3">Jogadores Salvos</h3>
          <div className="grid grid-cols-2 gap-2">
            {savedPlayers
              .filter((sp) => !selectedPlayers.find((p) => p.id === sp.id))
              .map((player) => (
                <motion.button
                  key={player.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddPlayer(player)}
                  className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.avatar}
                  </div>
                  <span className="text-white text-sm font-medium">{player.name}</span>
                </motion.button>
              ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {!showNewPlayerForm ? (
          <button
            onClick={() => setShowNewPlayerForm(true)}
            className="w-full p-4 border-2 border-dashed border-slate-600 rounded-xl hover:border-slate-500 transition-colors text-slate-400 hover:text-slate-300 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Novo Jogador</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-800 rounded-xl space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Digite o nome"
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Avatar</label>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                      selectedAvatar === avatar
                        ? 'bg-blue-500 scale-110'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cor</label>
              <div className="grid grid-cols-8 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      selectedColor === color ? 'scale-110 ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewPlayerForm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePlayer}
                disabled={!newPlayerName.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeColor }}
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
