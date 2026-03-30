import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Timer, Play, Pause, Trophy, Palette } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useTranslation } from '../i18n/useTranslation';
import type { Player, Team } from '../types';

interface DueloScreenProps {
  onFinish: () => void;
  onQuit: () => void;
}

const TUTORIAL_KEY = 'duelo_tutorial_seen';

// ── Utilitários ──────────────────────────────────────────────────────────────

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

type Participant = (Player | Team) & { avatar?: string; playerNames?: string[] };

const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

const EMOJI_LIST = [
  '🦁','🐯','🦊','🐻','🐼','🐸','🐧','🦅','🐬','🦈','🐉','🦄',
  '🐺','🐮','🐱','🐶','🦝','🐨','⚽','🏀','🏈','🎾','🏐','🏓',
  '🥊','🎯','🏆','⚡','🎮','🎲','🏄','🎳',
];
const DEFAULT_EMOJIS = ['🦁', '🐯'];

const PANEL_COLORS = [
  '#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#14b8a6',
  '#3b82f6','#6366f1','#8b5cf6','#ec4899','#0ea5e9','#f43f5e',
  '#64748b','#1e293b','#7c3aed','#be123c',
];

// ── Panel ────────────────────────────────────────────────────────────────────

const Panel: React.FC<{
  participant: Participant;
  isTeam: boolean;
  flash: boolean;
  isLandscape: boolean;
  displayName?: string;
  emoji: string;
  panelColor: string;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onClick: () => void;
  onEditName: () => void;
  onEditEmoji: () => void;
  onEditColor: () => void;
}> = ({ participant, isTeam, flash, isLandscape, displayName, emoji, panelColor, onTouchStart, onTouchEnd, onClick, onEditName, onEditEmoji, onEditColor }) => {
  const tPanel = useTranslation();
  const name = displayName ?? participant.name;
  const score = participant.totalScore;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: panelColor,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        filter: flash ? 'brightness(1.35)' : 'brightness(1)',
        transition: 'filter 0.1s',
        overflow: 'hidden',
      }}
    >
      {/* Overlay gradiente sutil */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Pincel — troca cor (canto superior) */}
      <button
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditColor(); }}
        onTouchEnd={(e: React.TouchEvent) => { e.stopPropagation(); e.preventDefault(); onEditColor(); }}
        style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(0,0,0,0.18)', border: 'none', borderRadius: '50%',
          width: '30px', height: '30px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 2,
        }}
      >
        <Palette size={14} color="rgba(255,255,255,0.65)" />
      </button>

      {/* Info do participante — topo do painel */}
      <div style={{
        position: 'absolute',
        top: isLandscape ? '18px' : '22px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        {/* Emoji — clique para trocar */}
        <div
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditEmoji(); }}
          onTouchEnd={(e: React.TouchEvent) => { e.stopPropagation(); e.preventDefault(); onEditEmoji(); }}
          style={{
            fontSize: isLandscape ? '38px' : '48px',
            lineHeight: 1,
            cursor: 'pointer',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
          }}
        >
          {emoji}
        </div>
        {/* Nome — clique para editar */}
        <div
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEditName(); }}
          onTouchEnd={(e: React.TouchEvent) => { e.stopPropagation(); e.preventDefault(); onEditName(); }}
          style={{
            fontSize: isLandscape ? '16px' : '18px',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.35)',
            letterSpacing: '-0.01em',
            maxWidth: isLandscape ? '140px' : '200px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          {name}
        </div>
        {/* Membros do time */}
        {isTeam && (participant as Team).playerNames?.length > 0 && (
          <div style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontWeight: 600,
            maxWidth: isLandscape ? '140px' : '200px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {(participant as Team).playerNames.join(' · ')}
          </div>
        )}
      </div>

      {/* Pontuação — centro */}
      <motion.div
        key={score}
        initial={{ scale: 1.18 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 280 }}
        style={{
          fontSize: isLandscape ? '120px' : '150px',
          fontWeight: 900,
          color: 'white',
          textShadow: '0 6px 24px rgba(0,0,0,0.25)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {score}
      </motion.div>

      {/* Hint swipe — aparece sutilmente */}
      <div style={{
        position: 'absolute',
        bottom: '14px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.35)',
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}>
        {tPanel.duelo.tapHint}
      </div>
    </div>
  );
};

// ── Divider central ──────────────────────────────────────────────────────────

const CenterDivider: React.FC<{
  isLandscape: boolean;
  timerEnabled: boolean;
  timerSeconds: number;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onBack: () => void;
  onFinish: () => void;
}> = ({ isLandscape, timerEnabled, timerSeconds, timerRunning, onToggleTimer, onResetTimer, onBack, onFinish }) => {
  if (isLandscape) {
    // Landscape: divider vertical fino + pill de controles no centro
    return (
      <>
        {/* Linha divisória */}
        <div style={{ width: '3px', background: 'rgba(0,0,0,0.25)', flexShrink: 0 }} />

        {/* Controles flutuantes no centro */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          borderRadius: '999px',
          padding: '7px 14px',
          border: '1.5px solid rgba(255,255,255,0.12)',
          zIndex: 10,
        }}>
          <button onClick={onBack} style={ctrlBtn}>
            <ArrowLeft size={16} color="rgba(255,255,255,0.7)" />
          </button>
          {timerEnabled && (
            <>
              <button onClick={onToggleTimer} style={ctrlBtn}>
                {timerRunning ? <Pause size={14} color="white" /> : <Play size={14} color="white" />}
              </button>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums', minWidth: '54px', textAlign: 'center' }}>
                {formatTime(timerSeconds)}
              </span>
              <button onClick={onResetTimer} style={ctrlBtn}>
                <RotateCcw size={14} color="rgba(255,255,255,0.7)" />
              </button>
            </>
          )}
          <button onClick={onFinish} style={ctrlBtn}>
            <Trophy size={16} color="#fbbf24" />
          </button>
        </div>
      </>
    );
  }

  // Portrait: faixa horizontal
  return (
    <div style={{
      height: '60px',
      flexShrink: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      gap: '8px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Voltar */}
      <button onClick={onBack} style={{ ...ctrlBtn, width: '40px', height: '40px' }}>
        <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
      </button>

      {/* Timer (centro) */}
      {timerEnabled ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <button onClick={onToggleTimer} style={{ ...ctrlBtn, width: '36px', height: '36px' }}>
            {timerRunning ? <Pause size={14} color="white" /> : <Play size={14} color="white" />}
          </button>
          <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timerSeconds)}
          </span>
          <button onClick={onResetTimer} style={{ ...ctrlBtn, width: '36px', height: '36px' }}>
            <RotateCcw size={14} color="rgba(255,255,255,0.7)" />
          </button>
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      {/* Finalizar */}
      <button onClick={onFinish} style={{ ...ctrlBtn, width: '40px', height: '40px' }}>
        <Trophy size={18} color="#fbbf24" />
      </button>
    </div>
  );
};

const ctrlBtn: React.CSSProperties = {
  width: '32px', height: '32px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.1)',
  border: 'none', borderRadius: '50%', cursor: 'pointer',
  flexShrink: 0,
};

// ── Tutorial overlay ─────────────────────────────────────────────────────────

const TutorialOverlay: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const tTut = useTranslation();
  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '28px', zIndex: 50,
      padding: '32px',
    }}
    onClick={onDismiss}
  >
    <div style={{ fontSize: '36px', lineHeight: 1 }}>⚡</div>
    <div style={{ fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', textAlign: 'center' }}>
      {tTut.duelo.tutorial.title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px' }}>
      {[
        { icon: '👆', text: tTut.duelo.tutorial.tap },
        { icon: '👇', text: tTut.duelo.tutorial.swipeDown },
        { icon: '🏆', text: tTut.duelo.tutorial.finish },
        { icon: '↩️', text: tTut.duelo.tutorial.back },
      ].map(({ icon, text }) => (
        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '26px', width: '36px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
          <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{text}</span>
        </div>
      ))}
    </div>
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onDismiss}
      style={{
        marginTop: '8px',
        padding: '14px 40px',
        borderRadius: '999px',
        border: 'none',
        background: '#f59e0b',
        color: 'white',
        fontSize: '17px',
        fontWeight: 900,
        cursor: 'pointer',
      }}
    >
      {tTut.duelo.tutorial.gotIt}
    </motion.button>
  </motion.div>
  );
};

