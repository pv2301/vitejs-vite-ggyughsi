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
  const MainIcon = iconMap[game.icon] || Icons.Dices;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="group relative w-full aspect-[4/5] overflow-hidden rounded-2xl p-0 text-left shadow-md border border-white/5"
      style={{
        background: `linear-gradient(145deg, ${game.themeColor}dd 0%, ${game.themeColor}99 100%)`,
      }}
    >
      {/* Ícone de Fundo (Mais sutil) */}
      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
        <MainIcon size={100} color="white" />
      </div>

      <div className="relative p-4 flex flex-col h-full z-10">
        {/* Ícone Pequeno */}
        <div className="mb-3">
          <div className="inline-flex p-2 bg-white/20 backdrop-blur-md rounded-lg shadow-sm ring-1 ring-white/20">
            <MainIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Textos */}
        <div className="mt-auto">
          <h3 className="text-lg font-bold text-white leading-tight mb-1 drop-shadow-sm">
            {game.name}
          </h3>
          
          {/* Tags (Badges) Compactas */}
          <div className="flex flex-col gap-1 mt-2">
            {game.winningScore && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-black/20 px-2 py-1 rounded-md w-fit">
                <Icons.Trophy size={10} className="text-yellow-300" />
                <span>Meta: {game.winningScore}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-black/20 px-2 py-1 rounded-md w-fit">
               {game.victoryCondition === 'lowest_score' ? 
                 <Icons.ArrowDown size={10} className="text-emerald-300"/> : 
                 <Icons.ArrowUp size={10} className="text-red-300"/>
               }
               <span>{game.victoryCondition === 'lowest_score' ? 'Menor' : 'Maior'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};