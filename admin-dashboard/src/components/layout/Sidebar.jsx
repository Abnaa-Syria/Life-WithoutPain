import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Heart, Stethoscope, Calendar, 
  Shield, CreditCard, Headphones, History, Settings, 
  LogOut, ChevronLeft, ChevronRight, Menu, X, 
  Activity, Star, Briefcase, FileText, Bell, Pill, ClipboardList
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';
import Avatar from '../ui/Avatar';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/', roles: ['ANY'] },
    { icon: Users, label: t('sidebar.users'), path: '/users', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Heart, label: t('sidebar.patients'), path: '/patients', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'SUPPORT_STAFF'] },
    { icon: Stethoscope, label: t('sidebar.doctors'), path: '/doctors', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Activity, label: t('sidebar.specialities'), path: '/specialities', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Briefcase, label: t('sidebar.services'), path: '/services', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Pill, label: t('sidebar.medications') || 'Medications', path: '/medications', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: ClipboardList, label: t('sidebar.medical_tests') || 'Medical Tests', path: '/medical-tests', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Calendar, label: t('sidebar.appointments'), path: '/appointments', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Shield, label: t('sidebar.insurance_cases'), path: '/insurance-cases', roles: ['SUPER_ADMIN', 'INSURANCE_STAFF', 'MEDICAL_ADMIN'] },
    { icon: FileText, label: t('sidebar.claims'), path: '/claims', roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
    { icon: CreditCard, label: t('sidebar.payments'), path: '/payments', roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
    { icon: Headphones, label: t('sidebar.support_cases'), path: '/support-cases', roles: ['SUPER_ADMIN', 'SUPPORT_STAFF'] },
    { icon: Star, label: t('sidebar.reviews'), path: '/reviews', roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: History, label: t('sidebar.audit_logs'), path: '/audit-logs', roles: ['SUPER_ADMIN'] },
    { icon: Settings, label: t('sidebar.settings'), path: '/settings', roles: ['SUPER_ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => 
    item.roles.includes('ANY') || (user && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] text-white overflow-hidden">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Activity size={24} className="text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2">
            Life<span className="text-indigo-400">Pain</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={22} className={`shrink-0 ${isCollapsed ? '' : ''}`} />
            {!isCollapsed && (
              <span className="text-sm font-medium animate-in fade-in slide-in-from-left-2">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center gap-3 p-2 rounded-2xl ${isCollapsed ? 'justify-center' : 'bg-slate-800/50'}`}>
          <Avatar name={user?.fullName} size="sm" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{t(`common.roles.${user?.role}`)}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button 
            onClick={handleLogout}
            className="w-full mt-4 flex justify-center p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute bottom-24 hidden md:flex items-center justify-center w-8 h-8 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white transition-all transform
          ${isRTL ? (isCollapsed ? '-left-4' : '-left-4 rotate-180') : (isCollapsed ? '-right-4' : '-right-4 rotate-180')}
        `}
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed inset-y-0 hidden md:block z-[50] transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${isRTL ? 'right-0' : 'left-0'}
        `}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300
          ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileOpen(false)}
      >
        <aside 
          className={`absolute inset-y-0 w-[260px] bg-[var(--bg-sidebar)] transition-transform duration-300 ease-in-out
            ${isRTL ? (isMobileOpen ? 'right-0' : 'translate-x-full') : (isMobileOpen ? 'left-0' : '-translate-x-full')}
          `}
          onClick={e => e.stopPropagation()}
        >
          {SidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
