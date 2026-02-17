import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { PlayerSelector } from '../components/PlayerSelector';
import { getGameConfig } from '../config/games';
import { useGame } from '../context/GameContext';
import type { Player } from '../types';

interface GameSetupProps {
  gameId: string;
  onBack: () => void;
  onStartGame: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ gameId, onBack, onStartGame }) => {
  const { savedPlayers, addSavedPlayer, startNewSession } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<
    Omit<Player, 'totalScore' | 'roundScores' | 'position'>[]
  >([]);

  const gameConfig = getGameConfig(gameId);

  if (!gameConfig) {
    return null;
  }

  const handleAddPlayer = (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => {
    setSelectedPlayers([...selectedPlayers, player]);
    if (!savedPlayers.find((p) => p.id === player.id)) {
      addSavedPlayer(player);
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
  };

  const handleStartGame = () => {
    if (selectedPlayers.length < 2) return;

    const playersWithScores: Player[] = selectedPlayers.map((p) => ({
      ...p,
      totalScore: 0,
      roundScores: [],
    }));

    startNewSession(gameId, playersWithScores);
    onStartGame();
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
            <h1 className="text-3xl font-bold text-white">{gameConfig.name}</h1>
            <p className="text-slate-400 text-sm mt-1">Configure sua partida</p>
          </div>
        </div>

        <div
          className="p-6 rounded-2xl mb-6"
          style={{
            background: `linear-gradient(135deg, ${gameConfig.themeColor}33 0%, ${gameConfig.themeColor}11 100%)`,
            border: `2px solid ${gameConfig.themeColor}44`,
          }}
        >
          <h2 className="text-xl font-bold text-white mb-2">Regras do Jogo</h2>
          <div className="space-y-2 text-slate-300">
            <p>
              <span className="font-semibold text-white">Condição de Vitória:</span>{' '}
              {gameConfig.victoryCondition === 'lowest_score'
                ? 'Menor pontuação vence'
                : gameConfig.victoryCondition === 'highest_score'
                ? 'Maior pontuação vence'
                : 'Atingir pontuação alvo'}
            </p>
            {gameConfig.winningScore && (
              <p>
                <span className="font-semibold text-white">Meta:</span> {gameConfig.winningScore}{' '}
                pontos
              </p>
            )}
            <p>
              <span className="font-semibold text-white">Pontuação Negativa:</span>{' '}
              {gameConfig.allowNegative ? 'Permitida' : 'Não permitida'}
            </p>
            <p>
              <span className="font-semibold text-white">Sistema:</span>{' '}
              {gameConfig.roundBased ? 'Baseado em rodadas' : 'Pontuação contínua'}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-slate-700">
          <PlayerSelector
            selectedPlayers={selectedPlayers}
            savedPlayers={savedPlayers}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            themeColor={gameConfig.themeColor}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartGame}
            disabled={selectedPlayers.length < 2}
            className="w-full mt-6 p-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ backgroundColor: gameConfig.themeColor }}
          >
            <Play className="w-6 h-6" fill="currentColor" />
            Iniciar Partida
          </motion.button>

          {selectedPlayers.length < 2 && (
            <p className="text-center text-slate-400 text-sm mt-3">
              Adicione pelo menos 2 jogadores para começar
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
