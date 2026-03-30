import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trophy, Sun, Moon, Menu, Users, X, Plus, Share2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { GameCard } from '../components/GameCard';
import { AppShareModal } from '../components/AppShareModal';
import { useGame } from '../context/GameContext';
import { useTranslation } from '../i18n/useTranslation';

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
  const { gameHistory, darkMode, toggleDarkMode, availableGames, reorderGames, locale, setLocale } = useGame();
  const t = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAppShare, setShowAppShare] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Long press logic
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const startLongPress = useCallback(() => {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      setReorderMode(true);
    }, 3000);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleCardClick = useCallback((gameId: string) => {
    if (longPressFired.current || reorderMode) return;
    onSelectGame(gameId);
  }, [reorderMode, onSelectGame]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    reorderGames(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index === availableGames.length - 1) return;
    reorderGames(index, index + 1);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderGames(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

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
        <div style={{ paddingBottom: '4px', flex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            ScoreGames
          </motion.div>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {reorderMode ? (
            /* Botão Concluir reordenação */
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setReorderMode(false)}
              style={{
                height: '48px', paddingLeft: '16px', paddingRight: '16px',
                borderRadius: '14px', border: '1.5px solid rgba(245,158,11,0.4)',
                cursor: 'pointer', background: 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: '#f59e0b', fontWeight: 800, fontSize: '14px',
              }}
            >
              {t.dashboard.done}
            </motion.button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* ── Divisor ── */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

      {/* ── Lista de jogos ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {availableGames.map((game, index) => (
          <motion.div
            key={game.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reorderMode ? 0 : index * 0.07, layout: { type: 'spring', stiffness: 400, damping: 32 } }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {/* Botões ▲▼ — visíveis só em modo reordenar */}
            <AnimatePresence>
              {reorderMode && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, overflow: 'hidden' }}
                >
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    style={{
                      width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                      background: index === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                      cursor: index === 0 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: index === 0 ? 0.2 : 1,
                    }}
                  >
                    <ChevronUp style={{ width: '18px', height: '18px', color: 'white' }} />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === availableGames.length - 1}
                    style={{
                      width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                      background: index === availableGames.length - 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                      cursor: index === availableGames.length - 1 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: index === availableGames.length - 1 ? 0.2 : 1,
                    }}
                  >
                    <ChevronDown style={{ width: '18px', height: '18px', color: 'white' }} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card — com long press e drag-and-drop */}
            <div
              draggable={reorderMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              style={{
                flex: 1,
                minWidth: 0,
                position: 'relative',
                opacity: draggedIndex === index ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
              onMouseDown={reorderMode ? undefined : startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={reorderMode ? undefined : startLongPress}
              onTouchEnd={cancelLongPress}
              onTouchCancel={cancelLongPress}
            >
              {/* Indicador grip no modo reordenar */}
              <AnimatePresence>
                {reorderMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      zIndex: 2, pointerEvents: 'none',
                    }}
                  >
                    <GripVertical style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.3)' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <GameCard
                game={game}
                onClick={() => handleCardClick(game.id)}
                dimmed={reorderMode}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', color: '#334155', fontSize: '12px' }}>
        <span style={{ flex: 1, textAlign: 'center' }}>{t.dashboard.footer}</span>
        <span style={{ flexShrink: 0 }}>v1.0.3</span>
      </div>

      {/* ── Bottom Sheet Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
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
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>{t.dashboard.menu.title}</span>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
                {/* Novo Jogo */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMenuOpen(false); onOpenNewGame(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '18px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.15)' }}>
                    <Plus style={{ width: '24px', height: '24px', color: '#10b981' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{t.dashboard.menu.newGame}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{t.dashboard.menu.newGameSub}</p>
                  </div>
                </motion.button>

                {/* Jogadores */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMenuOpen(false); onOpenPlayers(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '18px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(96,165,250,0.15)' }}>
                    <Users style={{ width: '24px', height: '24px', color: '#60a5fa' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{t.dashboard.menu.players}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{t.dashboard.menu.playersSub}</p>
                  </div>
                </motion.button>

                {/* Torneios */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMenuOpen(false); onOpenTournaments(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.15)' }}>
                    <Trophy style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{t.dashboard.menu.tournaments}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{t.dashboard.menu.tournamentsSub}</p>
                  </div>
                </motion.button>

                {/* Histórico */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMenuOpen(false); onOpenHistory(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '18px', background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(148,163,184,0.1)', position: 'relative' }}>
                    <History style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                    {gameHistory.length > 0 && (
                      <span style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '18px', height: '18px', padding: '0 4px', background: '#ef4444', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 700 }}>
                        {gameHistory.length > 9 ? '9+' : gameHistory.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{t.dashboard.menu.history}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                      {gameHistory.length > 0 ? t.dashboard.menu.historyCount(gameHistory.length) : t.dashboard.menu.historySub}
                    </p>
                  </div>
                </motion.button>

                {/* Compartilhar App */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setMenuOpen(false); setShowAppShare(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '18px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,211,102,0.12)' }}>
                    <Share2 style={{ width: '24px', height: '24px', color: '#25D366' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{t.dashboard.menu.shareApp}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>{t.dashboard.menu.shareAppSub}</p>
                  </div>
                </motion.button>

                {/* Idioma */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setLocale(locale === 'en' ? 'pt-BR' : 'en')}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', fontSize: '26px' }}>
                    {locale === 'en' ? '🇺🇸' : '🇧🇷'}
                  </div>
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                      {locale === 'en' ? 'English' : 'Português (BR)'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                      {locale === 'en' ? 'Tap to switch to Portuguese' : 'Toque para mudar para Inglês'}
                    </p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showAppShare && <AppShareModal onClose={() => setShowAppShare(false)} />}
    </div>
  );
};
