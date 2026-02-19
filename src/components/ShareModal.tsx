import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Play, Users } from 'lucide-react';

interface ShareModalProps {
  sessionId: string;
  gameName: string;
  themeColor: string;
  onClose: () => void;
  onConfirmStart: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  gameName,
  themeColor,
  onClose,
  onConfirmStart,
}) => {
  const whatsappText = encodeURIComponent(
    `Vamos jogar ${gameName}? Estou usando o ScoreGames para marcar os pontos. Baixe ou acesse o app e venha jogar comigo! 🎲`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="share-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 50,
        }}
      >
        {/* Sheet */}
        <motion.div
          key="share-sheet"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#1e293b',
            borderRadius: '28px 28px 0 0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderBottom: 'none',
            width: '100%',
            maxWidth: '480px',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
            overflow: 'hidden',
          }}
        >
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.2)' }} />
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 20px 16px',
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>
                Chamar Jogadores
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>{gameName}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <X style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
            </button>
          </div>

          {/* Info card */}
          <div style={{
            margin: '0 20px 20px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '20px',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: `${themeColor}22`,
              border: `1.5px solid ${themeColor}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users style={{ width: '22px', height: '22px', color: themeColor }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>
                Jogo local — mesmo dispositivo
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0', lineHeight: 1.5 }}>
                O ScoreGames funciona no seu celular. Chame os amigos e passe o celular para cada um marcar seus pontos.
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', width: '100%', padding: '18px',
                borderRadius: '16px', fontWeight: 700, color: 'white',
                fontSize: '16px', backgroundColor: '#25D366',
                textDecoration: 'none', boxSizing: 'border-box',
              }}
            >
              <MessageCircle style={{ width: '22px', height: '22px' }} fill="currentColor" />
              Chamar via WhatsApp
            </a>

            {/* Continuar */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirmStart}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', width: '100%', padding: '18px',
                borderRadius: '16px', fontWeight: 900, color: 'white',
                fontSize: '16px', backgroundColor: themeColor,
                border: 'none', cursor: 'pointer', boxSizing: 'border-box',
              }}
            >
              <Play style={{ width: '18px', height: '18px' }} fill="currentColor" />
              Começar o Jogo
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
