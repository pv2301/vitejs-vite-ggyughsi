import React from 'react';
import { motion } from 'framer-motion';
import { History, Trophy, Sun, Moon } from 'lucide-react';
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
  const { gameHistory, darkMode, toggleDarkMode } = useGame();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}
            >
              ScoreGames
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}
            >
              Escolha seu jogo
            </motion.div>
          </div>

          {/* Botões de ação */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Tema */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleDarkMode}
              style={{
                width: '52px', height: '52px', borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {darkMode
                ? <Sun style={{ width: '22px', height: '22px', color: '#fbbf24' }} />
                : <Moon style={{ width: '22px', height: '22px', color: '#94a3b8' }} />
              }
            </motion.button>

            {/* Torneios */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onOpenTournaments}
              style={{
                width: '52px', height: '52px', borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trophy style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
            </motion.button>

            {/* Histórico */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onOpenHistory}
              style={{
                width: '52px', height: '52px', borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
            >
              <History style={{ width: '22px', height: '22px', color: '#60a5fa' }} />
              {gameHistory.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    minWidth: '18px', height: '18px', padding: '0 4px',
                    background: '#ef4444', borderRadius: '999px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', color: 'white', fontWeight: 700,
                  }}
                >
                  {gameHistory.length > 9 ? '9+' : gameHistory.length}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Divisor ── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

      {/* ── Lista de jogos ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {GAME_CONFIGS.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <GameCard game={game} onClick={() => onSelectGame(game.id)} />
          </motion.div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', padding: '16px', color: '#334155', fontSize: '12px' }}>
        Desenvolvido por PV
      </div>
    </div>
  );
};
