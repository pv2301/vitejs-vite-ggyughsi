import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { GameConfig } from '../types';

interface GameCardProps {
  game: GameConfig;
  onClick: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  cloud: Icons.Cloud,
  hexagon: Icons.Hexagon,
  circle: Icons.Circle,
  mountain: Icons.Mountain,
  dices: Icons.Dices,
};

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const IconComponent = iconMap[game.icon] || Icons.Dices;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="w-full p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${game.themeColor}dd 0%, ${game.themeColor}99 100%)`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1">{game.name}</h3>
          <p className="text-white/80 text-sm mb-3">{game.description}</p>
          <div className="flex flex-wrap gap-2">
            {game.winningScore && (
              <span className="px-2 py-1 bg-white/20 rounded-lg text-xs text-white font-medium">
                Meta: {game.winningScore}
              </span>
            )}
            <span className="px-2 py-1 bg-white/20 rounded-lg text-xs text-white font-medium">
              {game.victoryCondition === 'lowest_score' ? 'Menor vence' : 'Maior vence'}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
