import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trophy, Sun, Moon, Menu, Users, X, Plus } from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { useGame } from '../context/GameContext';

interface DashboardProps {
  onSelectGame: (gameId: string) => void;
  onOpenHistory: () => void;
  onOpenTournaments: () => void;
  onOpenPlayers: () => void;
  onOpenNewGame: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectGame,
  onOpenHistory,
  onOpenTournaments,
  onOpenPlayers,
  onOpenNewGame,
}) => {
  const { gameHistory, darkMode, toggleDarkMode, availableGames } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div style={{ padding: '0 16px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        {/* Título */}
        <div style={{ paddingBottom: '4px' }}>
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

        {/* Botões — apenas 2 */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {/* Tema */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            style={{
              width: '48px', height: '48px', borderRadius: '14px',
              border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {darkMode
              ? <Sun style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
              : <Moon style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
            }
          </motion.button>

          {/* Menu ≡ */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(true)}
            style={{
              width: '48px', height: '48px', borderRadius: '14px',
              border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Menu style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
            {/* Badge do histórico no botão menu */}
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

      {/* ── Divisor ── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

      {/* ── Lista de jogos ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {availableGames.map((game, index) => (
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

      {/* ── Bottom Sheet Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                zIndex: 40, backdropFilter: 'blur(4px)',
              }}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#1e293b',
                borderRadius: '28px 28px 0 0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: 'none',
                zIndex: 50,
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.2)' }} />
              </div>

              {/* Header do menu */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 20px 16px',
              }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: '18px', height: '18px', color: '#64748b' }} />
                </button>
              </div>

              {/* Opções */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
                {/* Novo Jogo */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMenuOpen(false); onOpenNewGame(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '18px 20px', borderRadius: '18px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(16,185,129,0.15)',
                  }}>
                    <Plus style={{ width: '24px', height: '24px', color: '#10b981' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Novo Jogo</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>Criar jogo com regras personalizadas</p>
                  </div>
                </motion.button>

                {/* Jogadores */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMenuOpen(false); onOpenPlayers(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '18px 20px', borderRadius: '18px',
                    background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(96,165,250,0.15)',
                  }}>
                    <Users style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Jogadores</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>Gerenciar jogadores cadastrados</p>
                  </div>
                </motion.button>

                {/* Torneios */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMenuOpen(false); onOpenTournaments(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '18px 20px', borderRadius: '18px',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(245,158,11,0.15)',
                  }}>
                    <Trophy style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Torneios</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>Criar e acompanhar torneios</p>
                  </div>
                </motion.button>

                {/* Histórico */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setMenuOpen(false); onOpenHistory(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '18px 20px', borderRadius: '18px',
                    background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(148,163,184,0.1)', position: 'relative',
                  }}>
                    <History style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                    {gameHistory.length > 0 && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        minWidth: '18px', height: '18px', padding: '0 4px',
                        background: '#ef4444', borderRadius: '999px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', color: 'white', fontWeight: 700,
                      }}>
                        {gameHistory.length > 9 ? '9+' : gameHistory.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>Histórico</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                      {gameHistory.length > 0 ? `${gameHistory.length} partida${gameHistory.length > 1 ? 's' : ''} registrada${gameHistory.length > 1 ? 's' : ''}` : 'Ver partidas anteriores'}
                    </p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
