import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';

const Drawer = ({ isOpen, onClose, title, children }) => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`bg-[var(--bg-card)] w-full max-w-lg h-full shadow-2xl flex flex-col animate-in duration-300 
        ${isRTL ? 'mr-auto slide-in-from-left' : 'ml-auto slide-in-from-right'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)]">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default Drawer;
