import React from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingDown, Plus } from 'lucide-react';
import type { Player } from '../types';

interface PlayerRowProps {
  player: Player;
  isLeader: boolean;
  isLast: boolean;
  onScoreSubmit?: (score: number) => void;
  onWinnerSelect?: () => void;   // modo winner_takes_all
  mode?: 'numeric' | 'winner';
  showInput?: boolean;
  themeColor: string;
}

export const PlayerRow: React.FC<PlayerRowProps> = ({
  player,
  isLeader,
  isLast,
  onScoreSubmit,
  onWinnerSelect,
  mode = 'numeric',
  showInput = true,
  themeColor,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = () => {
    const score = parseFloat(inputValue);
    if (!isNaN(score) && onScoreSubmit) {
      onScoreSubmit(score);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
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
      {/* ── Player info row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: (showInput && mode === 'numeric') ? '14px' : '0' }}>

        {/* Avatar */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: 700,
          backgroundColor: player.color,
          boxShadow: isLeader ? `0 0 0 3px #eab308` : `0 0 0 2px ${player.color}66`,
        }}>
          {player.avatar}
        </div>

        {/* Text block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Position + name + icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
              #{player.position}
            </span>
            <span style={{
              fontSize: '20px', fontWeight: 900, color: 'white',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>
              {player.name}
            </span>
            {isLeader && (
              <Crown style={{ width: '20px', height: '20px', color: '#facc15', flexShrink: 0 }} fill="currentColor" />
            )}
            {isLast && (
              <TrendingDown style={{ width: '20px', height: '20px', color: '#f87171', flexShrink: 0 }} />
            )}
          </div>

          {/* Score + rounds */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: themeColor, lineHeight: 1 }}>
              {player.totalScore}
            </span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>pts</span>
            <span style={{ fontSize: '14px', color: '#334155' }}>•</span>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
              {player.roundScores.length} {player.roundScores.length === 1 ? 'rodada' : 'rodadas'}
            </span>
          </div>
        </div>

        {/* Botão +1 no modo winner */}
        {mode === 'winner' && showInput && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onWinnerSelect}
            style={{
              flexShrink: 0,
              width: '64px', height: '64px',
              borderRadius: '16px', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
              color: 'white', fontSize: '28px', fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${themeColor}55`,
            }}
          >
            <Plus style={{ width: '28px', height: '28px' }} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      {/* ── Score input (modo numeric) ── */}
      {mode === 'numeric' && showInput && (
        <div style={{ display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pontos da rodada"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '14px 14px',
              background: 'rgba(15,23,42,0.7)',
              color: 'white',
              fontSize: '17px',
              fontWeight: 700,
              borderRadius: '14px',
              border: inputValue ? `2px solid ${themeColor}` : '2px solid rgba(71,85,105,0.6)',
              outline: 'none',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue}
            style={{
              width: '56px',
              flexShrink: 0,
              borderRadius: '14px',
              border: 'none',
              cursor: inputValue ? 'pointer' : 'not-allowed',
              backgroundColor: inputValue ? themeColor : 'rgba(71,85,105,0.4)',
              color: 'white',
              fontSize: '26px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: inputValue ? 1 : 0.5,
              transition: 'background-color 0.15s, opacity 0.15s',
              boxShadow: inputValue ? `0 4px 14px ${themeColor}55` : 'none',
            }}
          >
            +
          </button>
        </div>
      )}

      {/* ── Round history chips ── */}
      {player.roundScores.length > 0 && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {player.roundScores.map((score, index) => (
            <span
              key={index}
              style={{
                padding: '4px 10px',
                background: 'rgba(71,85,105,0.4)',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                color: score > 0 ? '#94a3b8' : score < 0 ? '#f87171' : '#64748b',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: '1px solid rgba(71,85,105,0.3)',
              }}
            >
              R{index + 1}: {score > 0 ? '+' : ''}{score}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};
