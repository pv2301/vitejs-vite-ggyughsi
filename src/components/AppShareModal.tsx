import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

const APP_URL = 'https://scoregames.vercel.app';

interface AppShareModalProps {
  onClose: () => void;
}

export const AppShareModal: React.FC<AppShareModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Estou usando o ScoreGames para marcar pontuações em jogos como Skyjo, Take6, Uno e outros — e dá até pra criar jogos com suas próprias regras! 🎲\n\nAcesse aqui: ${APP_URL}`
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = APP_URL;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="app-share-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 60,
        }}
      >
        <motion.div
          key="app-share-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
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
                Compartilhar App
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
                Chame seus amigos para usar o ScoreGames
              </p>
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

          {/* QR Code */}
          <div style={{
            margin: '0 20px 16px',
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode style={{ width: '16px', height: '16px', color: '#475569' }} />
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Aponte a câmera para acessar
              </span>
            </div>
            <QRCode
              value={APP_URL}
              size={Math.min(200, typeof window !== 'undefined' ? window.innerWidth - 120 : 200)}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          {/* URL + Copiar */}
          <div style={{
            margin: '0 20px 16px',
            background: '#0f172a',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{
              flex: 1, fontSize: '13px', color: '#60a5fa',
              fontFamily: 'monospace', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0, fontWeight: 600,
            }}>
              {APP_URL}
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              {copied ? (
                <>
                  <Check style={{ width: '16px', height: '16px', color: '#34d399' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp */}
          <div style={{ padding: '0 20px' }}>
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
              Enviar convite via WhatsApp
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
