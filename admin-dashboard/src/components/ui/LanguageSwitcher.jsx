import React from 'react';
import useLanguage from '../../hooks/useLanguage';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-[var(--surface-secondary)] p-1 rounded-xl">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-helper font-semibold rounded-lg transition-all ${
          language === 'en' 
            ? 'bg-[var(--bg-card)] shadow-sm text-[var(--primary)]' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1.5 text-helper font-semibold rounded-lg transition-all ${
          language === 'ar' 
            ? 'bg-[var(--bg-card)] shadow-sm text-[var(--primary)]' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
