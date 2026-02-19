import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, AlertCircle, Crown, TrendingDown, Plus } from 'lucide-react';
import { PlayerRow } from '../components/PlayerRow';
import { useGame } from '../context/GameContext';
import type { Team } from '../types';

interface ActiveGameProps {
  onFinish: () => void;
  onQuit: () => void;
}

// ── TeamRow ──────────────────────────────────────────────────────────────────
interface TeamRowProps {
  team: Team;
  isLeader: boolean;
  isLast: boolean;
  mode: 'numeric' | 'winner';
  showInput: boolean;
  themeColor: string;
  onScoreSubmit?: (score: number) => void;
  onWinnerSelect?: () => void;
}

const TeamRow: React.FC<TeamRowProps> = ({ team, isLeader, isLast, mode, showInput, themeColor, onScoreSubmit, onWinnerSelect }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = () => {
    const score = parseFloat(inputValue);
    if (!isNaN(score) && onScoreSubmit) {
      onScoreSubmit(score);
      setInputValue('');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        padding: '16px',
        borderRadius: '16px',
        border: isLeader
          ? '2.5px solid #eab308'
          : isLast
          ? '2px solid rgba(239,68,68,0.35)'
          : '2px solid rgba(71,85,105,0.5)',
        background: isLeader
          ? 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(202,138,4,0.08) 100%)'
          : isLast
          ? 'rgba(239,68,68,0.06)'
          : 'rgba(30,41,59,0.6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: (showInput && mode === 'numeric') ? '14px' : '0' }}>
        {/* Cor do time */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 900, color: 'white',
          backgroundColor: team.color,
          boxShadow: isLeader ? `0 0 0 3px #eab308` : `0 0 0 2px ${team.color}66`,
          letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.2,
          overflow: 'hidden', padding: '4px',
        }}>
          {team.name.substring(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>#{team.position}</span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
              {team.name}
            </span>
            {isLeader && <Crown style={{ width: '20px', height: '20px', color: '#facc15', flexShrink: 0 }} fill="currentColor" />}
            {isLast && <TrendingDown style={{ width: '20px', height: '20px', color: '#f87171', flexShrink: 0 }} />}
          </div>
          {/* Membros */}
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {team.playerNames.join(' · ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: themeColor, lineHeight: 1 }}>{team.totalScore}</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>pts</span>
            <span style={{ fontSize: '14px', color: '#334155' }}>•</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              {team.roundScores.length} {team.roundScores.length === 1 ? 'rodada' : 'rodadas'}
            </span>
          </div>
        </div>

        {/* Botão +1 no modo winner */}
        {mode === 'winner' && showInput && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onWinnerSelect}
            style={{
              flexShrink: 0, width: '64px', height: '64px',
              borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${themeColor}55`,
            }}
          >
            <Plus style={{ width: '28px', height: '28px' }} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      {/* Input numérico */}
      {mode === 'numeric' && showInput && (
        <div style={{ display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="Pontos da rodada"
            style={{
              flex: 1, minWidth: 0, padding: '14px',
              background: 'rgba(15,23,42,0.7)', color: 'white', fontSize: '17px', fontWeight: 700,
              borderRadius: '14px', border: inputValue ? `2px solid ${themeColor}` : '2px solid rgba(71,85,105,0.6)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue}
            style={{
              width: '56px', flexShrink: 0, borderRadius: '14px', border: 'none',
              cursor: inputValue ? 'pointer' : 'not-allowed',
              backgroundColor: inputValue ? themeColor : 'rgba(71,85,105,0.4)',
              color: 'white', fontSize: '26px', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: inputValue ? 1 : 0.5,
              boxShadow: inputValue ? `0 4px 14px ${themeColor}55` : 'none',
            }}
          >
            +
          </button>
        </div>
      )}

      {/* Chips de histórico */}
      {team.roundScores.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {team.roundScores.map((score, i) => (
            <span key={i} style={{
              padding: '4px 10px', background: 'rgba(71,85,105,0.4)', borderRadius: '999px',
              fontSize: '13px', fontWeight: 600, color: score > 0 ? '#94a3b8' : score < 0 ? '#f87171' : '#64748b',
              whiteSpace: 'nowrap', flexShrink: 0, border: '1px solid rgba(71,85,105,0.3)',
            }}>
              R{i + 1}: {score > 0 ? '+' : ''}{score}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ── ActiveGame ────────────────────────────────────────────────────────────────
export const ActiveGame: React.FC<ActiveGameProps> = ({ onFinish, onQuit }) => {
  const { currentSession, availableGames, updatePlayerScore, updateTeamScore, recordRoundWinner, nextRound, finishSession } = useGame();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  if (!currentSession) return null;

  const gameConfig = availableGames.find(g => g.id === currentSession.gameId);
  if (!gameConfig) return null;

  const isTeamMode = !!(currentSession.teams?.length);
  const isWinnerMode = gameConfig.scoringMode === 'winner_takes_all';

  // Verifica se todos pontuaram nesta rodada
  const allScored = isTeamMode
    ? (currentSession.teams ?? []).every(t => t.roundScores.length === currentSession.currentRound)
    : currentSession.players.every(p => p.roundScores.length === currentSession.currentRound);

  // Auto-advance no modo numérico
  useEffect(() => {
    if (!isWinnerMode && allScored && currentSession.status === 'active') {
      const timer = setTimeout(() => { nextRound(); }, 800);
      return () => clearTimeout(timer);
    }
  }, [allScored, isWinnerMode, currentSession.currentRound]);

  const handleWinnerSelect = (winnerId: string) => {
    if (navigator.vibrate) navigator.vibrate(40);
    recordRoundWinner(winnerId);
  };

  const handleFinishGame = () => {
    finishSession();
    onFinish();
  };

  const checkWinCondition = () => {
    if (!gameConfig.winningScore) return false;
    if (isTeamMode) {
      return (currentSession.teams ?? []).some(t => (t.totalScore ?? 0) >= gameConfig.winningScore!);
    }
    return currentSession.players.some(p => (p.totalScore ?? 0) >= gameConfig.winningScore!);
  };

  const winConditionMet = checkWinCondition();
  const participantCount = isTeamMode ? (currentSession.teams?.length ?? 0) : currentSession.players.length;

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
              Rodada {currentSession.currentRound}
              {isTeamMode && ' · Times'}
              {isWinnerMode && ' · Vencedor da rodada'}
              {!isTeamMode && !isWinnerMode && ` · ${participantCount} jogadores`}
            </div>
          </div>

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

        {/* ── Banner modo winner ── */}
        {isWinnerMode && (
          <div style={{
            marginBottom: '16px', padding: '14px 18px',
            background: `${gameConfig.themeColor}18`, border: `1.5px solid ${gameConfig.themeColor}55`,
            borderRadius: '14px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: 600,
          }}>
            Toque em <strong style={{ color: gameConfig.themeColor }}>+1</strong> ao lado do {isTeamMode ? 'time' : 'jogador'} que ganhou a rodada
          </div>
        )}

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
                Atingiu {gameConfig.winningScore} pontos
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Banner todos pontuaram (modo numérico) ── */}
        {!isWinnerMode && allScored && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '16px', padding: '14px 18px',
              background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.4)',
              borderRadius: '14px', fontSize: '14px', color: '#34d399', fontWeight: 700, textAlign: 'center',
            }}
          >
            Todos pontuaram! Avançando para próxima rodada...
          </motion.div>
        )}

        {/* ── Lista de participantes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence mode="popLayout">
            {isTeamMode
              ? (currentSession.teams ?? []).map((team) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  isLeader={team.position === 1}
                  isLast={team.position === (currentSession.teams?.length ?? 0)}
                  mode={isWinnerMode ? 'winner' : 'numeric'}
                  showInput={isWinnerMode ? true : team.roundScores.length < currentSession.currentRound}
                  themeColor={gameConfig.themeColor}
                  onScoreSubmit={(score) => updateTeamScore(team.id, score)}
                  onWinnerSelect={() => handleWinnerSelect(team.id)}
                />
              ))
              : currentSession.players.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  isLeader={player.position === 1}
                  isLast={player.position === currentSession.players.length}
                  mode={isWinnerMode ? 'winner' : 'numeric'}
                  onScoreSubmit={(score) => updatePlayerScore(player.id, score)}
                  onWinnerSelect={() => handleWinnerSelect(player.id)}
                  showInput={isWinnerMode ? true : player.roundScores.length < currentSession.currentRound}
                  themeColor={gameConfig.themeColor}
                />
              ))
            }
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

      {/* ── Quit Confirm ── */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowQuitConfirm(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '20px', zIndex: 50,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#1e293b', padding: '28px', borderRadius: '20px',
                maxWidth: '380px', width: '100%', border: '1.5px solid rgba(71,85,105,0.5)',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>Abandonar Partida?</div>
              <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
                Todo o progresso da partida atual será perdido.
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  style={{ flex: 1, padding: '16px', background: 'rgba(71,85,105,0.5)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={onQuit}
                  style={{ flex: 1, padding: '16px', background: '#ef4444', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
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
