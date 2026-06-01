import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-full m-4',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--overlay)] backdrop-blur-sm">
      <div 
        className={`modal-panel bg-[var(--bg-card)] w-full ${sizeClasses[size]} rounded-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[rgba(var(--primary-rgb),0.12)]`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--divider)]">
          <h3 className="text-section-title">{title}</h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-[var(--surface-secondary)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-hide flex-1 text-body">
          {children}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} role="presentation" />
    </div>
  );
};

export default Modal;
