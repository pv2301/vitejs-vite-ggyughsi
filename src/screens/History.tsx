import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Eye, Calendar, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getGameConfig } from '../config/games';
import type { GameSession } from '../types';

interface HistoryProps {
  onBack: () => void;
  onViewSession: (session: GameSession) => void;
}

export const History: React.FC<HistoryProps> = ({ onBack, onViewSession }) => {
  const { gameHistory, deleteHistorySession } = useGame();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
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
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Histórico
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            {gameHistory.length} {gameHistory.length === 1 ? 'partida salva' : 'partidas salvas'}
          </div>
        </div>
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
                Nenhuma partida ainda
              </div>
              <div style={{ fontSize: '15px', color: '#334155' }}>
                Suas partidas finalizadas aparecerão aqui
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {gameHistory.map((session, index) => {
              const gameConfig = getGameConfig(session.gameId);
              if (!gameConfig) return null;

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
                        background: `${gameConfig.themeColor}25`, border: `2px solid ${gameConfig.themeColor}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: gameConfig.themeColor,
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
                          {winner.name} venceu
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                          {winner.totalScore} pontos • {session.currentRound}{' '}
                          {session.currentRound === 1 ? 'rodada' : 'rodadas'}
                        </div>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: gameConfig.themeColor }}>
                        {winner.totalScore}
                      </div>
                    </div>

                    {/* Rodapé: jogadores + botões */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <Users style={{ width: '15px', height: '15px', color: '#64748b' }} />
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                          {session.players.length} jogadores
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
                        Detalhes
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Deseja remover esta partida do histórico?')) {
                            deleteHistorySession(session.id);
                          }
                        }}
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
    </div>
  );
};
