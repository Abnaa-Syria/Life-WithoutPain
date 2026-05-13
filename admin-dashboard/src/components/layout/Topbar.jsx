import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

const Topbar = ({ onMenuClick, title }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-[40] h-16 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-color)] flex items-center px-4 md:px-8">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="p-2 md:hidden text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mr-2 rtl:mr-0 rtl:ml-2"
      >
        <Menu size={24} />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] truncate">
          {title}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="hidden lg:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--primary)]" size={18} />
          <input 
            type="text" 
            placeholder={t('common.search')}
            className="input pl-10 w-64 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus:bg-[var(--bg-card)]"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-card)]" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-[var(--border-color)] rtl:pl-0 rtl:pr-2 rtl:border-l-0 rtl:border-r">
          <div className="hidden sm:block text-right rtl:text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{user?.fullName}</p>
            <p className="text-xs text-[var(--text-muted)]">{t(`common.roles.${user?.role}`)}</p>
          </div>
          <Avatar name={user?.fullName} size="md" className="cursor-pointer hover:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-card)] transition-all" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
