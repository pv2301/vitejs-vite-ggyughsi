import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, UserPlus } from 'lucide-react';
import type { Player } from '../types';

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
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

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

  const availableSaved = savedPlayers.filter(
    sp => !selectedPlayers.find(p => p.id === sp.id)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Lista de jogadores selecionados */}
      <AnimatePresence>
        {selectedPlayers.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15,23,42,0.6)', borderRadius: '16px', padding: '16px', border: '1px solid #334155' }}
          >
            {/* Avatar com borda colorida */}
            <div
              style={{
                width: '56px', height: '56px', borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backgroundColor: `${player.color}33`,
                border: `3px solid ${player.color}`,
              }}
            >
              {player.avatar}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 900, color: 'white', fontSize: '18px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: player.color }} />
                <span style={{ color: '#64748b', fontSize: '14px' }}>{player.avatar}</span>
              </div>
            </div>

            <button
              onClick={() => onRemovePlayer(player.id)}
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            >
              <X style={{ width: '20px', height: '20px', color: '#f87171' }} />
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
            {/* Chips de jogadores salvos */}
            {availableSaved.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableSaved.map(player => (
                  <button
                    key={player.id}
                    onClick={() => onAddPlayer(player)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(15,23,42,0.6)', borderRadius: '999px', border: '1px solid #334155', cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                        backgroundColor: `${player.color}44`,
                        border: `2px solid ${player.color}`,
                      }}
                    >
                      {player.avatar}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#cbd5e1' }}>{player.name}</span>
                    <Plus style={{ width: '14px', height: '14px', color: '#64748b' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Botão adicionar novo */}
            <button
              onClick={() => setIsAdding(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px', borderRadius: '16px', border: '2px dashed #475569', color: '#94a3b8', fontWeight: 700, fontSize: '17px', background: 'transparent', cursor: 'pointer' }}
            >
              <UserPlus style={{ width: '24px', height: '24px' }} />
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
            {/* Header com preview ao vivo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                    backgroundColor: `${selectedColor}33`,
                    border: `3px solid ${selectedColor}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {selectedAvatar}
                </div>
                <span style={{ fontWeight: 900, color: 'white', fontSize: '18px' }}>Novo Jogador</span>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Input nome */}
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

              {/* Seleção de avatar */}
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Avatar</p>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {AVATARS.map(avatar => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      style={{
                        width: '48px', height: '48px', borderRadius: '12px', fontSize: '24px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
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

              {/* Seleção de cor */}
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

              {/* Botão confirmar */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!newName.trim()}
                style={{ width: '100%', padding: '20px', borderRadius: '16px', fontWeight: 900, color: 'white', fontSize: '20px', backgroundColor: selectedColor, border: 'none', cursor: 'pointer', opacity: newName.trim() ? 1 : 0.4 }}
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
