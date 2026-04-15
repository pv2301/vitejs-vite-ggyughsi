import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, X, Plus, CheckCircle2, RefreshCw,
  Users, Clock, ChevronDown, ChevronRight, Layers,
  Flag, Heart, Crown, Gem, Map, Target, Shield, Star,
  Sparkles, Spade, Club, Zap,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GAMES_LIBRARY, LIBRARY_CATEGORIES, searchLibrary, getLibraryGameId } from '../config/games-library';
import type { CuratedGame } from '../types';

// ── Icon map (mirror do GameEditor) ─────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  layers: Layers, flag: Flag, heart: Heart, crown: Crown, gem: Gem,
  map: Map, target: Target, shield: Shield, star: Star, sparkles: Sparkles,
  spade: Spade, clubs: Club, zap: Zap,
};

const IconComp = ({ name, size = 22 }: { name: string; size?: number }) => {
  const Comp = ICON_MAP[name] ?? Layers;
  return <Comp width={size} height={size} />;
};

// ── Condição de vitória legível ────────────────────────────────────────────
const VICTORY_LABELS: Record<string, string> = {
  highest_score: 'Maior pontuação',
  lowest_score: 'Menor pontuação',
  winner_takes_all: 'Victoria por rodada',
  duelo: 'Duelo',
};

