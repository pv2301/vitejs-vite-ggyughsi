import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, UserPlus, Pencil, Check } from 'lucide-react';
import type { Player } from '../types';
import { useGame } from '../context/GameContext';

interface PlayerSelectorProps {
  selectedPlayers: Omit<Player, 'totalScore' | 'roundScores' | 'position'>[];
  savedPlayers: Omit<Player, 'totalScore' | 'roundScores' | 'position'>[];
  onAddPlayer: (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => void;
  onRemovePlayer: (playerId: string) => void;
  themeColor: string;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const AVATARS = ['🎲', '🎮', '👾', '🎯', '🎨', '🎪', '🎭', '🦁'];

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  selectedPlayers,
  savedPlayers,
  onAddPlayer,
  onRemovePlayer,
  themeColor,
}) => {
  const { renameSavedPlayer } = useGame();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  // Estado de edição: id do jogador salvo sendo editado
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddPlayer({
      id: Date.now().toString(),
      name: newName.trim(),
      color: selectedColor,
      avatar: selectedAvatar,
    });
    setNewName('');
    setSelectedColor(COLORS[0]);
    setSelectedAvatar(AVATARS[0]);
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setIsAdding(false);
  };

  const startEdit = (player: Omit<Player, 'totalScore' | 'roundScores' | 'position'>) => {
    setEditingId(player.id);
    setEditingName(player.name);
  };

  const confirmEdit = () => {
    if (editingId && editingName.trim()) {
      renameSavedPlayer(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') confirmEdit();
    if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
  };

  const availableSaved = savedPlayers.filter(
    sp => !selectedPlayers.find(p => p.id === sp.id)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Jogadores selecionados */}
      <AnimatePresence>
        {selectedPlayers.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: 'rgba(15,23,42,0.6)', borderRadius: '16px',
              padding: '14px 16px', border: '1px solid #334155',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', backgroundColor: `${player.color}33`,
              border: `2.5px solid ${player.color}`,
            }}>
              {player.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 900, color: 'white', fontSize: '17px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player.name}
              </p>
            </div>
            <button
              onClick={() => onRemovePlayer(player.id)}
              style={{
                width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: 'none', cursor: 'pointer',
              }}
            >
              <X style={{ width: '18px', height: '18px', color: '#f87171' }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Formulário ou botões */}
      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {/* Chips de jogadores salvos com edição */}
            {availableSaved.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableSaved.map(player => (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'rgba(15,23,42,0.6)', borderRadius: '14px',
                      border: '1px solid #334155', padding: '10px 12px',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', backgroundColor: `${player.color}44`,
                      border: `2px solid ${player.color}`,
                    }}>
                      {player.avatar}
                    </div>

                    {/* Nome ou input de edição */}
                    {editingId === player.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        style={{
                          flex: 1, background: '#1e293b', border: `2px solid ${player.color}`,
                          borderRadius: '8px', padding: '6px 10px',
                          color: 'white', fontSize: '16px', fontWeight: 700, outline: 'none',
                        }}
                      />
                    ) : (
                      <span style={{ flex: 1, fontSize: '16px', fontWeight: 700, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {player.name}
                      </span>
                    )}

                    {/* Botão editar/confirmar */}
                    {editingId === player.id ? (
                      <button
                        onClick={confirmEdit}
                        style={{
                          width: '36px', height: '36px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${player.color}33`, borderRadius: '9px', border: 'none', cursor: 'pointer',
                        }}
                      >
                        <Check style={{ width: '18px', height: '18px', color: player.color }} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(player)}
                        style={{
                          width: '36px', height: '36px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,255,255,0.06)', borderRadius: '9px', border: 'none', cursor: 'pointer',
                        }}
                      >
                        <Pencil style={{ width: '15px', height: '15px', color: '#64748b' }} />
                      </button>
                    )}

                    {/* Botão adicionar à partida */}
                    {editingId !== player.id && (
                      <button
                        onClick={() => onAddPlayer(player)}
                        style={{
                          width: '36px', height: '36px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${themeColor}22`, borderRadius: '9px', border: `1.5px solid ${themeColor}55`,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus style={{ width: '18px', height: '18px', color: themeColor }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Botão adicionar novo */}
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '12px', padding: '20px', borderRadius: '16px',
                border: '2px dashed #475569', color: '#94a3b8',
                fontWeight: 700, fontSize: '17px', background: 'transparent', cursor: 'pointer',
              }}
            >
              <UserPlus style={{ width: '22px', height: '22px' }} />
              Adicionar Novo Jogador
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid #334155', overflow: 'hidden' }}
          >
            {/* Header com preview */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid #1e293b',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                  backgroundColor: `${selectedColor}33`, border: `3px solid ${selectedColor}`, transition: 'all 0.2s',
                }}>
                  {selectedAvatar}
                </div>
                <span style={{ fontWeight: 900, color: 'white', fontSize: '18px' }}>Novo Jogador</span>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#1e293b', borderRadius: '12px', border: 'none', cursor: 'pointer',
                }}
              >
                <X style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input
                autoFocus
                type="text"
                placeholder="Nome do Jogador"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', background: '#1e293b', borderRadius: '16px',
                  padding: '16px 20px', fontSize: '20px', color: 'white', fontWeight: 700,
                  outline: 'none', boxSizing: 'border-box',
                  border: `2px solid ${newName.trim() ? selectedColor : '#334155'}`,
                  transition: 'border-color 0.2s',
                }}
              />

              {/* Avatar */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Avatar</p>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      style={{
                        width: '48px', height: '48px', borderRadius: '12px', fontSize: '24px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: selectedAvatar === avatar ? `${selectedColor}44` : '#1e293b',
                        outline: selectedAvatar === avatar ? `3px solid ${selectedColor}` : '3px solid transparent',
                        outlineOffset: '2px',
                        transform: selectedAvatar === avatar ? 'scale(1.12)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Cor</p>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: color, border: 'none', cursor: 'pointer',
                        outline: selectedColor === color ? '3px solid white' : '3px solid transparent',
                        outlineOffset: '3px',
                        transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!newName.trim()}
                style={{
                  width: '100%', padding: '20px', borderRadius: '16px',
                  fontWeight: 900, color: 'white', fontSize: '20px',
                  backgroundColor: selectedColor, border: 'none', cursor: 'pointer',
                  opacity: newName.trim() ? 1 : 0.4,
                }}
              >
                CONFIRMAR
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
