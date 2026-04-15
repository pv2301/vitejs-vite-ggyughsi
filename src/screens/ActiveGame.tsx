import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, AlertCircle, Crown, TrendingDown, Plus, Timer, Pause, Play, RotateCcw, Skull, UserRoundX, Undo2, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerRow } from '../components/PlayerRow';
import { DueloScreen } from './DueloScreen';
import { useGame } from '../context/GameContext';
import { useTranslation } from '../i18n/useTranslation';
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
  allowNegative?: boolean;
  victoryCondition?: string;
  roundPlaceholder?: string;
  onScoreSubmit?: (score: number) => void;
  onWinnerSelect?: () => void;
}

const TeamRow: React.FC<TeamRowProps> = ({ team, isLeader, isLast, mode, showInput, themeColor, allowNegative = false, victoryCondition, roundPlaceholder, onScoreSubmit, onWinnerSelect }) => {
  const tRow = useTranslation();
  const placeholder = roundPlaceholder ?? tRow.activeGame.roundPlaceholder;
  const [inputValue, setInputValue] = React.useState('');
  const [isNegative, setIsNegative] = React.useState(false);
  const negativeColor = (allowNegative && victoryCondition === 'lowest_score') ? '#60a5fa' : '#f87171';

  const handleSubmit = () => {
    const raw = parseFloat(inputValue);
    if (!isNaN(raw) && onScoreSubmit) {
      onScoreSubmit(isNegative ? -Math.abs(raw) : raw);
      setInputValue('');
      setIsNegative(false);
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
              {tRow.activeGame.roundsLabel(team.roundScores.length)}
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
          <div style={{
            flex: 1, minWidth: 0, display: 'flex', alignItems: 'stretch',
            background: 'rgba(15,23,42,0.7)', borderRadius: '14px',
            border: inputValue
              ? `2px solid ${isNegative ? negativeColor : themeColor}`
              : '2px solid rgba(71,85,105,0.6)',
            overflow: 'hidden', transition: 'border-color 0.15s', boxSizing: 'border-box',
          }}>
            {allowNegative && (
              <button
                onClick={() => setIsNegative(n => !n)}
                style={{
                  flexShrink: 0, width: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isNegative ? `${negativeColor}22` : 'transparent',
                  border: 'none',
                  borderRight: isNegative
                    ? `1.5px solid ${negativeColor}55`
                    : '1.5px solid rgba(71,85,105,0.4)',
                  cursor: 'pointer',
                  color: isNegative ? negativeColor : '#475569',
                  fontSize: '22px', fontWeight: 900, lineHeight: 1,
                  transition: 'background 0.15s, color 0.15s', paddingBottom: '2px',
                }}
              >
                −
              </button>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={e => setInputValue(e.target.value.replace(/[^0-9.]/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder={placeholder}
              style={{
                flex: 1, minWidth: 0, padding: '14px',
                background: 'transparent',
                color: isNegative ? negativeColor : 'white',
                fontSize: '17px', fontWeight: 700,
                border: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
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
              fontSize: '13px', fontWeight: 600, color: score > 0 ? '#94a3b8' : score < 0 ? negativeColor : '#64748b',
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
  const { currentSession, availableGames, updatePlayerScore, updateTeamScore, recordRoundWinner, nextRound, finishSession, eliminatePlayer, reinstatePlayer } = useGame();
  const t = useTranslation();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showEliminateSheet, setShowEliminateSheet] = useState(false);
  const [eliminatedCollapsed, setEliminatedCollapsed] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsedSeconds(0);
    setTimerRunning(true);
  }, [currentSession?.id]);

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => setElapsedSeconds((s: number) => s + 1), 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerRunning]);

  if (!currentSession) return null;

  const gameConfig = availableGames.find(g => g.id === currentSession.gameId);
  if (!gameConfig) return null;

  const isTeamMode = !!(currentSession.teams?.length);
  const isDueloMode = gameConfig.scoringMode === 'duelo';
  const isWinnerMode = gameConfig.scoringMode === 'winner_takes_all';

  // Modo Duelo: renderiza tela split-screen dedicada
  if (isDueloMode) {
    return <DueloScreen onFinish={onFinish} onQuit={onQuit} />;
  }

  // Verifica se todos pontuaram nesta rodada
  const allScored = isTeamMode
    ? (currentSession.teams ?? []).every(t => t.roundScores.length === currentSession.currentRound)
    : currentSession.players.every(p => p.roundScores.length === currentSession.currentRound);

  // Pontuação parcial: ao menos 1 pontuou mas não todos (só no modo numérico)
  const someScored = !isWinnerMode && !allScored && (isTeamMode
    ? (currentSession.teams ?? []).some((tm: Team) => tm.roundScores.length === currentSession.currentRound)
    : currentSession.players.some((pl: { roundScores: unknown[] }) => pl.roundScores.length === currentSession.currentRound));

  const finishDisabled = !isWinnerMode && (allScored || someScored);

  // Auto-advance no modo numérico (respeitando maxRounds)
  const maxRounds = gameConfig.maxRounds;
  const isLastRound = maxRounds ? currentSession.currentRound >= maxRounds : false;

  useEffect(() => {
    if (!isWinnerMode && allScored && currentSession.status === 'active') {
      // Se atingiu o máximo de rodadas, finaliza o jogo
      if (isLastRound) {
        const timer = setTimeout(() => { handleFinishGame(); }, 2000);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => { nextRound(); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [allScored, isWinnerMode, currentSession.currentRound, isLastRound]);

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

  // ── Eliminação ──
  const isEliminationMode = !!gameConfig.eliminationMode;
  const activePlayers = isTeamMode
    ? (currentSession.teams ?? []).filter(t => !t.eliminated)
    : currentSession.players.filter(p => !p.eliminated);
  const eliminatedPlayers = isTeamMode
    ? (currentSession.teams ?? []).filter(t => t.eliminated)
    : currentSession.players.filter(p => p.eliminated);
  const activeCount = activePlayers.length;
  const eliminatedCount = eliminatedPlayers.length;
  const lastOneStanding = isEliminationMode && activeCount === 1 && eliminatedCount > 0;

  // Auto-finish quando resta 1 jogador no modo eliminação
  useEffect(() => {
    if (lastOneStanding && currentSession.status === 'active') {
      const timer = setTimeout(() => { handleFinishGame(); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [lastOneStanding, currentSession.status]);

  // Auto-eliminação por score threshold
  useEffect(() => {
    if (!isEliminationMode || gameConfig.eliminationTrigger !== 'score_threshold') return;
    if (gameConfig.eliminationThreshold === undefined) return;
    const threshold = gameConfig.eliminationThreshold;
    const participants = isTeamMode ? (currentSession.teams ?? []) : currentSession.players;
    participants.forEach((p: any) => {
      if (!p.eliminated && (p.totalScore ?? 0) <= threshold && p.roundScores.length > 0) {
        eliminatePlayer(p.id);
      }
    });
  }, [isTeamMode ? currentSession.teams : currentSession.players]);

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
            <div style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>
                {t.activeGame.roundLabel} {currentSession.currentRound}
                {maxRounds ? ` de ${maxRounds}` : ''}
                {isTeamMode && t.activeGame.teamsLabel}
                {isWinnerMode && t.activeGame.winnerLabel}
                {!isTeamMode && !isWinnerMode && t.activeGame.playersLabel(participantCount)}
              </span>
              {gameConfig.timerEnabled && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <button
                    onClick={() => setTimerRunning((r: boolean) => !r)}
                    style={{
                      width: '22px', height: '22px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: `${gameConfig.themeColor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    {timerRunning
                      ? <Pause style={{ width: '10px', height: '10px', color: gameConfig.themeColor }} />
                      : <Play style={{ width: '10px', height: '10px', color: gameConfig.themeColor }} />}
                  </button>
                  <Timer style={{ width: '13px', height: '13px', color: timerRunning ? gameConfig.themeColor : '#64748b' }} />
                  <span style={{ color: timerRunning ? gameConfig.themeColor : '#64748b', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => setElapsedSeconds(0)}
                    style={{
                      width: '22px', height: '22px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <RotateCcw style={{ width: '10px', height: '10px', color: '#64748b' }} />
                  </button>
                </span>
              )}
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
            {t.activeGame.bannerWinner} <strong style={{ color: '#22c55e', fontSize: '16px', fontWeight: 900 }}>+</strong> {t.activeGame.bannerWinnerSuffix}
          </div>
        )}

        {/* ── Banner modo numérico (antes de todos pontuarem) ── */}
        {!isWinnerMode && !allScored && (
          <div style={{
            marginBottom: '16px', padding: '14px 18px',
            background: 'rgba(96,165,250,0.12)', border: '1.5px solid rgba(96,165,250,0.4)',
            borderRadius: '14px', fontSize: '14px', color: '#60a5fa', fontWeight: 700, textAlign: 'center',
          }}>
            {t.activeGame.bannerEnterScores}
          </div>
        )}

        {/* ── Banner última rodada (maxRounds) ── */}
        {isLastRound && !allScored && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginBottom: '16px', padding: '14px 18px',
              background: 'rgba(251,146,60,0.12)', border: '1.5px solid rgba(251,146,60,0.5)',
              borderRadius: '14px', fontSize: '14px', color: '#fb923c', fontWeight: 700, textAlign: 'center',
            }}
          >
            🏁 Última rodada! Rodada {currentSession.currentRound} de {maxRounds}
          </motion.div>
        )}

        {isLastRound && allScored && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginBottom: '16px', padding: '14px 18px',
              background: 'rgba(234,179,8,0.15)', border: '1.5px solid rgba(234,179,8,0.5)',
              borderRadius: '14px', fontSize: '14px', color: '#eab308', fontWeight: 700, textAlign: 'center',
            }}
          >
            🎉 Jogo finalizado! Calculando resultado...
          </motion.div>
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
              <div style={{ color: '#facc15', fontWeight: 700, fontSize: '16px' }}>{t.activeGame.winConditionReached}</div>
              <div style={{ color: 'rgba(253,224,71,0.75)', fontSize: '14px', marginTop: '2px' }}>
                {t.activeGame.winConditionSub(gameConfig.winningScore!)}
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
            {t.activeGame.bannerAllScored}
          </motion.div>
        )}

        {/* ── Lista de participantes (ativos) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence mode="popLayout">
            {isTeamMode
              ? (currentSession.teams ?? []).filter(t => !t.eliminated).map((team) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  isLeader={team.position === 1}
                  isLast={team.position === activeCount}
                  mode={isWinnerMode ? 'winner' : 'numeric'}
                  showInput={isWinnerMode ? true : team.roundScores.length < currentSession.currentRound}
                  themeColor={gameConfig.themeColor}
                  allowNegative={gameConfig.allowNegative}
                  victoryCondition={gameConfig.victoryCondition}
                  onScoreSubmit={(score) => updateTeamScore(team.id, score)}
                  onWinnerSelect={() => handleWinnerSelect(team.id)}
                />
              ))
              : currentSession.players.filter(p => !p.eliminated).map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  isLeader={player.position === 1}
                  isLast={player.position === activeCount}
                  mode={isWinnerMode ? 'winner' : 'numeric'}
                  onScoreSubmit={(score) => updatePlayerScore(player.id, score)}
                  onWinnerSelect={() => handleWinnerSelect(player.id)}
                  showInput={isWinnerMode ? true : player.roundScores.length < currentSession.currentRound}
                  themeColor={gameConfig.themeColor}
                  allowNegative={gameConfig.allowNegative}
                  victoryCondition={gameConfig.victoryCondition}
                />
              ))
            }
          </AnimatePresence>
        </div>

        {/* ── Seção de Eliminados ── */}
        {isEliminationMode && eliminatedCount > 0 && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setEliminatedCollapsed(c => !c)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
              }}
            >
              <Skull style={{ width: '16px', height: '16px', color: '#64748b' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Eliminados ({eliminatedCount})
              </span>
              {eliminatedCollapsed
                ? <ChevronDown style={{ width: '14px', height: '14px', color: '#475569' }} />
                : <ChevronUp style={{ width: '14px', height: '14px', color: '#475569' }} />}
            </button>

            <AnimatePresence>
              {!eliminatedCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}
                >
                  {(isTeamMode
                    ? (currentSession.teams ?? []).filter(t => t.eliminated)
                    : currentSession.players.filter(p => p.eliminated)
                  ).sort((a: any, b: any) => (b.eliminationOrder ?? 0) - (a.eliminationOrder ?? 0)).map((p: any) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 0.5, x: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)',
                          backgroundColor: p.color || '#475569', opacity: 0.5,
                        }}>
                          {(p.name || '').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                            💀 Eliminado na rodada {p.eliminatedAtRound}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                          {p.totalScore ?? 0}
                        </span>
                        {gameConfig.allowReentry && (
                          <button
                            onClick={() => reinstatePlayer(p.id)}
                            style={{
                              padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              background: 'rgba(16,185,129,0.15)', color: '#34d399',
                              fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                          >
                            <Undo2 style={{ width: '12px', height: '12px' }} /> Buy-in
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Banner último sobrevivente ── */}
        {lastOneStanding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: '20px', padding: '18px 22px',
              background: 'rgba(234,179,8,0.15)', border: '2px solid #eab308',
              borderRadius: '16px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>🏆</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#eab308' }}>
              {activePlayers[0] && ('name' in activePlayers[0] ? (activePlayers[0] as any).name : '')} venceu!
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Finalizando partida...
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Footer fixo ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: `16px 16px max(20px, env(safe-area-inset-bottom, 20px))`,
        background: 'linear-gradient(to top, #0f172a 60%, rgba(15,23,42,0) 100%)',
        display: 'flex', gap: '12px',
      }}>
        {isEliminationMode && activeCount > 1 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowEliminateSheet(true)}
            style={{
              width: '68px', height: '68px', borderRadius: '16px', border: 'none', cursor: 'pointer', flexShrink: 0,
              background: 'rgba(239,68,68,0.15)', color: '#f87171',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px',
            }}
          >
            <UserRoundX style={{ width: '22px', height: '22px' }} />
            <span style={{ fontSize: '9px', fontWeight: 700 }}>Eliminar</span>
          </motion.button>
        )}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={finishDisabled ? {} : { scale: 0.97 }}
          onClick={finishDisabled ? undefined : handleFinishGame}
          disabled={finishDisabled}
          style={{
            flex: 1, height: '68px', borderRadius: '16px', border: 'none',
            cursor: finishDisabled ? 'not-allowed' : 'pointer',
            background: finishDisabled ? 'rgba(71,85,105,0.5)' : gameConfig.themeColor,
            fontSize: '18px', fontWeight: 800,
            color: finishDisabled ? 'rgba(255,255,255,0.4)' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: finishDisabled ? 'none' : `0 8px 24px ${gameConfig.themeColor}55`,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
        >
          <Trophy style={{ width: '22px', height: '22px' }} />
          {t.activeGame.finish}
        </motion.button>
      </div>

      {/* ── Eliminate Sheet ── */}
      <AnimatePresence>
        {showEliminateSheet && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEliminateSheet(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end',
              justifyContent: 'center', zIndex: 50,
            }}
          >
            <motion.div
              initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#1e293b', borderRadius: '24px 24px 0 0', width: '100%',
                maxWidth: '500px', maxHeight: '70vh', overflow: 'auto',
                padding: '24px 20px max(24px, env(safe-area-inset-bottom, 24px))',
                border: '1.5px solid rgba(239,68,68,0.3)', borderBottom: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <UserRoundX style={{ width: '24px', height: '24px', color: '#f87171' }} />
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>Eliminar Jogador</span>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                Selecione quem será eliminado da partida:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activePlayers.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { eliminatePlayer(p.id); setShowEliminateSheet(false); if (navigator.vibrate) navigator.vibrate([30, 50, 80]); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '14px',
                      background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)',
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 900, color: 'white',
                      backgroundColor: p.color || '#475569',
                    }}>
                      {(p.name || '').substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{p.totalScore ?? 0} pts</div>
                    </div>
                    <Skull style={{ width: '18px', height: '18px', color: '#f87171' }} />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEliminateSheet(false)}
                style={{
                  marginTop: '16px', width: '100%', padding: '14px', borderRadius: '14px',
                  background: 'rgba(71,85,105,0.4)', border: 'none', color: 'white',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{t.activeGame.quit.title}</div>
              <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
                {t.activeGame.quit.message}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  style={{ flex: 1, padding: '16px', background: 'rgba(71,85,105,0.5)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t.activeGame.quit.cancel}
                </button>
                <button
                  onClick={onQuit}
                  style={{ flex: 1, padding: '16px', background: '#ef4444', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {t.activeGame.quit.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
