import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Play, Copy, Check } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ShareModalProps {
  sessionId: string;
  gameName: string;
  themeColor: string;
  onClose: () => void;
  onConfirmStart: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  sessionId,
  gameName,
  themeColor,
  onClose,
  onConfirmStart,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?session=${sessionId}`;
  }, [sessionId]);

  const whatsappText = encodeURIComponent(
    `Estou jogando ${gameName} no ScoreMaster! Acompanhe a partida ao vivo: ${shareUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = shareUrl;
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-slate-800 rounded-t-3xl w-full max-w-md border-t border-x border-slate-700 overflow-hidden"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-5">
            <div>
              <h2 className="text-xl font-black text-white">Compartilhar Partida</h2>
              <p className="text-slate-400 text-sm mt-0.5">{gameName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          {/* QR Code */}
          <div className="mx-6 mb-4 bg-white rounded-2xl p-5 flex items-center justify-center">
            <QRCode
              value={shareUrl}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          {/* URL + copy */}
          <div className="mx-6 mb-5 bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="flex-1 text-slate-400 text-xs truncate font-mono">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400">Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="px-6 space-y-3">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-6 h-6" fill="currentColor" />
              Compartilhar via WhatsApp
            </a>

            {/* Continue to game */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onConfirmStart}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-white text-base"
              style={{ backgroundColor: themeColor }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Continuar para o Jogo
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
