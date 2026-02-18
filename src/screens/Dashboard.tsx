import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { GameCard } from '../components/GameCard';
import { History, Trophy, Plus } from 'lucide-react';

interface DashboardProps {
  onSelectGame: (gameId: string) => void;
  onOpenHistory: () => void;
  onOpenTournaments: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onSelectGame, 
  onOpenHistory, 
  onOpenTournaments 
}) => {
  const { availableGames } = useGame();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 pb-20 overflow-x-hidden">
      {/* Header Compacto */}
      <header className="flex justify-between items-center mb-5 px-1">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ScoreMaster
          </h1>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">
            Selecione o jogo
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={onOpenHistory} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/50 active:scale-95 transition-transform">
            <History className="w-4 h-4 text-slate-300" />
          </button>
          <button onClick={onOpenTournaments} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/50 active:scale-95 transition-transform">
            <Trophy className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* GRADE FORÇADA: 2 Colunas */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2 w-full"
      >
        {availableGames.map((game) => (
          <motion.div key={game.id} variants={item} className="w-full">
            <GameCard game={game} onClick={() => onSelectGame(game.id)} />
          </motion.div>
        ))}

        {/* Botão Novo Jogo */}
        <motion.button
          variants={item}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center justify-center w-full aspect-square border border-dashed border-slate-800 rounded-xl text-slate-600 bg-slate-900/30 gap-1 hover:bg-slate-900 hover:text-slate-400 transition-colors"
        >
          <div className="p-2 bg-slate-800 rounded-full mb-1">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide">Criar</span>
        </motion.button>
      </motion.div>
    </div>
  );
};