import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { PlayerSelector } from '../components/PlayerSelector';
import { ShareModal } from '../components/ShareModal';
import { getGameConfig } from '../config/games';
import { useGame } from '../context/GameContext';
import type { Player } from '../types';

const iconMap: Record<string, React.ElementType> = {
  cloud: Icons.Cloud,
  hexagon: Icons.Hexagon,
  circle: Icons.Circle,
  mountain: Icons.Mountain,
  dices: Icons.Dices,
};

interface GameSetupProps {
  gameId: string;
  onBack: () => void;
  onStartGame: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ gameId, onBack, onStartGame }) => {
  const { savedPlayers, addSavedPlayer, startNewSession } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<
    Omit<Player, 'totalScore' | 'roundScores' | 'position'>[]
  >([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  const gameConfig = getGameConfig(gameId);
  if (!gameConfig) return null;

  const MainIcon = iconMap[gameConfig.icon] || Icons.Dices;
  const canStart = selectedPlayers.length >= 2;

  const victoryLabel =
    gameConfig.victoryCondition === 'lowest_score'
      ? 'Menor pontuação vence'
      : gameConfig.victoryCondition === 'highest_score'
      ? 'Maior pontuação vence'
      : 'Atingir pontuação alvo';

  const handleAddPlayer = (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => {
    setSelectedPlayers(prev => [...prev, player]);
    if (!savedPlayers.find((p) => p.id === player.id)) {
      addSavedPlayer(player);
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter((p) => p.id !== playerId));
  };

  const handleStartGame = () => {
    if (!canStart) return;
    const players: Player[] = selectedPlayers.map((p) => ({
      ...p,
      totalScore: 0,
      roundScores: [],
    }));
    startNewSession(gameId, players);
    onStartGame();
  };

  const handleOpenShare = () => {
    if (!canStart) return;
    setPendingSessionId(Date.now().toString());
    setShowShareModal(true);
  };

  const handleConfirmStart = () => {
    setShowShareModal(false);
    const players: Player[] = selectedPlayers.map((p) => ({
      ...p,
      totalScore: 0,
      roundScores: [],
    }));
    startNewSession(gameId, players, pendingSessionId!);
    onStartGame();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>

      {/* ── ZONA 1: Hero Header ── */}
      <div
        style={{
          position: 'relative', overflow: 'hidden', flexShrink: 0,
          background: `linear-gradient(135deg, ${gameConfig.themeColor}ee 0%, ${gameConfig.themeColor}88 100%)`,
          paddingTop: 'max(52px, env(safe-area-inset-top, 52px))',
          paddingBottom: '28px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {/* Ícone decorativo de fundo */}
        <div style={{ position: 'absolute', right: '-32px', bottom: '-16px', opacity: 0.15, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
          <MainIcon size={160} color="white" />
        </div>

        {/* Botão voltar */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: '20px', top: 'max(12px, env(safe-area-inset-top, 12px))',
            width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '24px', height: '24px', color: 'white' }} />
        </button>

        {/* Badge do ícone */}
        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
          <div style={{
            display: 'inline-flex', padding: '16px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <MainIcon style={{ width: '40px', height: '40px', color: 'white' }} strokeWidth={2} />
          </div>
        </div>

        {/* Nome */}
        <div style={{ fontSize: '42px', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {gameConfig.name}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', marginTop: '6px', fontWeight: 500 }}>
          Configure sua partida
        </div>
      </div>

      {/* ── ZONA 2: Corpo scrollável ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 160px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Regras colapsáveis */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: `2px solid ${gameConfig.themeColor}55`, background: `${gameConfig.themeColor}18` }}>
          <button
            onClick={() => setRulesOpen(r => !r)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 900, color: 'white', fontSize: '20px', letterSpacing: '-0.01em' }}>Regras do Jogo</span>
            {rulesOpen
              ? <ChevronUp style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.6)' }} />
              : <ChevronDown style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.6)' }} />
            }
          </button>

          <AnimatePresence>
            {rulesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {[
                    { label: 'Vitória', value: victoryLabel },
                    ...(gameConfig.winningScore ? [{ label: 'Meta', value: `${gameConfig.winningScore} pts` }] : []),
                    { label: 'Score negativo', value: gameConfig.allowNegative ? 'Permitido' : 'Não permitido' },
                    { label: 'Sistema', value: gameConfig.roundBased ? 'Por rodadas' : 'Pontuação contínua' },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: i === 0 ? '16px' : '12px',
                      paddingBottom: '12px',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>{row.label}</span>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seletor de jogadores */}
        <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '16px', border: '2px solid rgba(71,85,105,0.6)', padding: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em', marginBottom: '16px' }}>
            Jogadores
          </div>
          <PlayerSelector
            selectedPlayers={selectedPlayers}
            savedPlayers={savedPlayers}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            themeColor={gameConfig.themeColor}
          />
        </div>
      </div>

      {/* ── ZONA 3: Footer fixo ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: `16px 16px max(20px, env(safe-area-inset-bottom, 20px))`,
        background: 'linear-gradient(to top, #0f172a 60%, rgba(15,23,42,0.95) 85%, transparent)',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {!canStart && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px',
            border: '1.5px solid rgba(255,255,255,0.1)',
          }}>
            <span style={{ fontSize: '17px', color: '#94a3b8', fontWeight: 700, textAlign: 'center' }}>
              Adicione pelo menos 2 jogadores para começar
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Botão compartilhar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenShare}
            disabled={!canStart}
            style={{
              width: '68px', height: '68px', flexShrink: 0, borderRadius: '16px',
              border: `2.5px solid ${canStart ? gameConfig.themeColor : 'rgba(255,255,255,0.1)'}`,
              background: canStart ? `${gameConfig.themeColor}22` : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canStart ? 'pointer' : 'not-allowed',
              opacity: canStart ? 1 : 0.35,
            }}
          >
            <Share2 style={{ width: '26px', height: '26px', color: canStart ? gameConfig.themeColor : '#475569' }} />
          </motion.button>

          {/* CTA Iniciar */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartGame}
            disabled={!canStart}
            style={{
              flex: 1, height: '68px', borderRadius: '16px',
              background: canStart ? gameConfig.themeColor : 'rgba(255,255,255,0.08)',
              border: 'none', cursor: canStart ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              fontSize: '20px', fontWeight: 900, color: 'white',
              opacity: canStart ? 1 : 0.4,
              boxShadow: canStart ? `0 8px 24px ${gameConfig.themeColor}55` : 'none',
            }}
          >
            <Play style={{ width: '26px', height: '26px' }} fill="currentColor" />
            INICIAR PARTIDA
          </motion.button>
        </div>
      </div>

      {/* Modal de compartilhamento */}
      {showShareModal && pendingSessionId && (
        <ShareModal
          sessionId={pendingSessionId}
          gameName={gameConfig.name}
          themeColor={gameConfig.themeColor}
          onClose={() => setShowShareModal(false)}
          onConfirmStart={handleConfirmStart}
        />
      )}
    </div>
  );
};
