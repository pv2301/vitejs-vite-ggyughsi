import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Camera,
  Trophy, Star, Zap, Heart, Flame, Shield, Gem, Sword,
  Gamepad2, Dices, Crown, Target, Puzzle, Swords,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useGame } from '../context/GameContext';
import type { GameConfig, VictoryCondition, ScoringMode } from '../types';

interface GameEditorProps {
  onBack: () => void;
}

const THEME_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#84cc16', '#14b8a6',
];

const ICON_OPTIONS: { key: string; component: React.ElementType }[] = [
  { key: 'dices', component: Dices },
  { key: 'trophy', component: Trophy },
  { key: 'star', component: Star },
  { key: 'zap', component: Zap },
  { key: 'heart', component: Heart },
  { key: 'flame', component: Flame },
  { key: 'shield', component: Shield },
  { key: 'gem', component: Gem },
  { key: 'sword', component: Sword },
  { key: 'gamepad2', component: Gamepad2 },
  { key: 'crown', component: Crown },
  { key: 'target', component: Target },
  { key: 'puzzle', component: Puzzle },
  { key: 'swords', component: Swords },
];

const iconMap: Record<string, React.ElementType> = Object.fromEntries(
  ICON_OPTIONS.map(o => [o.key, o.component])
);

// Também inclui os ícones do games.ts para compatibilidade
const fullIconMap: Record<string, React.ElementType> = {
  ...iconMap,
  cloud: Icons.Cloud,
  hexagon: Icons.Hexagon,
  circle: Icons.Circle,
  mountain: Icons.Mountain,
};

export { fullIconMap as gameIconMap };

