import React from 'react';
import useLanguage from '../../hooks/useLanguage';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
          language === 'en' 
            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
          language === 'ar' 
            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' 
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
