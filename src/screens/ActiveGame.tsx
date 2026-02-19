import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, AlertCircle, Share2 } from 'lucide-react';
import { PlayerRow } from '../components/PlayerRow';
import { ShareModal } from '../components/ShareModal';
import { getGameConfig } from '../config/games';
import { useGame } from '../context/GameContext';

interface ActiveGameProps {
  onFinish: () => void;
  onQuit: () => void;
}

export const ActiveGame: React.FC<ActiveGameProps> = ({ onFinish, onQuit }) => {
  const { currentSession, updatePlayerScore, nextRound, finishSession } = useGame();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!currentSession) return null;

  const gameConfig = getGameConfig(currentSession.gameId);
  if (!gameConfig) return null;

  const handleScoreSubmit = (playerId: string, score: number) => {
    updatePlayerScore(playerId, score);
  };

  const allPlayersScored = currentSession.players.every(
    (p) => p.roundScores.length === currentSession.currentRound
  );

  const handleNextRound = () => nextRound();

  const handleFinishGame = () => {
    finishSession();
    onFinish();
  };

  const checkWinCondition = () => {
    if (!gameConfig.winningScore) return false;
    return currentSession.players.some(
      (player) => player.totalScore >= gameConfig.winningScore!
    );
  };

  const winConditionMet = checkWinCondition();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', paddingBottom: '160px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px' }}
      >

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
          paddingBottom: '20px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.01em' }}>
              {gameConfig.name}
            </div>
            <div style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
              Rodada {currentSession.currentRound} • {currentSession.players.length} jogadores
            </div>
          </div>

          {/* Botões Share + X */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                width: '48px', height: '48px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Share2 style={{ width: '22px', height: '22px', color: '#60a5fa' }} />
            </button>
            <button
              onClick={() => setShowQuitConfirm(true)}
              style={{
                width: '48px', height: '48px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X style={{ width: '22px', height: '22px', color: '#f87171' }} />
            </button>
          </div>
        </div>

        {/* ── Alerta de vitória ── */}
        {winConditionMet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '16px', padding: '16px 20px',
              background: 'rgba(234,179,8,0.15)', border: '2px solid #eab308',
              borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px',
            }}
          >
            <AlertCircle style={{ width: '24px', height: '24px', color: '#facc15', flexShrink: 0 }} />
            <div>
              <div style={{ color: '#facc15', fontWeight: 700, fontSize: '16px' }}>Condição de vitória atingida!</div>
              <div style={{ color: 'rgba(253,224,71,0.75)', fontSize: '14px', marginTop: '2px' }}>
                Um jogador atingiu {gameConfig.winningScore} pontos
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Lista de jogadores ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence mode="popLayout">
            {currentSession.players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isLeader={player.position === 1}
                isLast={player.position === currentSession.players.length}
                onScoreSubmit={(score) => handleScoreSubmit(player.id, score)}
                showInput={player.roundScores.length < currentSession.currentRound}
                themeColor={gameConfig.themeColor}
              />
            ))}
          </AnimatePresence>
        </div>

      </motion.div>

      {/* ── Footer fixo ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: `16px 16px max(20px, env(safe-area-inset-bottom, 20px))`,
        background: 'linear-gradient(to top, #0f172a 60%, rgba(15,23,42,0) 100%)',
        display: 'flex', gap: '12px',
      }}>
        {allPlayersScored && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNextRound}
            style={{
              flex: 1, height: '68px', borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: 'rgba(71,85,105,0.8)', fontSize: '18px', fontWeight: 800,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Próxima Rodada
          </motion.button>
        )}

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleFinishGame}
          style={{
            flex: 1, height: '68px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            background: gameConfig.themeColor, fontSize: '18px', fontWeight: 800,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: `0 8px 24px ${gameConfig.themeColor}55`,
          }}
        >
          <Trophy style={{ width: '22px', height: '22px' }} />
          FINALIZAR
        </motion.button>
      </div>

      {/* ── Share Modal ── */}
      {showShareModal && currentSession && (
        <ShareModal
          sessionId={currentSession.id}
          gameName={gameConfig.name}
          themeColor={gameConfig.themeColor}
          onClose={() => setShowShareModal(false)}
          onConfirmStart={() => setShowShareModal(false)}
        />
      )}

      {/* ── Quit Confirm Modal ── */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuitConfirm(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '20px', zIndex: 50,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1e293b', padding: '28px', borderRadius: '20px',
                maxWidth: '380px', width: '100%', border: '1.5px solid rgba(71,85,105,0.5)',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
                Abandonar Partida?
              </div>
              <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
                Todo o progresso da partida atual será perdido.
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  style={{
                    flex: 1, padding: '16px', background: 'rgba(71,85,105,0.5)',
                    border: 'none', borderRadius: '14px', color: 'white',
                    fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={onQuit}
                  style={{
                    flex: 1, padding: '16px', background: '#ef4444',
                    border: 'none', borderRadius: '14px', color: 'white',
                    fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Abandonar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
