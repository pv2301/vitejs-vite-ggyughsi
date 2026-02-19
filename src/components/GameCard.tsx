import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { GameConfig } from '../types';

interface GameCardProps {
  game: GameConfig;
  onClick: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  cloud: Icons.Cloud,
  hexagon: Icons.Hexagon,
  circle: Icons.Circle,
  mountain: Icons.Mountain,
  dices: Icons.Dices,
};

// Texto de subtítulo descritivo para cada jogo
const subtitleMap: Record<string, string> = {
  skyjo: 'Descarte e fique com menos pontos',
  take6: 'Evite pegar fileiras de bois',
  uno: 'Descarte todas as suas cartas',
  catan: 'Construa e expanda seu império',
  generic: 'Pontuação personalizada',
};

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const MainIcon = iconMap[game.icon] || Icons.Dices;
  const subtitle = subtitleMap[game.id] || 'Jogue com seus amigos';

  const victoryText =
    game.victoryCondition === 'lowest_score'
      ? 'Menor pontuação vence'
      : 'Maior pontuação vence';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        width: '100%',
        height: '92px',           /* altura fixa → todos os cards iguais */
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '0 20px',
        borderRadius: '16px',
        border: `3px solid ${game.themeColor}`,
        background: `linear-gradient(135deg, ${game.themeColor}22 0%, ${game.themeColor}0d 100%)`,
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 4px 20px ${game.themeColor}33`,
        boxSizing: 'border-box',
      }}
    >
      {/* Brilho sutil no topo */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Ícone / Imagem — tamanho fixo */}
      <div style={{
        width: '60px', height: '60px', borderRadius: '14px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: game.themeColor,
        boxShadow: `0 4px 12px ${game.themeColor}55`,
        overflow: 'hidden',
      }}>
        {game.imageBase64 ? (
          <img
            src={game.imageBase64}
            alt={game.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <MainIcon style={{ width: '32px', height: '32px', color: 'white' }} strokeWidth={2} />
        )}
      </div>

      {/* Texto — bloco de largura fixa */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* Nome */}
        <div style={{
          fontSize: '19px', fontWeight: 900, color: 'white',
          letterSpacing: '-0.01em', lineHeight: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {game.name.toUpperCase()}
        </div>
        {/* Subtítulo */}
        <div style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px',
          fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {subtitle}
        </div>
        {/* Badges — linha única, não quebra */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'nowrap' }}>
          {game.winningScore && (
            <span style={{
              fontSize: '11px', fontWeight: 700, color: game.themeColor,
              background: `${game.themeColor}25`, padding: '2px 8px',
              borderRadius: '999px', border: `1px solid ${game.themeColor}55`,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Meta {game.winningScore}pts
            </span>
          )}
          <span style={{
            fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.07)', padding: '2px 8px',
            borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {victoryText}
          </span>
        </div>
      </div>

      {/* Seta */}
      <Icons.ChevronRight style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
    </motion.button>
  );
};
