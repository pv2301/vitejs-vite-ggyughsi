import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Eye, Calendar, Users, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useTranslation } from '../i18n/useTranslation';
import type { GameSession, GameConfig } from '../types';

interface HistoryProps {
  onBack: () => void;
  onViewSession: (session: GameSession) => void;
}

// Modal de confirmação customizado
const ConfirmModal: React.FC<{
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, confirmLabel = 'Remove', cancelLabel = 'Cancel', title = 'Confirm removal', onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 100,
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 24, stiffness: 350 }}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      style={{
        width: 'min(340px, calc(100vw - 40px))',
        maxHeight: 'calc(100vh - 40px)',
        background: '#1e293b',
        borderRadius: '24px',
        border: '1.5px solid rgba(255,255,255,0.1)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertTriangle style={{ width: '24px', height: '24px', color: '#f87171' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '17px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
          {title}
        </div>
        <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export const History: React.FC<HistoryProps> = ({ onBack, onViewSession }) => {
  const { gameHistory, deleteHistorySession, availableGames } = useGame();
  const t = useTranslation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getGameConfig = (gameId: string): GameConfig | undefined =>
    availableGames.find(g => g.id === gameId);

  const FALLBACK_CONFIG: GameConfig = {
    id: 'unknown', name: '?', themeColor: '#64748b',
    victoryCondition: 'highest_score', allowNegative: false,
    description: '', icon: 'dices',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: 'max(24px, env(safe-area-inset-top, 24px)) 20px 20px',
        display: 'flex', alignItems: 'center', gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '22px', height: '22px', color: 'white' }} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {t.history.title}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            {t.history.matchesLabel(gameHistory.length)}
          </div>
        </div>
        {gameHistory.length > 0 && (
          <button
            onClick={() => setConfirmClearAll(true)}
            style={{
              padding: '8px 14px', borderRadius: '12px', border: '1.5px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)', color: '#f87171',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >
            {t.history.deleteAll}
          </button>
        )}
      </div>

      {/* ── Lista ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {gameHistory.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: '80px', gap: '16px',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar style={{ width: '36px', height: '36px', color: '#334155' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#475569', marginBottom: '6px' }}>
                {t.history.empty}
              </div>
              <div style={{ fontSize: '15px', color: '#334155' }}>
                {t.history.emptyHint}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {gameHistory.map((session, index) => {
              const gameConfig = getGameConfig(session.gameId) ?? FALLBACK_CONFIG;

              const winner = [...session.players].sort((a, b) =>
                gameConfig.victoryCondition === 'lowest_score'
                  ? a.totalScore - b.totalScore
                  : b.totalScore - a.totalScore
              )[0];

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ delay: index * 0.04 }}
                  style={{
                    background: 'rgba(30,41,59,0.7)', borderRadius: '18px',
                    border: `2px solid ${gameConfig.themeColor}33`, overflow: 'hidden',
                  }}
                >
                  {/* Tira colorida no topo */}
                  <div style={{ height: '4px', background: gameConfig.themeColor }} />

                  <div style={{ padding: '16px' }}>
                    {/* Jogo + data */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: gameConfig.themeColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '20px', color: 'white', fontWeight: 900 }}>
                          {gameConfig.name.charAt(0)}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                          {gameConfig.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <Calendar style={{ width: '13px', height: '13px', color: '#64748b' }} />
                          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                            {formatDate(session.startedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vencedor */}
                    {winner && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(234,179,8,0.08)', borderRadius: '12px',
                        padding: '10px 14px', marginBottom: '12px',
                        border: '1px solid rgba(234,179,8,0.2)',
                      }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px', backgroundColor: winner.color,
                        }}>
                          {winner.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>
                            {winner.name}
                          </div>
                          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                            {winner.totalScore} {t.common.pts} · {t.activeGame.roundsLabel(session.currentRound)}
                          </div>
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: gameConfig.themeColor }}>
                          {winner.totalScore}
                        </div>
                      </div>
                    )}

                    {/* Rodapé: jogadores + botões */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <Users style={{ width: '15px', height: '15px', color: '#64748b' }} />
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                          {t.history.players(session.players.length)}
                        </span>
                      </div>

                      <button
                        onClick={() => onViewSession(session)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          background: `${gameConfig.themeColor}22`, color: gameConfig.themeColor,
                          fontSize: '14px', fontWeight: 800,
                        }}
                      >
                        <Eye style={{ width: '16px', height: '16px' }} />
                        {t.podium.title}
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(session.id)}
                        style={{
                          width: '42px', height: '42px', borderRadius: '12px', border: 'none',
                          cursor: 'pointer', background: 'rgba(239,68,68,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Trash2 style={{ width: '18px', height: '18px', color: '#f87171' }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Modais de confirmação ── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <ConfirmModal
            title={t.history.confirmRemoval}
            message={t.history.deleteSessionMessage}
            confirmLabel={t.common.remove}
            cancelLabel={t.common.cancel}
            onConfirm={() => { deleteHistorySession(confirmDeleteId); setConfirmDeleteId(null); }}
            onCancel={() => setConfirmDeleteId(null)}
          />
        )}
        {confirmClearAll && (
          <ConfirmModal
            title={t.history.confirmRemoval}
            message={t.history.deleteAllMessage}
            confirmLabel={t.common.remove}
            cancelLabel={t.common.cancel}
            onConfirm={() => {
              [...gameHistory].forEach(s => deleteHistorySession(s.id));
              setConfirmClearAll(false);
            }}
            onCancel={() => setConfirmClearAll(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
