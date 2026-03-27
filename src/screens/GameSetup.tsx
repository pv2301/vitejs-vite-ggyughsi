import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, ChevronDown, ChevronUp, Camera, Trash2, Users, Plus, X, Check, Zap, Timer } from 'lucide-react';
import { gameIconMap } from './GameEditor';
import * as Icons from 'lucide-react';
import { PlayerSelector } from '../components/PlayerSelector';
import { PickerSheet } from '../components/PickerSheet';
import { useGame } from '../context/GameContext';
import { useTranslation } from '../i18n/useTranslation';
import type { Player, Team, VictoryCondition, ScoringMode } from '../types';

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

const TEAM_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const GameSetup: React.FC<GameSetupProps> = ({ gameId, onBack, onStartGame }) => {
  const { savedPlayers, addSavedPlayer, startNewSession, availableGames, updateGameOverride, updateGameImage, deleteCustomGame } = useGame();
  const t = useTranslation();
  const [selectedPlayers, setSelectedPlayers] = useState<Omit<Player, 'totalScore' | 'roundScores' | 'position'>[]>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modo Times
  const [teamMode, setTeamMode] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string; color: string; memberIds: string[] }[]>([]);
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState(TEAM_COLORS[0]);
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([]);

  // Estado local para edição de regras
  const gameConfig = availableGames.find(g => g.id === gameId);
  const [editVictory, setEditVictory] = useState<VictoryCondition>(gameConfig?.victoryCondition ?? 'highest_score');
  const [editMeta, setEditMeta] = useState(gameConfig?.winningScore?.toString() ?? '');
  const [editAllowNegative, setEditAllowNegative] = useState(gameConfig?.allowNegative ?? true);
  const [editScoringMode, setEditScoringMode] = useState<ScoringMode>(gameConfig?.scoringMode ?? 'numeric');
  const [rulesDirty, setRulesDirty] = useState(false);

  // Timer (todos os jogos)
  const [timerEnabled, setTimerEnabled] = useState(gameConfig?.timerEnabled ?? false);

  // Duelo-specific settings
  const [duelPointsPerTap, setDuelPointsPerTap] = useState(gameConfig?.duelPointsPerTap ?? 1);
  const [duelTimerEnabled, setDuelTimerEnabled] = useState(gameConfig?.duelTimerEnabled ?? false);

  if (!gameConfig) return null;

  const isCustom = gameConfig.isCustom ?? false;
  const isGeneric = gameId === 'generic';
  const isDuelo = gameId === 'duelo';
  const canEditAllRules = isCustom || isGeneric;
  const MainIcon = iconMap[gameConfig.icon] || Icons.Dices;

  // Validação de início
  const canStart = isDuelo
    ? (teamMode ? teams.length === 2 && teams.every(t => t.memberIds.length >= 1) : selectedPlayers.length === 2)
    : (teamMode ? teams.length >= 2 && teams.every(t => t.memberIds.length >= 1) : selectedPlayers.length >= 2);

  // Todos savedPlayers que já estão em algum time (exceto no time sendo criado)
  const usedPlayerIds = teams.flatMap(t => t.memberIds);

  const victoryLabel = (v: VictoryCondition) =>
    v === 'lowest_score' ? t.gameSetup.lowest
    : v === 'highest_score' ? t.gameSetup.highest
    : t.gameSetup.target;

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
      scoringMode: editScoringMode,
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

  const handleAddTeam = () => {
    if (!newTeamName.trim() || newTeamMembers.length === 0) return;
    const memberNames = newTeamMembers.map(id => savedPlayers.find(p => p.id === id)?.name ?? '');
    setTeams(prev => [...prev, {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      color: newTeamColor,
      memberIds: newTeamMembers,
    }]);
    setNewTeamName('');
    setNewTeamColor(TEAM_COLORS[teams.length + 1 < TEAM_COLORS.length ? teams.length + 1 : 0]);
    setNewTeamMembers([]);
    setAddingTeam(false);
    void memberNames; // usado apenas para playerNames abaixo
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const handleQuickStart = () => {
    updateGameOverride('duelo', { duelPointsPerTap, duelTimerEnabled });
    const players: Player[] = [
      { id: 'quick_p1', name: t.gameSetup.player1, color: '#ef4444', avatar: '🔴', totalScore: 0, roundScores: [] },
      { id: 'quick_p2', name: t.gameSetup.player2, color: '#3b82f6', avatar: '🔵', totalScore: 0, roundScores: [] },
    ];
    startNewSession('duelo', players);
    onStartGame();
  };

  const handleStartGame = () => {
    if (!canStart) return;
    if (isDuelo) {
      updateGameOverride('duelo', { duelPointsPerTap, duelTimerEnabled });
    } else {
      updateGameOverride(gameId, { timerEnabled });
    }
    saveRules();

    if (teamMode) {
      // Modo times: players = todos os membros de todos os times (sem duplicatas)
      const allMemberIds = [...new Set(teams.flatMap(t => t.memberIds))];
      const players: Player[] = allMemberIds.map(id => {
        const sp = savedPlayers.find(p => p.id === id);
        return sp
          ? { ...sp, totalScore: 0, roundScores: [] }
          : { id, name: '?', color: '#64748b', avatar: '?', totalScore: 0, roundScores: [] };
      });

      const sessionTeams: Team[] = teams.map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        playerIds: t.memberIds,
        playerNames: t.memberIds.map(id => savedPlayers.find(p => p.id === id)?.name ?? ''),
        totalScore: 0,
        roundScores: [],
        position: 1,
      }));

      startNewSession(gameId, players, sessionTeams);
    } else {
      const players: Player[] = selectedPlayers.map(p => ({ ...p, totalScore: 0, roundScores: [] }));
      startNewSession(gameId, players);
    }

    onStartGame();
  };

  const handleDeleteGame = () => {
    deleteCustomGame(gameId);
    onBack();
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
        <div style={{ position: 'absolute', right: '-32px', bottom: '-16px', opacity: 0.15, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
          <MainIcon size={160} color="white" />
        </div>

        <button onClick={onBack} style={{
          position: 'absolute', left: '20px', top: 'max(12px, env(safe-area-inset-top, 12px))',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
        }}>
          <ArrowLeft style={{ width: '24px', height: '24px', color: 'white' }} />
        </button>

        {isCustom && (
          <button onClick={handleDeleteGame} style={{
            position: 'absolute', right: '20px', top: 'max(12px, env(safe-area-inset-top, 12px))',
            width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(239,68,68,0.25)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer',
          }}>
            <Trash2 style={{ width: '20px', height: '20px', color: '#fca5a5' }} />
          </button>
        )}

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
          {t.gameSetup.configureMatch}
        </div>
      </div>

      {/* ── ZONA 2: Corpo scrollável ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 160px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Início Rápido (Duelo) ── */}
        {isDuelo && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleQuickStart}
            style={{
              width: '100%', padding: '18px', borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${gameConfig.themeColor} 0%, ${gameConfig.themeColor}bb 100%)`,
              color: 'white', fontSize: '18px', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: `0 4px 24px ${gameConfig.themeColor}55`,
            }}
          >
            <Zap style={{ width: '22px', height: '22px' }} />
            {t.gameSetup.quickStart}
          </motion.button>
        )}

        {/* ── Configurações do Duelo ── */}
        {isDuelo && (
          <div style={{ borderRadius: '16px', border: `2px solid ${gameConfig.themeColor}55`, background: `${gameConfig.themeColor}18`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap style={{ width: '20px', height: '20px', color: gameConfig.themeColor }} />
              <span style={{ fontWeight: 900, color: 'white', fontSize: '20px', letterSpacing: '-0.01em' }}>{t.gameSetup.duelSettings}</span>
            </div>

            {/* Pontos por toque */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px' }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, marginBottom: '10px' }}>{t.gameSetup.pointsPerTap}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setDuelPointsPerTap(n)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: duelPointsPerTap === n ? gameConfig.themeColor : 'rgba(255,255,255,0.07)',
                      color: duelPointsPerTap === n ? 'white' : '#94a3b8',
                      fontSize: '16px', fontWeight: 900,
                      transition: 'all 0.15s',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Timer style={{ width: '18px', height: '18px', color: duelTimerEnabled ? gameConfig.themeColor : '#64748b' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{t.gameSetup.timer}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t.gameSetup.timerSub}</div>
                </div>
              </div>
              <button
                onClick={() => setDuelTimerEnabled(v => !v)}
                style={{
                  width: '52px', height: '28px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  background: duelTimerEnabled ? gameConfig.themeColor : '#334155',
                  position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '4px',
                  left: duelTimerEnabled ? '28px' : '4px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>
        )}

        {/* Cronômetro (todos os jogos exceto Duelo) */}
        {!isDuelo && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderRadius: '16px', border: '1.5px solid rgba(255,255,255,0.08)',
            background: 'rgba(30,41,59,0.6)', padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Timer style={{ width: '18px', height: '18px', color: timerEnabled ? gameConfig.themeColor : '#64748b' }} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{t.gameSetup.timer}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{t.gameSetup.timerSub}</div>
              </div>
            </div>
            <button
              onClick={() => setTimerEnabled((v: boolean) => !v)}
              style={{
                width: '52px', height: '28px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: timerEnabled ? gameConfig.themeColor : '#334155',
                position: 'relative', flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: '4px',
                left: timerEnabled ? '28px' : '4px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
              }} />
            </button>
          </div>
        )}

        {/* Regras colapsáveis (não mostrado no Duelo) */}
        {!isDuelo && <div style={{ borderRadius: '16px', overflow: 'hidden', border: `2px solid ${gameConfig.themeColor}55`, background: `${gameConfig.themeColor}18` }}>
          <button
            onClick={handleRulesToggle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 900, color: 'white', fontSize: '20px', letterSpacing: '-0.01em' }}>
              {t.gameSetup.rules}
              {rulesDirty && <span style={{ fontSize: '12px', color: gameConfig.themeColor, fontWeight: 700, marginLeft: '8px' }}>●</span>}
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
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>{t.gameSetup.victoryCondition}</span>
                      <div style={{ width: '160px' }}>
                        <PickerSheet
                          value={editVictory}
                          options={[
                            { value: 'highest_score', label: t.gameSetup.highest },
                            { value: 'lowest_score', label: t.gameSetup.lowest },
                            { value: 'target_score', label: t.gameSetup.target },
                          ]}
                          onChange={(val) => { setEditVictory(val as VictoryCondition); setRulesDirty(true); }}
                          themeColor={gameConfig.themeColor}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>{t.gameSetup.victoryCondition}</span>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{victoryLabel(editVictory)}</span>
                    </div>
                  )}

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: '#94a3b8', fontSize: '15px' }}>{t.gameSetup.targetScore}</span>
                    <input
                      type="number" placeholder={t.gameSetup.targetScorePlaceholder} value={editMeta}
                      onChange={e => { setEditMeta(e.target.value); setRulesDirty(true); }}
                      style={{ width: '110px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px', padding: '7px 12px', fontSize: '14px', color: 'white', fontWeight: 700, outline: 'none', textAlign: 'right' }}
                    />
                  </div>

                  {/* Score negativo */}
                  {canEditAllRules ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>{t.gameSetup.allowNegative}</span>
                      <button onClick={() => { setEditAllowNegative(v => !v); setRulesDirty(true); }} style={{ padding: '7px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: editAllowNegative ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: editAllowNegative ? '#34d399' : '#f87171', fontSize: '13px', fontWeight: 700 }}>
                        {editAllowNegative ? t.gameSetup.allowed : t.gameSetup.notAllowed}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ color: '#94a3b8', fontSize: '15px' }}>{t.gameSetup.allowNegative}</span>
                      <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{editAllowNegative ? 'Permitido' : 'Não permitido'}</span>
                    </div>
                  )}

                  {/* Pontuação — editável para todos os jogos */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '0' }}>
                    <span style={{ color: '#94a3b8', fontSize: '15px' }}>{t.gameSetup.scoring}</span>
                    <div style={{ width: '160px' }}>
                      <PickerSheet
                        value={editScoringMode}
                        options={[
                          { value: 'numeric', label: t.gameSetup.modeNumericRound },
                          { value: 'winner_takes_all', label: t.gameSetup.modeWinner },
                        ]}
                        onChange={(val) => { setEditScoringMode(val as ScoringMode); setRulesDirty(true); }}
                        themeColor={gameConfig.themeColor}
                      />
                    </div>
                  </div>

                  {rulesDirty && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }}
                      onClick={saveRules}
                      style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', border: 'none', background: gameConfig.themeColor, color: 'white', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}
                    >
                      {t.gameSetup.saveRules}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>}

        {/* Toggle Modo Times */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(30,41,59,0.8)', borderRadius: '16px',
          border: `2px solid ${teamMode ? gameConfig.themeColor + '88' : 'rgba(71,85,105,0.6)'}`,
          padding: '18px 20px',
          transition: 'border-color 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users style={{ width: '22px', height: '22px', color: teamMode ? gameConfig.themeColor : '#64748b' }} />
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'white' }}>{t.gameSetup.teamMode}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{t.gameSetup.teamModeSubtitle}</div>
            </div>
          </div>
          <button
            onClick={() => { setTeamMode(v => !v); setTeams([]); setAddingTeam(false); }}
            style={{
              width: '52px', height: '28px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              background: teamMode ? gameConfig.themeColor : '#334155',
              position: 'relative', flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: '4px',
              left: teamMode ? '28px' : '4px',
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {/* Modo Jogadores individuais */}
        {!teamMode && (
          <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '16px', border: '2px solid rgba(71,85,105,0.6)', padding: '20px' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em', marginBottom: '16px' }}>
              {t.common.players.charAt(0).toUpperCase() + t.common.players.slice(1)}
            </div>
            <PlayerSelector
              selectedPlayers={selectedPlayers}
              savedPlayers={savedPlayers}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              themeColor={gameConfig.themeColor}
              maxPlayers={isDuelo ? 2 : undefined}
            />
          </div>
        )}

        {/* Modo Times */}
        {teamMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Times criados */}
            <AnimatePresence>
              {teams.map((team, idx) => {
                const memberNames = team.memberIds.map(id => savedPlayers.find(p => p.id === id)?.name ?? '?');
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: 'rgba(30,41,59,0.8)', borderRadius: '16px',
                      border: `2px solid ${team.color}55`, padding: '16px 18px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                      background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', fontWeight: 900, color: 'white',
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '17px', fontWeight: 900, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {team.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {memberNames.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTeam(team.id)}
                      style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                    >
                      <X style={{ width: '18px', height: '18px', color: '#f87171' }} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Formulário de novo time */}
            <AnimatePresence>
              {addingTeam && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  style={{ background: '#0f172a', borderRadius: '20px', border: '1.5px solid #334155', overflow: 'hidden' }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ fontWeight: 900, color: 'white', fontSize: '17px' }}>{t.gameSetup.newTeam}</span>
                    <button onClick={() => setAddingTeam(false)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                      <X style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
                    </button>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Nome do time */}
                    <input
                      autoFocus type="text" placeholder={t.gameSetup.teamName} value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newTeamName.trim() && newTeamMembers.length > 0) handleAddTeam(); }}
                      style={{ width: '100%', background: '#1e293b', borderRadius: '12px', padding: '14px 16px', fontSize: '17px', color: 'white', fontWeight: 700, outline: 'none', boxSizing: 'border-box', border: `2px solid ${newTeamName.trim() ? newTeamColor : '#334155'}`, transition: 'border-color 0.2s' }}
                    />

                    {/* Cor do time */}
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{t.gameSetup.color}</p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {TEAM_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setNewTeamColor(color)}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: color, border: 'none', cursor: 'pointer', outline: newTeamColor === color ? '3px solid white' : '3px solid transparent', outlineOffset: '3px', transform: newTeamColor === color ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s' }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Membros */}
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
                        {t.gameSetup.members} {newTeamMembers.length > 0 && <span style={{ color: newTeamColor }}>{t.gameSetup.selectedCount(newTeamMembers.length)}</span>}
                      </p>
                      {savedPlayers.length === 0 ? (
                        <p style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>
                          {t.gameSetup.noSavedPlayers}
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {savedPlayers.filter(p => !usedPlayerIds.includes(p.id) || newTeamMembers.includes(p.id)).map(player => {
                            const selected = newTeamMembers.includes(player.id);
                            return (
                              <button
                                key={player.id}
                                onClick={() => setNewTeamMembers(prev => selected ? prev.filter(id => id !== player.id) : [...prev, player.id])}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  padding: '10px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                  background: selected ? `${newTeamColor}22` : '#1e293b',
                                  outline: selected ? `2px solid ${newTeamColor}` : '2px solid transparent',
                                  transition: 'all 0.15s', textAlign: 'left',
                                }}
                              >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: player.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                  {player.avatar}
                                </div>
                                <span style={{ flex: 1, fontSize: '15px', fontWeight: 700, color: 'white' }}>{player.name}</span>
                                {selected && <Check style={{ width: '18px', height: '18px', color: newTeamColor, flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAddTeam}
                      disabled={!newTeamName.trim() || newTeamMembers.length === 0}
                      style={{
                        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                        background: newTeamName.trim() && newTeamMembers.length > 0 ? newTeamColor : 'rgba(255,255,255,0.08)',
                        color: 'white', fontWeight: 800, fontSize: '16px', cursor: newTeamName.trim() && newTeamMembers.length > 0 ? 'pointer' : 'not-allowed',
                        opacity: newTeamName.trim() && newTeamMembers.length > 0 ? 1 : 0.4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      }}
                    >
                      <Check style={{ width: '20px', height: '20px' }} />
                      {t.gameSetup.addTeam}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão adicionar time */}
            {!addingTeam && !(isDuelo && teams.length >= 2) && (
              <button
                onClick={() => setAddingTeam(true)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', padding: '20px', borderRadius: '16px',
                  border: '2px dashed #475569', color: '#94a3b8',
                  fontWeight: 700, fontSize: '17px', background: 'transparent', cursor: 'pointer',
                }}
              >
                <Plus style={{ width: '22px', height: '22px' }} />
                Adicionar Time
              </button>
            )}
          </div>
        )}
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
              {isDuelo
                ? (teamMode ? t.gameSetup.exactTwoTeams : t.gameSetup.exactTwo)
                : (teamMode ? t.gameSetup.minTeams : t.gameSetup.minPlayers)}
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
          {isDuelo
            ? <Zap style={{ width: '26px', height: '26px' }} fill="currentColor" />
            : <Play style={{ width: '26px', height: '26px' }} fill="currentColor" />}
          {isDuelo ? t.gameSetup.startDuelo : t.gameSetup.startGame}
        </motion.button>
      </div>
    </div>
  );
};
