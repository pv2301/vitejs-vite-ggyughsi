import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Plus, X, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GAME_CONFIGS } from '../config/games';

interface TournamentsProps {
  onBack: () => void;
}

export const Tournaments: React.FC<TournamentsProps> = ({ onBack }) => {
  const { tournaments, createTournament } = useGame();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(GAME_CONFIGS[0].id);

  const handleCreateTournament = () => {
    if (!tournamentName.trim()) return;
    createTournament(tournamentName.trim(), selectedGameId);
    setTournamentName('');
    setShowCreateForm(false);
  };

  const selectedGame = GAME_CONFIGS.find(g => g.id === selectedGameId);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: 'max(24px, env(safe-area-inset-top, 24px)) 20px 20px',
        display: 'flex', alignItems: 'center', gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '22px', height: '22px', color: 'white' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Torneios
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            Gerencie competições de múltiplas partidas
          </div>
        </div>

        {/* Botão criar */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          style={{
            height: '44px', padding: '0 16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px', fontWeight: 800, color: 'white', flexShrink: 0,
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Novo
        </motion.button>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Formulário criar torneio */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                background: 'rgba(30,41,59,0.9)', borderRadius: '18px',
                border: '2px solid rgba(245,158,11,0.4)', padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>Novo Torneio</div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Nome do Torneio
                  </div>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTournament()}
                    placeholder="Ex: Campeonato de Skyjo 2025"
                    autoFocus
                    style={{
                      width: '100%', padding: '16px 18px', borderRadius: '14px',
                      background: '#0f172a', border: `2px solid ${tournamentName.trim() ? '#f59e0b' : 'rgba(71,85,105,0.6)'}`,
                      color: 'white', fontSize: '17px', fontWeight: 700, outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Jogo
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {GAME_CONFIGS.map(game => (
                      <button
                        key={game.id}
                        onClick={() => setSelectedGameId(game.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                          background: selectedGameId === game.id ? `${game.themeColor}22` : 'rgba(15,23,42,0.5)',
                          outline: selectedGameId === game.id ? `2px solid ${game.themeColor}` : '2px solid transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          backgroundColor: game.themeColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px', fontWeight: 900, color: 'white',
                        }}>
                          {game.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{game.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateTournament}
                  disabled={!tournamentName.trim()}
                  style={{
                    width: '100%', height: '60px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: tournamentName.trim() ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                    fontSize: '18px', fontWeight: 900, color: 'white',
                    opacity: tournamentName.trim() ? 1 : 0.4,
                    boxShadow: tournamentName.trim() ? '0 8px 24px rgba(245,158,11,0.35)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  Criar Torneio
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado vazio */}
        {tournaments.length === 0 && !showCreateForm && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: '80px', gap: '16px',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy style={{ width: '36px', height: '36px', color: '#78350f' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#475569', marginBottom: '6px' }}>
                Nenhum torneio criado
              </div>
              <div style={{ fontSize: '15px', color: '#334155' }}>
                Crie um torneio para rastrear múltiplas partidas
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: '#f59e0b', fontSize: '16px', fontWeight: 900, color: 'white',
                marginTop: '8px',
              }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              Criar Primeiro Torneio
            </motion.button>
          </div>
        )}

        {/* Lista de torneios */}
        <AnimatePresence>
          {tournaments.map((tournament, index) => {
            const gameConfig = GAME_CONFIGS.find(g => g.id === tournament.gameId);
            if (!gameConfig) return null;
            return (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: 'rgba(30,41,59,0.7)', borderRadius: '18px',
                  border: `2px solid ${gameConfig.themeColor}33`, overflow: 'hidden',
                }}
              >
                <div style={{ height: '4px', background: gameConfig.themeColor }} />
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                    backgroundColor: gameConfig.themeColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trophy style={{ width: '26px', height: '26px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
                      {tournament.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '3px', fontWeight: 600 }}>
                      {gameConfig.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy style={{ width: '13px', height: '13px', color: '#64748b' }} />
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                          {tournament.sessions.length} partidas
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users style={{ width: '13px', height: '13px', color: '#64748b' }} />
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                          {tournament.players.length} jogadores
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
