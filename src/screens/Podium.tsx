import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { GameSession } from '../types';
import { getGameConfig } from '../config/games';

interface PodiumProps {
  session: GameSession;
  onBackToHome: () => void;
}

export const Podium: React.FC<PodiumProps> = ({ session, onBackToHome }) => {
  const podiumRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const gameConfig = getGameConfig(session.gameId);

  if (!gameConfig) {
    return null;
  }

  const sortedPlayers = [...session.players].sort((a, b) => {
    if (gameConfig.victoryCondition === 'lowest_score') {
      return a.totalScore - b.totalScore;
    }
    return b.totalScore - a.totalScore;
  });

  const handleShare = async () => {
    if (!podiumRef.current) return;

    setIsSharing(true);

    try {
      const canvas = await html2canvas(podiumRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'scoremaster-result.png', { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: `Resultado - ${gameConfig.name}`,
              text: `Confira o resultado da partida de ${gameConfig.name}!`,
            });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scoremaster-result.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        }
        setIsSharing(false);
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div ref={podiumRef} className="bg-slate-900 p-8 rounded-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <h1 className="text-5xl font-bold text-white mb-2">Partida Finalizada</h1>
              <p className="text-slate-400 text-lg">{gameConfig.name}</p>
              <p className="text-slate-500 text-sm mt-2">
                {session.currentRound} rodadas • {session.players.length} jogadores
              </p>
            </motion.div>
          </div>

          <div className="relative h-64 mb-8 flex items-end justify-center gap-4">
            {sortedPlayers.slice(0, 3).map((player, index) => {
              const heights = [56, 72, 48];
              const delays = [0.4, 0.3, 0.5];
              const positions = [1, 0, 2];

              return (
                <motion.div
                  key={player.id}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: delays[positions[index]], type: 'spring' }}
                  className="flex flex-col items-center"
                  style={{ order: positions[index] }}
                >
                  <div className="mb-3 text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl mx-auto mb-2"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.avatar}
                    </div>
                    <p className="text-white font-bold text-sm">{player.name}</p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{ color: gameConfig.themeColor }}
                    >
                      {player.totalScore}
                    </p>
                  </div>

                  <div
                    className={`w-32 rounded-t-xl flex items-center justify-center transition-all ${
                      index === 0
                        ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                        : index === 1
                        ? 'bg-gradient-to-t from-slate-500 to-slate-400'
                        : 'bg-gradient-to-t from-orange-700 to-orange-500'
                    }`}
                    style={{ height: `${heights[index]}%` }}
                  >
                    <span className="text-4xl font-bold text-white">{index + 1}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {sortedPlayers.length > 3 && (
            <div className="space-y-2 mt-8">
              <h3 className="text-xl font-bold text-white mb-3">Outros Jogadores</h3>
              {sortedPlayers.slice(3).map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                >
                  <span className="text-slate-400 font-bold w-8 text-center">#{index + 4}</span>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.avatar}
                  </div>
                  <span className="flex-1 text-white font-medium">{player.name}</span>
                  <span className="text-xl font-bold" style={{ color: gameConfig.themeColor }}>
                    {player.totalScore}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToHome}
            className="flex-1 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-6 h-6" />
            Voltar ao Início
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 p-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{ backgroundColor: gameConfig.themeColor }}
          >
            {isSharing ? (
              <>
                <Download className="w-6 h-6 animate-bounce" />
                Gerando...
              </>
            ) : (
              <>
                <Share2 className="w-6 h-6" />
                Compartilhar
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