// ── Winner overlay ───────────────────────────────────────────────────────────

const WinnerOverlay: React.FC<{
  participant: Participant;
  isTeam: boolean;
  onFinish: () => void;
  onContinue: () => void;
}> = ({ participant, isTeam, onFinish, onContinue }) => {
  const tWin = useTranslation();
  const avatarEmoji = !isTeam ? (participant as Player).avatar : undefined;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', zIndex: 50, padding: '32px',
      }}
    >
      <div style={{ fontSize: '48px' }}>🏆</div>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: participant.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px', fontWeight: 900, color: 'white',
        border: '4px solid rgba(255,255,255,0.4)',
        boxShadow: `0 0 40px ${participant.color}88`,
      }}>
        {avatarEmoji ?? getInitials(participant.name)}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
          {participant.name}
        </div>
        <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
          {tWin.duelo.winner.reachedTarget(participant.totalScore ?? 0)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <button
          onClick={onContinue}
          style={{
            flex: 1, padding: '14px', borderRadius: '14px', border: '1.5px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', color: 'white',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {tWin.duelo.winner.continue}
        </button>
        <button
          onClick={onFinish}
          style={{
            flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
            background: '#f59e0b', color: 'white',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
          }}
        >
          {tWin.duelo.winner.finish}
        </button>
      </div>
    </motion.div>
  );
};

// ── DueloScreen ──────────────────────────────────────────────────────────────

export const DueloScreen: React.FC<DueloScreenProps> = ({ onFinish, onQuit }) => {
  const { currentSession, availableGames, updatePlayerScore, updateTeamScore, undoLastScore, finishSession } = useGame();

  // Derivações seguras antes dos hooks (usam optional chaining)
  const gameConfig = availableGames.find(g => g.id === currentSession?.gameId);
  const isTeamMode = !!currentSession?.teams?.length;
  const pointsPerTap = gameConfig?.duelPointsPerTap ?? 1;
  const timerEnabled = gameConfig?.duelTimerEnabled ?? false;

  // Participantes iniciais (para pinnar IDs nos refs)
  const initialParticipants: Participant[] = currentSession
    ? (isTeamMode ? (currentSession.teams ?? []) : currentSession.players)
    : [];

  // ── TODOS OS HOOKS ANTES DE QUALQUER RETURN CONDICIONAL ──
  const pinnedP1Id = useRef(initialParticipants[0]?.id ?? '');
  const pinnedP2Id = useRef(initialParticipants[1]?.id ?? '');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartY = useRef<Record<string, number>>({});

  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(timerEnabled);
  const [flash, setFlash] = useState<Record<string, boolean>>({});
  const [showTutorial, setShowTutorial] = useState(!localStorage.getItem(TUTORIAL_KEY));
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({});
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [emojiOverrides, setEmojiOverrides] = useState<Record<string, string>>({});
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});
  const [editingEmojiId, setEditingEmojiId] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);

  // Orientação — hooks registrados antes do return null para funcionar corretamente
  useEffect(() => {
    const update = () => setIsLandscape(window.innerWidth > window.innerHeight);
    const delayed = () => { setTimeout(update, 100); };
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', delayed);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', delayed);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (timerEnabled && timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s: number) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerEnabled]);

  // Win condition
  useEffect(() => {
    if (!currentSession || !gameConfig?.winningScore || winnerId) return;
    const parts: Participant[] = isTeamMode ? (currentSession.teams ?? []) : currentSession.players;
    const winner = parts.find(p => (p.totalScore ?? 0) >= gameConfig.winningScore!);
    if (winner) setWinnerId(winner.id);
  }, [currentSession?.players, currentSession?.teams]);

  // ── GUARD — após todos os hooks ──
  if (!currentSession) return null;

  const participants: Participant[] = isTeamMode
    ? (currentSession.teams ?? [])
    : currentSession.players;

  // Usa IDs pinnados para manter posição visual fixa independente da reordenação por score
  const p1 = participants.find(p => p.id === pinnedP1Id.current) ?? participants[0];
  const p2 = participants.find(p => p.id === pinnedP2Id.current) ?? participants[1];

  const p1Emoji = emojiOverrides[p1?.id] ?? DEFAULT_EMOJIS[0];
  const p2Emoji = emojiOverrides[p2?.id] ?? DEFAULT_EMOJIS[1];
  const p1Color = colorOverrides[p1?.id] ?? p1?.color;
  const p2Color = colorOverrides[p2?.id] ?? p2?.color;

  if (!p1 || !p2) return null;

  const triggerFlash = (id: string) => {
    setFlash((prev: Record<string, boolean>) => ({ ...prev, [id]: true }));
    setTimeout(() => setFlash((prev: Record<string, boolean>) => ({ ...prev, [id]: false })), 130);
  };

  const addScore = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(30);
    if (isTeamMode) updateTeamScore(id, pointsPerTap);
    else updatePlayerScore(id, pointsPerTap);
    triggerFlash(id);
  };

  const handleUndo = (id: string) => {
    if (navigator.vibrate) navigator.vibrate([20, 20, 20]);
    undoLastScore(id);
  };

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    touchStartY.current[id] = e.touches[0].clientY;
  };

  const handleTouchEnd = (id: string, e: React.TouchEvent) => {
    e.preventDefault();
    const startY = touchStartY.current[id] ?? 0;
    const endY = e.changedTouches[0].clientY;
    const delta = endY - startY;
    if (delta > 55) {
      handleUndo(id);
    } else if (Math.abs(delta) < 15) {
      addScore(id);
    }
  };

  const handleFinish = () => {
    finishSession();
    onFinish();
  };

  const dismissTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setShowTutorial(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: isLandscape ? 'row' : 'column',
      overflow: 'hidden',
    }}>
      {/* Panel 1 */}
      <Panel
        participant={p1}
        isTeam={isTeamMode}
        flash={!!flash[p1.id]}
        isLandscape={isLandscape}
        displayName={nameOverrides[p1.id]}
        emoji={p1Emoji}
        panelColor={p1Color}
        onTouchStart={e => handleTouchStart(p1.id, e)}
        onTouchEnd={e => handleTouchEnd(p1.id, e)}
        onClick={() => addScore(p1.id)}
        onEditName={() => setEditingNameId(p1.id)}
        onEditEmoji={() => setEditingEmojiId(p1.id)}
        onEditColor={() => setEditingColorId(p1.id)}
      />

      {/* Divider central */}
      <CenterDivider
        isLandscape={isLandscape}
        timerEnabled={timerEnabled}
        timerSeconds={timerSeconds}
        timerRunning={timerRunning}
        onToggleTimer={() => setTimerRunning(r => !r)}
        onResetTimer={() => setTimerSeconds(0)}
        onBack={onQuit}
        onFinish={handleFinish}
      />

      {/* Panel 2 */}
      <Panel
        participant={p2}
        isTeam={isTeamMode}
        flash={!!flash[p2.id]}
        isLandscape={isLandscape}
        displayName={nameOverrides[p2.id]}
        emoji={p2Emoji}
        panelColor={p2Color}
        onTouchStart={e => handleTouchStart(p2.id, e)}
        onTouchEnd={e => handleTouchEnd(p2.id, e)}
        onClick={() => addScore(p2.id)}
        onEditName={() => setEditingNameId(p2.id)}
        onEditEmoji={() => setEditingEmojiId(p2.id)}
        onEditColor={() => setEditingColorId(p2.id)}
      />

      {/* Overlays */}
      <AnimatePresence>
        {showTutorial && <TutorialOverlay onDismiss={dismissTutorial} />}
        {winnerId && !showTutorial && (
          <WinnerOverlay
            participant={participants.find(p => p.id === winnerId) ?? p1}
            isTeam={isTeamMode}
            onFinish={handleFinish}
            onContinue={() => setWinnerId(null)}
          />
        )}
        {editingEmojiId && !showTutorial && (
          <motion.div
            key="edit-emoji"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '20px', zIndex: 60, padding: '32px',
            }}
            onClick={() => setEditingEmojiId(null)}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                {(() => {
                  const p = participants.find(p => p.id === editingEmojiId);
                  return nameOverrides[editingEmojiId] ?? p?.name ?? '';
                })()}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px', width: '100%',
              }}>
                {EMOJI_LIST.map(em => (
                  <button
                    key={em}
                    onClick={() => {
                      setEmojiOverrides((prev: Record<string, string>) => ({ ...prev, [editingEmojiId]: em }));
                      setEditingEmojiId(null);
                    }}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: '10px', border: 'none',
                      background: (emojiOverrides[editingEmojiId] === em) ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                      fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: (emojiOverrides[editingEmojiId] === em) ? '0 0 0 2px white' : 'none',
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {editingColorId && !showTutorial && (
          <motion.div
            key="edit-color"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '20px', zIndex: 60, padding: '32px',
            }}
            onClick={() => setEditingColorId(null)}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                {(() => {
                  const p = participants.find(p => p.id === editingColorId);
                  return nameOverrides[editingColorId] ?? p?.name ?? '';
                })()}
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px', width: '100%',
              }}>
                {PANEL_COLORS.map(col => {
                  const currentColor = colorOverrides[editingColorId] ?? participants.find(p => p.id === editingColorId)?.color;
                  return (
                    <button
                      key={col}
                      onClick={() => {
                        setColorOverrides((prev: Record<string, string>) => ({ ...prev, [editingColorId]: col }));
                        setEditingColorId(null);
                      }}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: '14px', border: 'none',
                        background: col, cursor: 'pointer',
                        boxShadow: currentColor === col ? '0 0 0 3px white' : 'none',
                        transform: currentColor === col ? 'scale(1.08)' : 'scale(1)',
                        transition: 'transform 0.1s',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
        {editingNameId && !showTutorial && (() => {
          const editParticipant = participants.find(p => p.id === editingNameId);
          const currentName = nameOverrides[editingNameId] ?? editParticipant?.name ?? '';
          return (
            <motion.div
              key="edit-name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '18px', zIndex: 60, padding: '32px',
              }}
              onClick={() => setEditingNameId(null)}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: editParticipant?.color ?? '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 900, color: 'white',
                  border: '3px solid rgba(255,255,255,0.3)',
                }}>
                  {(editParticipant as Player)?.avatar ?? getInitials(editParticipant?.name ?? '')}
                </div>
                <input
                  autoFocus
                  value={currentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNameOverrides((prev: Record<string, string>) => ({ ...prev, [editingNameId]: e.target.value }))
                  }
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && setEditingNameId(null)}
                  maxLength={20}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '14px',
                    border: `2px solid ${editParticipant?.color ?? 'rgba(255,255,255,0.3)'}`,
                    background: 'rgba(255,255,255,0.1)', color: 'white',
                    fontSize: '20px', fontWeight: 800, outline: 'none', textAlign: 'center',
                    caretColor: 'white',
                  }}
                />
                <button
                  onClick={() => setEditingNameId(null)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                    background: editParticipant?.color ?? '#f59e0b', color: 'white',
                    fontSize: '16px', fontWeight: 900, cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