// ── Cartão de jogo da lista ────────────────────────────────────────────────
const GameCard: React.FC<{
  game: CuratedGame;
  isAdded: boolean;
  onClick: () => void;
}> = ({ game, isAdded, onClick }) => (
  <motion.button
    layout
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    style={{
      width: '100%', textAlign: 'left', background: 'rgba(30,41,59,0.6)',
      border: `1px solid ${isAdded ? game.config.themeColor + '66' : '#1e293b'}`,
      borderRadius: 12, padding: '12px 14px', cursor: 'pointer', display: 'flex',
      alignItems: 'center', gap: 12, transition: 'border-color 0.2s',
    }}
  >
    {/* Ícone colorido */}
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: `${game.config.themeColor}22`, color: game.config.themeColor,
    }}>
      <IconComp name={game.config.icon} size={20} />
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{game.name}</span>
        {isAdded && (
          <span style={{
            fontSize: 10, background: `${game.config.themeColor}33`, color: game.config.themeColor,
            borderRadius: 20, padding: '1px 7px', fontWeight: 700, letterSpacing: 0.3,
          }}>
            NO APP
          </span>
        )}
      </div>
      <p style={{ color: '#64748b', fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {game.description}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <span style={{ color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Users width={10} height={10} />{game.playerCount}
        </span>
        <span style={{ color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Clock width={10} height={10} />{game.duration}
        </span>
      </div>
    </div>

    <ChevronRight width={16} height={16} color="#334155" />
  </motion.button>
);

// ── Seção colapsável por categoria ─────────────────────────────────────────
const CategorySection: React.FC<{
  category: string;
  games: CuratedGame[];
  addedIds: Set<string>;
  onSelect: (g: CuratedGame) => void;
}> = ({ category, games, addedIds, onSelect }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', color: '#94a3b8', fontWeight: 700, fontSize: 11,
          letterSpacing: 1, textTransform: 'uppercase', padding: '8px 2px', cursor: 'pointer',
        }}
      >
        <span>{category} ({games.length})</span>
        {open ? <ChevronDown width={14} height={14} /> : <ChevronRight width={14} height={14} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {games.map(g => (
                <GameCard
                  key={g.id}
                  game={g}
                  isAdded={addedIds.has(getLibraryGameId(g.id))}
                  onClick={() => onSelect(g)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Detail Sheet (bottom sheet) ────────────────────────────────────────────
const DetailSheet: React.FC<{
  game: CuratedGame;
  isAdded: boolean;
  onAdd: () => void;
  onClose: () => void;
}> = ({ game, isAdded, onAdd, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}
  >
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      onClick={e => e.stopPropagation()}
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '24px 24px 0 0', padding: '0 0 32px',
        maxHeight: '88dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Handle */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: '#334155' }} />
      </div>

      {/* Header colorido */}
      <div style={{
        background: `linear-gradient(135deg, ${game.config.themeColor}22, ${game.config.themeColor}08)`,
        borderBottom: `1px solid ${game.config.themeColor}33`,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: `${game.config.themeColor}22`, color: game.config.themeColor, flexShrink: 0,
        }}>
          <IconComp name={game.config.icon} size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>{game.name}</div>
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{game.description}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}>
          <X width={20} height={20} />
        </button>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0' }}>
        {[
          { icon: <Users width={12} height={12} />, text: game.playerCount },
          { icon: <Clock width={12} height={12} />, text: game.duration },
          { icon: <Shield width={12} height={12} />, text: VICTORY_LABELS[game.config.victoryCondition] },
          ...(game.config.maxRounds ? [{ icon: <Flag width={12} height={12} />, text: `${game.config.maxRounds} rodadas` }] : []),
        ].map((b, i) => (
          <span key={i} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(51,65,85,0.6)', border: '1px solid #334155',
            borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#94a3b8',
          }}>
            {b.icon}{b.text}
          </span>
        ))}
      </div>

      {/* Regras */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{
          color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 1,
          textTransform: 'uppercase', marginBottom: 10,
        }}>Regras</div>
        <div style={{
          background: 'rgba(15,23,42,0.6)', borderRadius: 12,
          border: '1px solid #1e293b', padding: '12px 14px',
        }}>
          {game.rulesText.split('\n').map((line, i) => (
            <p key={i} style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6, margin: '0 0 4px' }}>
              {line}
            </p>
          ))}
        </div>

        {/* Config summary */}
        <div style={{
          marginTop: 12, background: 'rgba(15,23,42,0.5)', borderRadius: 10,
          border: '1px solid #1e293b', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 12,
        }}>
          {game.config.winningScore && (
            <div>
              <div style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Meta</div>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{game.config.winningScore} pts</div>
            </div>
          )}
          <div>
            <div style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Negativo?</div>
            <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{game.config.allowNegative ? 'Sim' : 'Não'}</div>
          </div>
          {game.config.maxRounds && (
            <div>
              <div style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Rodadas</div>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{game.config.maxRounds}</div>
            </div>
          )}
        </div>

        {isAdded && (
          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
            color: '#ca8a04', fontSize: 12, lineHeight: 1.5,
          }}>
            ⚠️ Esse jogo já está no app. Clicar em <strong>Restaurar Padrão</strong> vai sobrescrever as suas edições com as regras originais desta biblioteca.
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px' }}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: isAdded ? '#ca8a04' : game.config.themeColor,
            color: '#fff',
          }}
        >
          {isAdded
            ? <><RefreshCw width={18} height={18} /> Restaurar Padrão</>
            : <><Plus width={18} height={18} /> Adicionar ao App</>
          }
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Tela principal ────────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
  onCreateCustom: () => void;
}

export const GameLibrary: React.FC<Props> = ({ onBack, onCreateCustom }) => {
  const { customGames, addFromLibrary } = useGame();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CuratedGame | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const addedIds = useMemo(
    () => new Set(customGames.map(g => g.id)),
    [customGames]
  );

  const isFiltering = query.trim().length > 0;
  const flatResults = useMemo(() => searchLibrary(query), [query]);

  const grouped = useMemo(() =>
    LIBRARY_CATEGORIES
      .map(cat => ({ category: cat, games: flatResults.filter(g => g.category === cat) }))
      .filter(g => g.games.length > 0),
    [flatResults]
  );

  const handleAdd = () => {
    if (!selected) return;
    addFromLibrary(selected);
    setJustAdded(selected.id);
    setTimeout(() => setJustAdded(null), 2500);
    setSelected(null);
  };

  return (
    <div style={{
      minHeight: '100dvh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft width={22} height={22} />
        </button>
        <div>
          <h1 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, margin: 0, lineHeight: 1.2 }}>Biblioteca de Jogos</h1>
          <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>{GAMES_LIBRARY.length} jogos curados • Regras prontas para jogar</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search width={16} height={16} color="#475569" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, categoria ou tag..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(30,41,59,0.8)', border: '1.5px solid #1e293b',
              borderRadius: 10, padding: '10px 36px 10px 36px',
              color: '#f1f5f9', fontSize: 14, outline: 'none',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}
            >
              <X width={14} height={14} />
            </button>
          )}
        </div>
      </div>

      {/* Toast de sucesso */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              margin: '0 20px 8px', background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10,
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <CheckCircle2 width={16} height={16} color="#22c55e" />
            <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>Jogo adicionado! Ele aparece no Dashboard agora.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
        {isFiltering ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {flatResults.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0', fontSize: 14 }}>
                Nenhum jogo encontrado para <strong style={{ color: '#64748b' }}>"{query}"</strong>
              </div>
            ) : flatResults.map(g => (
              <GameCard
                key={g.id}
                game={g}
                isAdded={addedIds.has(getLibraryGameId(g.id))}
                onClick={() => setSelected(g)}
              />
            ))}
          </div>
        ) : (
          grouped.map(({ category, games }) => (
            <CategorySection
              key={category}
              category={category}
              games={games}
              addedIds={addedIds}
              onSelect={setSelected}
            />
          ))
        )}
      </div>

      {/* Footer: criar do zero */}
      <div style={{
        padding: '12px 20px 24px', borderTop: '1px solid #1e293b', flexShrink: 0,
        background: 'rgba(15,23,42,0.9)',
      }}>
        <button
          onClick={onCreateCustom}
          style={{
            width: '100%', padding: '13px', borderRadius: 14,
            background: 'rgba(30,41,59,0.8)', border: '1.5px solid #334155',
            color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Zap width={16} height={16} />
          Criar Jogo Personalizado
        </button>
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {selected && (
          <DetailSheet
            game={selected}
            isAdded={addedIds.has(getLibraryGameId(selected.id))}
            onAdd={handleAdd}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
