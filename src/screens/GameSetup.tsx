import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, ChevronDown, ChevronUp, Camera, Trash2 } from 'lucide-react';
import { gameIconMap } from './GameEditor';
import * as Icons from 'lucide-react';
import { PlayerSelector } from '../components/PlayerSelector';
import { useGame } from '../context/GameContext';
import type { Player, VictoryCondition } from '../types';

interface GameSetupProps {
  gameId: string;
  onBack: () => void;
  onStartGame: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  ...gameIconMap,
  cloud: Icons.Cloud,
  hexagon: Icons.Hexagon,
  circle: Icons.Circle,
  mountain: Icons.Mountain,
  dices: Icons.Dices,
};

export const GameSetup: React.FC<GameSetupProps> = ({ gameId, onBack, onStartGame }) => {
  const { savedPlayers, addSavedPlayer, startNewSession, availableGames, updateGameOverride, updateGameImage, deleteCustomGame } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<Omit<Player, 'totalScore' | 'roundScores' | 'position'>[]>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado local para edição de regras (inicializado com config atual)
  const gameConfig = availableGames.find(g => g.id === gameId);
  const [editVictory, setEditVictory] = useState<VictoryCondition>(gameConfig?.victoryCondition ?? 'highest_score');
  const [editMeta, setEditMeta] = useState(gameConfig?.winningScore?.toString() ?? '');
  const [editAllowNegative, setEditAllowNegative] = useState(gameConfig?.allowNegative ?? true);
  const [editRoundBased, setEditRoundBased] = useState(gameConfig?.roundBased ?? true);
  const [rulesDirty, setRulesDirty] = useState(false);

  if (!gameConfig) return null;

  const isCustom = gameConfig.isCustom ?? false;
  const isGeneric = gameId === 'generic';
  const canEditAllRules = isCustom || isGeneric;
  const MainIcon = iconMap[gameConfig.icon] || Icons.Dices;
  const canStart = selectedPlayers.length >= 2;

  const victoryLabel = (v: VictoryCondition) =>
    v === 'lowest_score' ? 'Menor pontuação vence'
    : v === 'highest_score' ? 'Maior pontuação vence'
    : 'Atingir pontuação alvo';

  const handleAddPlayer = (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => {
    setSelectedPlayers(prev => [...prev, player]);
    if (!savedPlayers.find(p => p.id === player.id)) addSavedPlayer(player);
  };
  const handleRemovePlayer = (playerId: string) => setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));

  const saveRules = () => {
    if (!rulesDirty) return;
    updateGameOverride(gameId, {
      victoryCondition: editVictory,
      winningScore: editMeta ? parseInt(editMeta, 10) : undefined,
      allowNegative: editAllowNegative,
      roundBased: editRoundBased,
    });
    setRulesDirty(false);
  };

  const handleRulesToggle = () => {
    if (rulesOpen) saveRules();
    setRulesOpen(r => !r);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateGameImage(gameId, ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStartGame = () => {
    if (!canStart) return;
    saveRules();
    const players: Player[] = selectedPlayers.map(p => ({ ...p, totalScore: 0, roundScores: [] }));
    startNewSession(gameId, players);
    onStartGame();
  };

  const handleDeleteGame = () => {
    deleteCustomGame(gameId);
    onBack();
  };

  const selectStyle: React.CSSProperties = {
    background: '#0f172a',
    border: '1.5px solid #334155',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'white',
    fontWeight: 700,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>

      {/* ── ZONA 1: Hero Header ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        background: `linear-gradient(135deg, ${gameConfig.themeColor}ee 0%, ${gameConfig.themeColor}88 100%)`,
        paddingTop: 'max(52px, env(safe-area-inset-top, 52px))',
        paddingBottom: '28px', paddingLeft: '20px', paddingRight: '20px',
      }}>
        {/* Ícone decorativo de fundo */}
        <div style={{ position: 'absolute', right: '-32px', bottom: '-16px', opacity: 0.15, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
          <MainIcon size={160} color="white" />
        </div>

        {/* Botão voltar */}
        <button onClick={onBack} style={{
          position: 'absolute', left: '20px', top: 'max(12px, env(safe-area-inset-top, 12px))',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
        }}>
          <ArrowLeft style={{ width: '24px', height: '24px', color: 'white' }} />
        </button>

        {/* Botão excluir jogo custom */}
        {isCustom && (
          <button onClick={handleDeleteGame} style={{
            position: 'absolute', right: '20px', top: 'max(12px, env(safe-area-inset-top, 12px))',
            width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(239,68,68,0.25)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer',
          }}>
            <Trash2 style={{ width: '20px', height: '20px', color: '#fca5a5' }} />
          </button>
        )}

        {/* Badge do ícone com upload */}
        <div style={{ marginTop: '8px', marginBottom: '16px', position: 'relative', display: 'inline-block' }}>
          <div style={{
            display: 'inline-flex', padding: '16px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', overflow: 'hidden',
            width: '72px', height: '72px', alignItems: 'center', justifyContent: 'center',
          }}>
            {gameConfig.imageBase64 ? (
              <img src={gameConfig.imageBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            ) : (
              <MainIcon style={{ width: '40px', height: '40px', color: 'white' }} strokeWidth={2} />
            )}
          </div>
          {/* Botão câmera */}
          <label style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            width: '26px', height: '26px', borderRadius: '50%',
            background: '#1e293b', border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Camera style={{ width: '13px', height: '13px', color: 'white' }} />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </div>

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
            onClick={handleRulesToggle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 900, color: 'white', fontSize: '20px', letterSpacing: '-0.01em' }}>
              Regras do Jogo
              {rulesDirty && <span style={{ fontSize: '12px', color: gameConfig.themeColor, fontWeight: 700, marginLeft: '8px' }}>● editado</span>}
            </span>
            {rulesOpen
              ? <ChevronUp style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.6)' }} />
              : <ChevronDown style={{ width: '24px', height: '24px', color: 'rgba(255,255,255,0.6)' }} />}
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
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>

                  {/* Vitória */}
                  {canEditAllRules ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>Vitória</span>
                      <select
                        value={editVictory}
                        onChange={e => { setEditVictory(e.target.value as VictoryCondition); setRulesDirty(true); }}
                        style={selectStyle}
                      >
                        <option value="highest_score">Maior pontuação vence</option>
                        <option value="lowest_score">Menor pontuação vence</option>
                        <option value="target_score">Atingir pontuação alvo</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>Vitória</span>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{victoryLabel(editVictory)}</span>
                    </div>
                  )}

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: '#94a3b8', fontSize: '15px' }}>Meta</span>
                    <input
                      type="number"
                      placeholder="Sem meta"
                      value={editMeta}
                      onChange={e => { setEditMeta(e.target.value); setRulesDirty(true); }}
                      style={{
                        width: '110px', background: '#0f172a', border: '1.5px solid #334155',
                        borderRadius: '10px', padding: '7px 12px', fontSize: '14px',
                        color: 'white', fontWeight: 700, outline: 'none', textAlign: 'right',
                      }}
                    />
                  </div>

                  {/* Score negativo */}
                  {canEditAllRules ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>Score negativo</span>
                      <button
                        onClick={() => { setEditAllowNegative(v => !v); setRulesDirty(true); }}
                        style={{
                          padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                          background: editAllowNegative ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                          color: editAllowNegative ? '#34d399' : '#f87171',
                          fontSize: '13px', fontWeight: 700,
                        }}
                      >
                        {editAllowNegative ? 'Permitido' : 'Não permitido'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>Score negativo</span>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{editAllowNegative ? 'Permitido' : 'Não permitido'}</span>
                    </div>
                  )}

                  {/* Sistema */}
                  {canEditAllRules ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '0' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>Sistema</span>
                      <select
                        value={editRoundBased ? 'rounds' : 'continuous'}
                        onChange={e => { setEditRoundBased(e.target.value === 'rounds'); setRulesDirty(true); }}
                        style={selectStyle}
                      >
                        <option value="rounds">Por rodadas</option>
                        <option value="continuous">Pontuação contínua</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', paddingBottom: '0' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>Sistema</span>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{editRoundBased ? 'Por rodadas' : 'Pontuação contínua'}</span>
                    </div>
                  )}

                  {/* Botão salvar */}
                  {rulesDirty && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={saveRules}
                      style={{
                        marginTop: '16px', padding: '12px', borderRadius: '12px', border: 'none',
                        background: gameConfig.themeColor, color: 'white', fontWeight: 800,
                        fontSize: '15px', cursor: 'pointer',
                      }}
                    >
                      Salvar Regras
                    </motion.button>
                  )}
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
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStartGame}
          disabled={!canStart}
          style={{
            width: '100%', height: '68px', borderRadius: '16px',
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
  );
};
