import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, Plus, Users, Play, Link,
  CheckCircle, ChevronRight, Trash2, Flag,
} from 'lucide-react';
import { useGame } from '../context/GameContext';

interface TournamentsProps {
  onBack: () => void;
  onSelectGame: (gameId: string) => void;
}

type View = 'list' | 'detail' | 'create';

export const Tournaments: React.FC<TournamentsProps> = ({ onBack, onSelectGame }) => {
  const {
    tournaments, savedPlayers, gameHistory, availableGames,
    createTournament, linkSessionToTournament, finishTournament, deleteTournament,
  } = useGame();

  const [view, setView] = useState<View>('list');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // Criar torneio
  const [tournamentName, setTournamentName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(availableGames[0]?.id ?? '');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);
  const tournamentGameConfig = selectedTournament
    ? availableGames.find(g => g.id === selectedTournament.gameId)
    : null;

  // Partidas do histórico ainda não vinculadas ao torneio
  const linkableSessions = selectedTournament
    ? gameHistory.filter(s =>
        s.gameId === selectedTournament.gameId &&
        !selectedTournament.sessions.includes(s.id) &&
        s.status === 'finished'
      )
    : [];

  const handleCreate = () => {
    if (!tournamentName.trim() || selectedPlayerIds.length < 2) return;
    createTournament(tournamentName.trim(), selectedGameId, selectedPlayerIds);
    setTournamentName('');
    setSelectedPlayerIds([]);
    setView('list');
  };

  const handleOpenDetail = (id: string) => {
    setSelectedTournamentId(id);
    setView('detail');
  };

  const handleLinkSession = (sessionId: string) => {
    if (!selectedTournamentId) return;
    linkSessionToTournament(selectedTournamentId, sessionId);
  };

  const handleFinishTournament = () => {
    if (!selectedTournamentId) return;
    finishTournament(selectedTournamentId);
  };

  const handleDeleteTournament = () => {
    if (!selectedTournamentId) return;
    deleteTournament(selectedTournamentId);
    setView('list');
    setSelectedTournamentId(null);
  };

  const handleStartNewMatch = () => {
    if (!selectedTournament) return;
    onSelectGame(selectedTournament.gameId);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // ── Vista: Lista ──────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'max(24px, env(safe-area-inset-top, 24px)) 20px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button onClick={onBack} style={{ width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '22px', height: '22px', color: 'white' }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>Torneios</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Competições de múltiplas partidas</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setView('create')}
            style={{ height: '44px', padding: '0 16px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 800, color: 'white', flexShrink: 0 }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            Novo
          </motion.button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tournaments.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy style={{ width: '36px', height: '36px', color: '#78350f' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#475569', marginBottom: '6px' }}>Nenhum torneio criado</div>
                <div style={{ fontSize: '15px', color: '#334155' }}>Crie um torneio para acompanhar múltiplas partidas</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('create')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: '#f59e0b', fontSize: '16px', fontWeight: 900, color: 'white', marginTop: '8px' }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
                Criar Primeiro Torneio
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              {tournaments.map((tournament, i) => {
                const gc = availableGames.find(g => g.id === tournament.gameId);
                const color = gc?.themeColor ?? '#f59e0b';
                const leader = [...tournament.players].sort((a, b) =>
                  b.totalPoints !== a.totalPoints ? b.totalPoints - a.totalPoints : b.wins - a.wins
                )[0];
                const leaderName = leader ? savedPlayers.find(p => p.id === leader.playerId)?.name : null;
                return (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleOpenDetail(tournament.id)}
                    style={{ background: 'rgba(30,41,59,0.7)', borderRadius: '18px', border: `2px solid ${color}33`, overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <div style={{ height: '4px', background: color }} />
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy style={{ width: '26px', height: '26px', color: 'white' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                          <div style={{ fontSize: '18px', fontWeight: 900, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tournament.name}
                          </div>
                          {tournament.status === 'finished' && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(16,185,129,0.3)', flexShrink: 0 }}>
                              Concluído
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>{gc?.name ?? tournament.gameId}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{tournament.sessions.length} partidas</span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{tournament.players.length} jogadores</span>
                          {leaderName && <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 700 }}>🏆 {leaderName}</span>}
                        </div>
                      </div>
                      <ChevronRight style={{ width: '20px', height: '20px', color: '#475569', flexShrink: 0 }} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    );
  }

  // ── Vista: Criar ──────────────────────────────────────────────────────────
  if (view === 'create') {
    const canCreate = tournamentName.trim().length > 0 && selectedPlayerIds.length >= 2;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column', paddingBottom: 'max(100px, env(safe-area-inset-bottom, 100px))' }}>
        <div style={{ padding: 'max(24px, env(safe-area-inset-top, 24px)) 20px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button onClick={() => setView('list')} style={{ width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: '22px', height: '22px', color: 'white' }} />
          </button>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>Novo Torneio</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Configure nome, jogo e jogadores</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nome */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Nome do Torneio</p>
            <input
              autoFocus type="text" placeholder="Ex: Campeonato de Skyjo 2025"
              value={tournamentName} onChange={e => setTournamentName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canCreate) handleCreate(); }}
              style={{ width: '100%', padding: '16px 18px', borderRadius: '14px', background: '#1e293b', border: `2px solid ${tournamentName.trim() ? '#f59e0b' : '#334155'}`, color: 'white', fontSize: '17px', fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            />
          </div>

          {/* Jogo */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Jogo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: selectedGameId === game.id ? `${game.themeColor}22` : 'rgba(15,23,42,0.5)', outline: selectedGameId === game.id ? `2px solid ${game.themeColor}` : '2px solid transparent', transition: 'all 0.15s', textAlign: 'left' }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: game.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: 'white', flexShrink: 0 }}>
                    {game.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'white', flex: 1 }}>{game.name}</span>
                  {selectedGameId === game.id && <CheckCircle style={{ width: '18px', height: '18px', color: game.themeColor, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Jogadores */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Jogadores
              {selectedPlayerIds.length > 0 && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>({selectedPlayerIds.length} selecionado{selectedPlayerIds.length > 1 ? 's' : ''})</span>}
            </p>
            {savedPlayers.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>Nenhum jogador salvo. Adicione jogadores em uma partida primeiro.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedPlayers.map(player => {
                  const selected = selectedPlayerIds.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerIds(prev => selected ? prev.filter(id => id !== player.id) : [...prev, player.id])}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: selected ? 'rgba(245,158,11,0.12)' : 'rgba(15,23,42,0.5)', outline: selected ? '2px solid #f59e0b' : '2px solid transparent', transition: 'all 0.15s', textAlign: 'left' }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: player.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        {player.avatar}
                      </div>
                      <span style={{ flex: 1, fontSize: '16px', fontWeight: 700, color: 'white' }}>{player.name}</span>
                      {selected && <CheckCircle style={{ width: '20px', height: '20px', color: '#f59e0b', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: `16px 16px max(20px, env(safe-area-inset-bottom, 20px))`, background: 'linear-gradient(to top, #0f172a 60%, transparent)' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={!canCreate}
            style={{ width: '100%', height: '68px', borderRadius: '16px', border: 'none', background: canCreate ? '#f59e0b' : 'rgba(255,255,255,0.08)', color: 'white', fontSize: '20px', fontWeight: 900, cursor: canCreate ? 'pointer' : 'not-allowed', opacity: canCreate ? 1 : 0.4, boxShadow: canCreate ? '0 8px 24px rgba(245,158,11,0.35)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Trophy style={{ width: '24px', height: '24px' }} />
            CRIAR TORNEIO
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Vista: Detalhe ────────────────────────────────────────────────────────
  if (view === 'detail' && selectedTournament && tournamentGameConfig) {
    const color = tournamentGameConfig.themeColor;
    const isFinished = selectedTournament.status === 'finished';
    const standings = [...selectedTournament.players].sort((a, b) =>
      b.totalPoints !== a.totalPoints ? b.totalPoints - a.totalPoints : b.wins - a.wins
    );
    const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32'];

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column', paddingBottom: isFinished ? '24px' : 'max(100px, env(safe-area-inset-bottom, 100px))' }}>
        {/* Hero header */}
        <div style={{ background: `linear-gradient(135deg, ${color}cc 0%, ${color}66 100%)`, paddingTop: 'max(52px, env(safe-area-inset-top, 52px))', paddingBottom: '24px', paddingLeft: '20px', paddingRight: '20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <button onClick={() => setView('list')} style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
              <ArrowLeft style={{ width: '20px', height: '20px', color: 'white' }} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{selectedTournament.name}</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                {tournamentGameConfig.name} · {selectedTournament.sessions.length} partidas
                {isFinished && <span style={{ marginLeft: '8px', fontWeight: 700, color: '#34d399' }}>· Concluído</span>}
              </div>
            </div>
            <button onClick={handleDeleteTournament} style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.4)', cursor: 'pointer' }}>
              <Trash2 style={{ width: '18px', height: '18px', color: '#fca5a5' }} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Classificação */}
          <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '16px', border: '1.5px solid rgba(71,85,105,0.4)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy style={{ width: '18px', height: '18px', color: color }} />
              <span style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>Classificação</span>
            </div>
            {standings.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#475569', fontSize: '14px' }}>Nenhuma partida vinculada ainda</div>
            ) : standings.map((entry, i) => {
              const player = savedPlayers.find(p => p.id === entry.playerId);
              return (
                <div key={entry.playerId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderBottom: i < standings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i === 0 ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: rankColors[i] ?? '#475569', width: '24px', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                  {player ? (
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: player.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{player.avatar}</div>
                  ) : (
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users style={{ width: '18px', height: '18px', color: '#64748b' }} />
                    </div>
                  )}
                  <span style={{ flex: 1, fontSize: '16px', fontWeight: 800, color: 'white' }}>{player?.name ?? '?'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: color, lineHeight: 1 }}>{entry.totalPoints}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{entry.wins}V · {entry.gamesPlayed}P</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vincular partidas */}
          {!isFinished && linkableSessions.length > 0 && (
            <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '16px', border: '1.5px solid rgba(71,85,105,0.4)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
                <span style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>Vincular Partida do Histórico</span>
              </div>
              {linkableSessions.map((session, i) => {
                const sessionPlayers = session.players.slice().sort((a, b) =>
                  tournamentGameConfig.victoryCondition === 'lowest_score'
                    ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
                );
                const winner = sessionPlayers[0];
                return (
                  <div key={session.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderBottom: i < linkableSessions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{formatDate(session.startedAt)} · {session.players.length} jogadores</div>
                      {winner && <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>🏆 {winner.name} ({winner.totalScore} pts)</div>}
                    </div>
                    <button
                      onClick={() => handleLinkSession(session.id)}
                      style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: `${color}22`, color: color, fontSize: '13px', fontWeight: 700, flexShrink: 0 }}
                    >
                      Vincular
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Partidas vinculadas */}
          {selectedTournament.sessions.length > 0 && (
            <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '16px', border: '1.5px solid rgba(71,85,105,0.4)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '17px', fontWeight: 900, color: 'white' }}>Partidas ({selectedTournament.sessions.length})</span>
              </div>
              {selectedTournament.sessions.map((sessionId, i) => {
                const session = gameHistory.find(s => s.id === sessionId);
                if (!session) return null;
                const sessionPlayers = session.players.slice().sort((a, b) =>
                  tournamentGameConfig.victoryCondition === 'lowest_score'
                    ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
                );
                const winner = sessionPlayers[0];
                return (
                  <div key={sessionId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderBottom: i < selectedTournament.sessions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: color }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{formatDate(session.startedAt)}</div>
                      {winner && <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '1px' }}>🏆 {winner.name}</div>}
                    </div>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{session.currentRound - 1} rodadas</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isFinished && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: `12px 16px max(20px, env(safe-area-inset-bottom, 20px))`, background: 'linear-gradient(to top, #0f172a 60%, transparent)', display: 'flex', gap: '10px' }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleFinishTournament}
              style={{ height: '60px', padding: '0 20px', borderRadius: '16px', border: `2px solid ${color}55`, background: 'transparent', color: color, fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
            >
              <Flag style={{ width: '18px', height: '18px' }} />
              Encerrar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStartNewMatch}
              style={{ flex: 1, height: '60px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: color, color: 'white', fontSize: '17px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: `0 8px 24px ${color}55` }}
            >
              <Play style={{ width: '20px', height: '20px' }} fill="currentColor" />
              Nova Partida
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
