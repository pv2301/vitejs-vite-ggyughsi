import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Share2, Download, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { GameSession, Player, Team } from '../types';
import { useGame } from '../context/GameContext';

interface PodiumProps {
  session: GameSession;
  onBackToHome: () => void;
}

export const Podium: React.FC<PodiumProps> = ({ session, onBackToHome }) => {
  const podiumRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { availableGames } = useGame();

  const gameConfig = availableGames.find(g => g.id === session.gameId);
  if (!gameConfig) return null;

  const isTeamMode = !!(session.teams?.length);

  // Ordenação genérica por totalScore
  const sortByScore = <T extends { totalScore: number }>(items: T[]): T[] =>
    [...items].sort((a, b) =>
      gameConfig.victoryCondition === 'lowest_score'
        ? a.totalScore - b.totalScore
        : b.totalScore - a.totalScore
    );

  const sortedPlayers: Player[] = isTeamMode ? [] : sortByScore(session.players);
  const sortedTeams: Team[] = isTeamMode ? sortByScore(session.teams ?? []) : [];

  const participants = isTeamMode ? sortedTeams : sortedPlayers;

  const handleShare = async () => {
    if (!podiumRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(podiumRef.current, { backgroundColor: '#0f172a', scale: 2 });
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'scoremaster-result.png', { type: 'image/png' });
          if (navigator.share && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: `Resultado - ${gameConfig.name}`, text: `Confira o resultado da partida de ${gameConfig.name}!` });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'scoremaster-result.png'; a.click();
            URL.revokeObjectURL(url);
          }
        }
        setIsSharing(false);
      });
    } catch {
      setIsSharing(false);
    }
  };

  const medalColors = [
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
  ];
  const barHeights = ['68%', '52%', '40%'];

  // Avatar/ícone genérico para times e jogadores
  const renderAvatar = (p: Player | Team, size: number, rank: number) => {
    if ('avatar' in p) {
      // Player
      return (
        <div style={{
          width: size, height: size, borderRadius: '50%', margin: '0 auto 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: rank === 0 ? '28px' : '22px',
          backgroundColor: (p as Player).color,
          boxShadow: rank === 0 ? `0 0 0 3px #f59e0b` : 'none',
        }}>
          {(p as Player).avatar}
        </div>
      );
    } else {
      // Team
      const team = p as Team;
      return (
        <div style={{
          width: size, height: size, borderRadius: '14px', margin: '0 auto 6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: rank === 0 ? '16px' : '13px', fontWeight: 900, color: 'white',
          backgroundColor: team.color,
          boxShadow: rank === 0 ? `0 0 0 3px #f59e0b` : 'none',
          padding: '4px',
        }}>
          {team.name.substring(0, 2).toUpperCase()}
        </div>
      );
    }
  };

  const getName = (p: Player | Team) => 'avatar' in p ? (p as Player).name : (p as Team).name;
  const getScore = (p: Player | Team) => p.totalScore;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(0px, env(safe-area-inset-top, 0px))',
      paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))',
    }}>

      {/* ── Conteúdo (capturável) ── */}
      <div ref={podiumRef} style={{ flex: 1, padding: '28px 20px 24px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px', paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}
        >
          <div style={{
            display: 'inline-flex', padding: '10px 16px', borderRadius: '999px', marginBottom: '12px',
            background: `${gameConfig.themeColor}22`, border: `2px solid ${gameConfig.themeColor}55`,
          }}>
            <Trophy style={{ width: '20px', height: '20px', color: gameConfig.themeColor }} />
          </div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Partida Finalizada
          </div>
          <div style={{ fontSize: '17px', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>
            {gameConfig.name}
          </div>
          <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
            {session.currentRound} {session.currentRound === 1 ? 'rodada' : 'rodadas'}
            {isTeamMode
              ? ` · ${sortedTeams.length} times`
              : ` · ${sortedPlayers.length} jogadores`}
          </div>
        </motion.div>

        {/* Pódio visual — top 3 */}
        {participants.length >= 2 && (
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: '8px', height: '240px', marginBottom: '28px',
          }}>
            {[
              { item: participants[1], rank: 1, barH: barHeights[1], medal: medalColors[1] },
              { item: participants[0], rank: 0, barH: barHeights[0], medal: medalColors[0] },
              ...(participants[2] ? [{ item: participants[2], rank: 2, barH: barHeights[2], medal: medalColors[2] }] : []),
            ].map(({ item, rank, barH, medal }) => (
              <motion.div
                key={getName(item)}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: rank === 0 ? 0.2 : rank === 1 ? 0.35 : 0.45, type: 'spring' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '110px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  {renderAvatar(item, rank === 0 ? 64 : 52, rank)}
                  <div style={{
                    fontSize: rank === 0 ? '15px' : '13px', fontWeight: 900, color: 'white',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px',
                  }}>
                    {getName(item)}
                  </div>
                  <div style={{ fontSize: rank === 0 ? '20px' : '16px', fontWeight: 900, color: gameConfig.themeColor, lineHeight: 1.2 }}>
                    {getScore(item)}
                  </div>
                </div>

                <div style={{
                  width: '100%', height: barH, borderRadius: '10px 10px 0 0',
                  background: medal,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: '10px',
                }}>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>
                    {rank + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Demais participantes (4º+) */}
        {participants.length > 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Classificação geral
            </div>
            {participants.slice(3).map((item, i) => (
              <motion.div
                key={getName(item)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '14px',
                  background: 'rgba(30,41,59,0.6)', border: '1.5px solid rgba(71,85,105,0.4)',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#475569', width: '28px', textAlign: 'center' }}>
                  #{i + 4}
                </span>
                {'avatar' in item ? (
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', backgroundColor: (item as Player).color,
                  }}>
                    {(item as Player).avatar}
                  </div>
                ) : (
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 900, color: 'white', backgroundColor: (item as Team).color,
                  }}>
                    {(item as Team).name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span style={{ flex: 1, fontSize: '17px', fontWeight: 800, color: 'white' }}>{getName(item)}</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: gameConfig.themeColor }}>
                  {getScore(item)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer fixo ── */}
      <div style={{
        padding: `16px 20px max(20px, env(safe-area-inset-bottom, 20px))`,
        display: 'flex', gap: '12px',
        background: 'linear-gradient(to top, #0f172a 60%, transparent)',
      }}>
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={onBackToHome}
          style={{
            flex: 1, height: '68px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            background: 'rgba(71,85,105,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '18px', fontWeight: 800, color: 'white',
          }}
        >
          <Home style={{ width: '22px', height: '22px' }} />
          Início
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          disabled={isSharing}
          style={{
            flex: 1, height: '68px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            background: gameConfig.themeColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '18px', fontWeight: 800, color: 'white',
            boxShadow: `0 8px 24px ${gameConfig.themeColor}55`,
            opacity: isSharing ? 0.7 : 1,
          }}
        >
          {isSharing ? (
            <><Download style={{ width: '22px', height: '22px' }} />Gerando...</>
          ) : (
            <><Share2 style={{ width: '22px', height: '22px' }} />Compartilhar</>
          )}
        </motion.button>
      </div>
    </div>
  );
};
