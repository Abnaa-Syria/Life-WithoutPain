import React, { useEffect } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex bg-[var(--overlay)] backdrop-blur-sm">
      <div 
        className={`drawer-panel bg-[var(--bg-card)] w-full max-w-lg h-full flex flex-col border-s border-[rgba(var(--primary-rgb),0.12)]
        ${isRTL ? 'me-auto' : 'ms-auto'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--divider)]">
          <h3 className="text-section-title">{title}</h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto scrollbar-hide flex-1 text-body">
          {children}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} role="presentation" />
    </div>
  );
};

export default Drawer;
