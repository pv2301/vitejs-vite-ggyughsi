import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, UserPlus, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface PlayerManagerProps {
  onBack: () => void;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const AVATARS = ['🎲', '🎮', '👾', '🎯', '🎨', '🎪', '🎭', '🦁'];

type Mode =
  | { type: 'list' }
  | { type: 'add' }
  | { type: 'edit'; id: string; name: string; color: string; avatar: string };

export const PlayerManager: React.FC<PlayerManagerProps> = ({ onBack }) => {
  const { savedPlayers, addSavedPlayer, renameSavedPlayer, removeSavedPlayer } = useGame();
  const [mode, setMode] = useState<Mode>({ type: 'list' });

  // Form state (add)
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addSavedPlayer({
      id: Date.now().toString(),
      name: newName.trim(),
      color: newColor,
      avatar: newAvatar,
    });
    setNewName('');
    setNewColor(COLORS[0]);
    setNewAvatar(AVATARS[0]);
    setMode({ type: 'list' });
  };

  const handleSaveEdit = () => {
    if (mode.type !== 'edit' || !mode.name.trim()) return;
    renameSavedPlayer(mode.id, mode.name.trim());
    setMode({ type: 'list' });
  };

  const handleDelete = (id: string) => {
    removeSavedPlayer(id);
  };

  // ── Form Panel (Add / Edit) ──────────────────────────────────────────────
  const renderForm = () => {
    const isAdd = mode.type === 'add';
    const name = isAdd ? newName : (mode as any).name;
    const color = isAdd ? newColor : (mode as any).color;
    const avatar = isAdd ? newAvatar : (mode as any).avatar;

    const setName = (v: string) => {
      if (isAdd) setNewName(v);
      else setMode(m => m.type === 'edit' ? { ...m, name: v } : m);
    };
    const setColor = (v: string) => {
      if (isAdd) setNewColor(v);
      else setMode(m => m.type === 'edit' ? { ...m, color: v } : m);
    };
    const setAvatar = (v: string) => {
      if (isAdd) setNewAvatar(v);
      else setMode(m => m.type === 'edit' ? { ...m, avatar: v } : m);
    };
    const handleConfirm = isAdd ? handleAdd : handleSaveEdit;
    const canConfirm = name.trim().length > 0;

    return (
      <motion.div
        key="form"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Preview header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          background: 'rgba(30,41,59,0.6)', borderRadius: '20px', padding: '16px 20px',
          border: '1px solid #334155',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
            backgroundColor: `${color}33`, border: `3px solid ${color}`, transition: 'all 0.2s',
          }}>
            {avatar}
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              {isAdd ? 'Novo Jogador' : 'Editando'}
            </p>
            <p style={{ fontSize: '18px', fontWeight: 900, color: name.trim() ? 'white' : '#475569' }}>
              {name.trim() || 'Nome do jogador'}
            </p>
          </div>
        </div>

        {/* Nome */}
        <input
          autoFocus
          type="text"
          placeholder="Nome do Jogador"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') setMode({ type: 'list' }); }}
          style={{
            width: '100%', background: '#1e293b', borderRadius: '16px',
            padding: '18px 20px', fontSize: '20px', color: 'white', fontWeight: 700,
            outline: 'none', boxSizing: 'border-box',
            border: `2px solid ${name.trim() ? color : '#334155'}`,
            transition: 'border-color 0.2s',
          }}
        />

        {/* Avatar */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Avatar
          </p>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                style={{
                  width: '52px', height: '52px', borderRadius: '14px', fontSize: '26px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                  backgroundColor: avatar === a ? `${color}44` : '#1e293b',
                  outline: avatar === a ? `3px solid ${color}` : '3px solid transparent',
                  outlineOffset: '2px',
                  transform: avatar === a ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Cor */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Cor
          </p>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: c, border: 'none', cursor: 'pointer',
                  outline: color === c ? '3px solid white' : '3px solid transparent',
                  outlineOffset: '3px',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setMode({ type: 'list' })}
            style={{
              flex: 1, padding: '18px', borderRadius: '16px', border: '1.5px solid #334155',
              background: 'transparent', color: '#94a3b8', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              flex: 2, padding: '18px', borderRadius: '16px', border: 'none',
              backgroundColor: canConfirm ? color : '#334155',
              color: 'white', fontSize: '18px', fontWeight: 900, cursor: canConfirm ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              opacity: canConfirm ? 1 : 0.5, transition: 'background-color 0.2s, opacity 0.2s',
            }}
          >
            <Check style={{ width: '20px', height: '20px' }} />
            {isAdd ? 'ADICIONAR' : 'SALVAR'}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // ── List ─────────────────────────────────────────────────────────────────
  const renderList = () => (
    <motion.div
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
    >
      {savedPlayers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'rgba(30,41,59,0.4)', borderRadius: '20px', border: '1px dashed #334155',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
            Nenhum jogador cadastrado
          </p>
          <p style={{ fontSize: '14px', color: '#475569' }}>
            Adicione jogadores para reutilizá-los em partidas futuras
          </p>
        </div>
      ) : (
        savedPlayers.map(player => (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(15,23,42,0.6)', borderRadius: '16px',
              border: '1px solid #334155', padding: '12px 14px',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', backgroundColor: `${player.color}33`,
              border: `2.5px solid ${player.color}`,
            }}>
              {player.avatar}
            </div>

            {/* Nome */}
            <span style={{
              flex: 1, fontSize: '17px', fontWeight: 700, color: 'white',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {player.name}
            </span>

            {/* Editar */}
            <button
              onClick={() => setMode({ type: 'edit', id: player.id, name: player.name, color: player.color, avatar: player.avatar })}
              style={{
                width: '40px', height: '40px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: 'none', cursor: 'pointer',
              }}
            >
              <Pencil style={{ width: '16px', height: '16px', color: '#64748b' }} />
            </button>

            {/* Deletar */}
            <button
              onClick={() => handleDelete(player.id)}
              style={{
                width: '40px', height: '40px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: 'none', cursor: 'pointer',
              }}
            >
              <Trash2 style={{ width: '16px', height: '16px', color: '#f87171' }} />
            </button>
          </motion.div>
        ))
      )}

      {/* Botão adicionar */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setMode({ type: 'add' })}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', padding: '20px', borderRadius: '16px', marginTop: '4px',
          border: '2px dashed #475569', color: '#94a3b8',
          fontWeight: 700, fontSize: '17px', background: 'transparent', cursor: 'pointer',
        }}
      >
        <UserPlus style={{ width: '22px', height: '22px' }} />
        Adicionar Jogador
      </motion.button>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
            <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
              Jogadores
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
            {savedPlayers.length} {savedPlayers.length === 1 ? 'cadastrado' : 'cadastrados'}
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '16px' }} />

      {/* ── Conteúdo ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        <AnimatePresence mode="wait">
          {mode.type === 'list' ? renderList() : renderForm()}
        </AnimatePresence>
      </div>
    </div>
  );
};
