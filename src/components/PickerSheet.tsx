import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

interface PickerOption {
  value: string;
  label: string;
}

interface PickerSheetProps {
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  label?: string;
  themeColor?: string;
}

export const PickerSheet: React.FC<PickerSheetProps> = ({
  value,
  options,
  onChange,
  label,
  themeColor = '#3b82f6',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption?.label || value;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      {/* ── Button ── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '8px 12px',
          background: '#0f172a',
          border: `1.5px solid #334155`,
          borderRadius: '10px',
          fontSize: '14px',
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
      >
        <span>{displayLabel}</span>
        <ChevronDown style={{ width: '16px', height: '16px', color: '#64748b' }} />
      </motion.button>

      {/* ── Bottom Sheet Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 40,
              }}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#1e293b',
                borderRadius: '28px 28px 0 0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: 'none',
                zIndex: 50,
                paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              {/* Handle bar */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '4px',
                    borderRadius: '99px',
                    background: 'rgba(255,255,255,0.2)',
                  }}
                />
              </div>

              {/* Header */}
              {label && (
                <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>
                    {label}
                  </span>
                </div>
              )}

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                {options.map(option => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.value)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      background:
                        value === option.value ? `${themeColor}15` : 'transparent',
                      border: 'none',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color:
                          value === option.value ? themeColor : 'rgba(255,255,255,0.9)',
                      }}
                    >
                      {option.label}
                    </span>
                    {value === option.value && (
                      <Check
                        style={{
                          width: '20px',
                          height: '20px',
                          color: themeColor,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
