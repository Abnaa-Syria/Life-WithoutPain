import React from 'react';
import { Search, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';
import Avatar from '../ui/Avatar';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useAuth } from '../../hooks/useAuth';

const Topbar = ({ onMenuClick, title }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="topbar-shell relative sticky top-0 z-[40] h-[72px] backdrop-blur-md border-b border-[var(--divider)] flex items-center px-5 md:px-8">
      <button 
        type="button"
        onClick={onMenuClick}
        className="p-2.5 md:hidden text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors me-2 rtl:me-0 rtl:ms-2"
        aria-label={t('common.menu')}
      >
        <Menu size={22} />
      </button>

      <div className="flex-1 min-w-0">
        {title && (
          <h2 className="text-section-title truncate">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden lg:flex relative group">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--primary)]" size={18} />
          <input 
            type="text" 
            placeholder={t('common.search')}
            className="input ps-10 w-64 !min-h-[48px] bg-[var(--surface-secondary)] border-[var(--border-color)] focus:border-[var(--primary)]"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          
          <NotificationDropdown />
        </div>

        <div className="flex items-center gap-3 ps-3 border-s border-[var(--divider)]">
          <div className="hidden sm:block text-end">
            <p className="text-body font-semibold text-[var(--text-primary)] leading-tight">{user?.fullName}</p>
            <p className="text-helper">{t(`common.roles.${user?.role}`)}</p>
          </div>
          <Avatar name={user?.fullName} size="md" className="cursor-pointer hover:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-card)] transition-all" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
