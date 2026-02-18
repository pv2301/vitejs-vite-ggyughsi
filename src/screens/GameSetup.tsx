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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)' }}
    >
      {/* ── ZONA 1: Hero Header ── */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{
          background: `linear-gradient(135deg, ${gameConfig.themeColor}ee 0%, ${gameConfig.themeColor}88 100%)`,
          paddingTop: 'max(52px, env(safe-area-inset-top, 52px))',
          paddingBottom: '28px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {/* Ícone decorativo de fundo */}
        <div className="absolute -right-8 -bottom-4 opacity-[0.15] rotate-12 pointer-events-none">
          <MainIcon size={160} color="white" />
        </div>

        {/* Botão voltar — absoluto no topo */}
        <button
          onClick={onBack}
          className="absolute left-5 flex items-center justify-center w-11 h-11 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20"
          style={{ top: 'max(12px, env(safe-area-inset-top, 12px))' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        {/* Badge do ícone do jogo */}
        <div className="mt-2 mb-4">
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
            <MainIcon className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Nome e subtítulo */}
        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
          {gameConfig.name}
        </h1>
        <p className="text-white/70 text-base mt-1 font-medium">Configure sua partida</p>
      </div>

      {/* ── ZONA 2: Corpo scrollável ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-36 space-y-4">

        {/* Regras colapsáveis */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{
            background: `${gameConfig.themeColor}18`,
            borderColor: `${gameConfig.themeColor}44`,
          }}
        >
          <button
            onClick={() => setRulesOpen(r => !r)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <span className="font-bold text-white text-base">Regras do Jogo</span>
            {rulesOpen
              ? <ChevronUp className="w-5 h-5 text-white/60" />
              : <ChevronDown className="w-5 h-5 text-white/60" />
            }
          </button>

          <AnimatePresence>
            {rulesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t border-white/10">
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-slate-400 text-sm">Vitória</span>
                    <span className="font-semibold text-white text-sm">{victoryLabel}</span>
                  </div>
                  {gameConfig.winningScore && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Meta</span>
                      <span className="font-semibold text-white text-sm">{gameConfig.winningScore} pts</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Score negativo</span>
                    <span className="font-semibold text-white text-sm">
                      {gameConfig.allowNegative ? 'Permitido' : 'Não permitido'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Sistema</span>
                    <span className="font-semibold text-white text-sm">
                      {gameConfig.roundBased ? 'Por rodadas' : 'Pontuação contínua'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seletor de jogadores */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/60 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Jogadores
          </p>
          <PlayerSelector
            selectedPlayers={selectedPlayers}
            savedPlayers={savedPlayers}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
            themeColor={gameConfig.themeColor}
          />
        </div>
      </div>

      {/* ── ZONA 3: Footer fixo com CTA ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pt-3 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
      >
        {!canStart && (
          <p className="text-center text-slate-500 text-xs mb-3 font-medium">
            Adicione pelo menos 2 jogadores para começar
          </p>
        )}

        <div className="flex gap-3">
          {/* Botão compartilhar (quadrado) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenShare}
            disabled={!canStart}
            className="flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all disabled:opacity-30"
            style={{
              borderColor: gameConfig.themeColor,
              backgroundColor: `${gameConfig.themeColor}22`,
            }}
          >
            <Share2 className="w-6 h-6" style={{ color: gameConfig.themeColor }} />
          </motion.button>

          {/* CTA principal */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartGame}
            disabled={!canStart}
            className="flex-1 h-16 rounded-2xl font-black text-white text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-40 shadow-2xl"
            style={{ backgroundColor: gameConfig.themeColor }}
          >
            <Play className="w-7 h-7" fill="currentColor" />
            Iniciar Partida
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