export const GameEditor: React.FC<GameEditorProps> = ({ onBack }) => {
  const { addCustomGame } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('dices');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [victoryCondition, setVictoryCondition] = useState<VictoryCondition>('highest_score');
  const [winningScore, setWinningScore] = useState('');
  const [allowNegative, setAllowNegative] = useState(true);
  const [roundBased, setRoundBased] = useState(true);
  const [scoringMode, setScoringMode] = useState<ScoringMode>('numeric');

  const canCreate = name.trim().length > 0;
  const PreviewIcon = fullIconMap[selectedIcon] || Dices;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageBase64(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!canCreate) return;
    const newGame: GameConfig = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      themeColor,
      victoryCondition,
      winningScore: winningScore ? parseInt(winningScore, 10) : undefined,
      allowNegative,
      roundBased,
      scoringMode,
      description: name.trim(),
      icon: selectedIcon,
      imageBase64: imageBase64 ?? undefined,
      isCustom: true,
    };
    addCustomGame(newGame);
    onBack();
  };

  const selectStyle = {
    width: '100%',
    background: '#1e293b',
    border: '1.5px solid #334155',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '15px',
    color: 'white',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
      paddingBottom: 'max(100px, env(safe-area-inset-bottom, 100px))',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 16px 12px' }}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onBack}
          style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
        </motion.button>
        <div>
          <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
            Novo Jogo
          </span>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
            Crie regras personalizadas
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

      {/* ── Conteúdo ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Preview do jogo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          background: `linear-gradient(135deg, ${themeColor}22, ${themeColor}0d)`,
          borderRadius: '20px', padding: '20px',
          border: `2px solid ${themeColor}55`,
        }}>
          {/* Ícone/imagem com botão de upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: themeColor,
              boxShadow: `0 4px 16px ${themeColor}55`,
              overflow: 'hidden',
            }}>
              {imageBase64 ? (
                <img src={imageBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <PreviewIcon style={{ width: '36px', height: '36px', color: 'white' }} strokeWidth={2} />
              )}
            </div>
            {/* Botão câmera */}
            <label style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              width: '24px', height: '24px', borderRadius: '50%',
              background: '#1e293b', border: `2px solid ${themeColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Camera style={{ width: '12px', height: '12px', color: themeColor }} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '20px', fontWeight: 900, color: name.trim() ? 'white' : '#475569', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name.trim() || 'Nome do Jogo'}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {victoryCondition === 'lowest_score' ? 'Menor pontuação vence' : victoryCondition === 'highest_score' ? 'Maior pontuação vence' : 'Atingir pontuação alvo'}
              {winningScore ? ` · Meta ${winningScore}pts` : ''}
            </p>
          </div>
        </div>

        {/* Nome */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Nome do Jogo</p>
          <input
            autoFocus
            type="text"
            placeholder="Ex: Truco, Buraco, Canastra..."
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%', background: '#1e293b', borderRadius: '14px',
              padding: '16px 18px', fontSize: '18px', color: 'white', fontWeight: 700,
              outline: 'none', boxSizing: 'border-box',
              border: `2px solid ${name.trim() ? themeColor : '#334155'}`,
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* Cor do tema */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Cor do Tema</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {THEME_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setThemeColor(color)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: color, border: 'none', cursor: 'pointer',
                  outline: themeColor === color ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '3px',
                  transform: themeColor === color ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Ícone */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Ícone</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ICON_OPTIONS.map(({ key, component: Ic }) => (
              <button
                key={key}
                onClick={() => { setSelectedIcon(key); setImageBase64(null); }}
                style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                  backgroundColor: selectedIcon === key && !imageBase64 ? themeColor : '#1e293b',
                  outline: selectedIcon === key && !imageBase64 ? `3px solid ${themeColor}` : '3px solid transparent',
                  outlineOffset: '2px',
                  transform: selectedIcon === key && !imageBase64 ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              >
                <Ic style={{ width: '22px', height: '22px', color: selectedIcon === key && !imageBase64 ? 'white' : '#64748b' }} />
              </button>
            ))}
          </div>
          {imageBase64 && (
            <button
              onClick={() => setImageBase64(null)}
              style={{
                marginTop: '10px', fontSize: '13px', color: '#f87171',
                background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Remover imagem e usar ícone
            </button>
          )}
        </div>

        {/* Regras */}
        <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #1e293b' }}>
            <p style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>Regras do Jogo</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Vitória */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Vitória</span>
              <select
                value={victoryCondition}
                onChange={e => setVictoryCondition(e.target.value as VictoryCondition)}
                style={{ ...selectStyle, width: 'auto', padding: '8px 12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px' }}
              >
                <option value="highest_score">Maior pontuação vence</option>
                <option value="lowest_score">Menor pontuação vence</option>
                <option value="target_score">Atingir pontuação alvo</option>
              </select>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Meta (pts)</span>
              <input
                type="number"
                placeholder="Sem meta"
                value={winningScore}
                onChange={e => setWinningScore(e.target.value)}
                style={{
                  width: '120px', background: '#0f172a', border: '1.5px solid #334155',
                  borderRadius: '10px', padding: '8px 12px', fontSize: '14px',
                  color: 'white', fontWeight: 700, outline: 'none', textAlign: 'right',
                }}
              />
            </div>

            {/* Score negativo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Score negativo</span>
              <button
                onClick={() => setAllowNegative(v => !v)}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: allowNegative ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                  color: allowNegative ? '#34d399' : '#f87171',
                  fontSize: '13px', fontWeight: 700,
                }}
              >
                {allowNegative ? 'Permitido' : 'Não permitido'}
              </button>
            </div>

            {/* Sistema */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Sistema</span>
              <select
                value={roundBased ? 'rounds' : 'continuous'}
                onChange={e => setRoundBased(e.target.value === 'rounds')}
                style={{ ...selectStyle, width: 'auto', padding: '8px 12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px' }}
              >
                <option value="rounds">Por rodadas</option>
                <option value="continuous">Pontuação contínua</option>
              </select>
            </div>

            {/* Modo de pontuação */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>Pontuação</span>
              <select
                value={scoringMode}
                onChange={e => setScoringMode(e.target.value as ScoringMode)}
                style={{ ...selectStyle, width: 'auto', padding: '8px 12px', fontSize: '14px', fontWeight: 700, color: 'white', background: '#0f172a', border: '1.5px solid #334155', borderRadius: '10px' }}
              >
                <option value="numeric">Numérica por rodada</option>
                <option value="winner_takes_all">Vencedor da rodada (+1)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer fixo ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: `16px 16px max(20px, env(safe-area-inset-bottom, 20px))`,
        background: 'linear-gradient(to top, #0f172a 60%, rgba(15,23,42,0) 100%)',
      }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCreate}
          disabled={!canCreate}
          style={{
            width: '100%', height: '68px', borderRadius: '16px', border: 'none',
            background: canCreate ? themeColor : 'rgba(255,255,255,0.08)',
            color: 'white', fontSize: '20px', fontWeight: 900, cursor: canCreate ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            opacity: canCreate ? 1 : 0.4,
            boxShadow: canCreate ? `0 8px 24px ${themeColor}55` : 'none',
            transition: 'background 0.2s, box-shadow 0.2s, opacity 0.2s',
          }}
        >
          <Check style={{ width: '24px', height: '24px' }} />
          CRIAR JOGO
        </motion.button>
      </div>
    </div>
  );
};
