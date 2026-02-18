import React from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingDown } from 'lucide-react';
import type { Player } from '../types';

interface PlayerRowProps {
  player: Player;
  isLeader: boolean;
  isLast: boolean;
  onScoreSubmit?: (score: number) => void;
  showInput?: boolean;
  themeColor: string;
}

export const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  isLeader,
  isLast,
  onScoreSubmit,
  showInput = true,
  themeColor,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = () => {
    const score = parseFloat(inputValue);
    if (!isNaN(score) && onScoreSubmit) {
      onScoreSubmit(score);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-xl transition-all duration-300 ${
        isLeader
          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500'
          : 'bg-slate-800/50 border-2 border-slate-700/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg"
          style={{ backgroundColor: player.color }}
        >
          {player.avatar}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">#{player.position}</span>
            <h3 className="text-lg font-bold text-white">{player.name}</h3>
            {isLeader && <Crown className="w-5 h-5 text-yellow-400" fill="currentColor" />}
            {isLast && <TrendingDown className="w-5 h-5 text-red-400" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold" style={{ color: themeColor }}>
              {player.totalScore}
            </p>
            <span className="text-xs text-slate-400">pts</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{player.roundScores.length} rodadas</span>
          </div>
        </div>
      </div>

      {showInput && (
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pontos da rodada"
            className="flex-1 px-4 py-4 bg-slate-700 text-white text-lg font-bold rounded-xl border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue}
            className="min-w-[56px] px-6 py-4 rounded-xl font-black text-white text-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            +
          </button>
        </div>
      )}

      {player.roundScores.length > 0 && (
        <div className="mt-3 flex gap-1 overflow-x-auto pb-2">
          {player.roundScores.map((score, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 whitespace-nowrap"
            >
              R{index + 1}: {score > 0 ? '+' : ''}{score}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};
