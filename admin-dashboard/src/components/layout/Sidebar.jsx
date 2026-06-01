import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Heart, Stethoscope, Calendar, 
  Shield, CreditCard, Headphones, History, Settings, 
  LogOut, ChevronLeft, ChevronRight, 
  Activity, Star, Briefcase, FileText, Database, KeyRound
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import useLanguage from '../../hooks/useLanguage';
import { ROUTE_PERMISSIONS } from '../../auth/permissions';
import Avatar from '../ui/Avatar';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { t } = useTranslation();
  const { user, logout, canRoute } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/', permission: ROUTE_PERMISSIONS.dashboard, roles: ['ANY'] },
    { icon: Users, label: t('sidebar.users'), path: '/users', permission: ROUTE_PERMISSIONS.users, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Heart, label: t('sidebar.patients'), path: '/patients', permission: ROUTE_PERMISSIONS.patients, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'SUPPORT_STAFF'] },
    { icon: Stethoscope, label: t('sidebar.doctors'), path: '/doctors', permission: ROUTE_PERMISSIONS.doctors, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Activity, label: t('sidebar.specialities'), path: '/specialities', permission: ROUTE_PERMISSIONS.specialities, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Briefcase, label: t('sidebar.services'), path: '/services', permission: ROUTE_PERMISSIONS.services, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Database, label: t('sidebar.medical_master_data'), path: '/medical-master-data', permission: ROUTE_PERMISSIONS.medicalMaster, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Calendar, label: t('sidebar.appointments'), path: '/appointments', permission: ROUTE_PERMISSIONS.appointments, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: Shield, label: t('sidebar.insurance_cases'), path: '/insurance-cases', permission: ROUTE_PERMISSIONS.insurance, roles: ['SUPER_ADMIN', 'INSURANCE_STAFF', 'MEDICAL_ADMIN'] },
    { icon: FileText, label: t('sidebar.claims'), path: '/claims', permission: ROUTE_PERMISSIONS.claims, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
    { icon: CreditCard, label: t('sidebar.payments'), path: '/payments', permission: ROUTE_PERMISSIONS.payments, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
    { icon: History, label: t('sidebar.reconciliations'), path: '/reconciliations', permission: ROUTE_PERMISSIONS.reconciliations, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
    { icon: Headphones, label: t('sidebar.support'), path: '/support/tickets', permission: ROUTE_PERMISSIONS.support, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF'] },
    { icon: Star, label: t('sidebar.reviews'), path: '/reviews', permission: ROUTE_PERMISSIONS.reviews, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
    { icon: History, label: t('sidebar.audit_logs'), path: '/audit-logs', permission: ROUTE_PERMISSIONS.audit, roles: ['SUPER_ADMIN'] },
    { icon: KeyRound, label: t('sidebar.roles'), path: '/roles', permission: ROUTE_PERMISSIONS.roles, roles: ['SUPER_ADMIN'] },
    { icon: Settings, label: t('sidebar.settings'), path: '/settings', permission: ROUTE_PERMISSIONS.settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredItems = navItems.filter((item) => {
    if (item.roles?.includes('ANY')) return true;
    return canRoute({ permission: item.permission, roles: item.roles });
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = (
    <div className="sidebar-shell relative flex flex-col h-full bg-[var(--bg-sidebar)] text-[var(--text-primary)] overflow-hidden border-e border-[var(--divider)]">
      <div className="flex items-center gap-3 px-5 py-7">
        <div className="logo-tile w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
          <Activity size={22} className="text-[var(--primary-fg)]" />
        </div>
        {!isCollapsed && (
          <span className="text-card-title font-semibold tracking-tight whitespace-nowrap">
            Life<span className="text-[var(--primary)]">Pain</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {filteredItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `nav-link group ${isActive ? 'nav-link--active' : ''} ${isCollapsed ? 'justify-center !px-3' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={20} className="nav-icon shrink-0 transition-colors" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[var(--divider)]">
        <div className={`flex items-center gap-3 p-3 rounded-2xl ${isCollapsed ? 'justify-center' : 'bg-[var(--surface-secondary)]'}`}>
          <Avatar name={user?.fullName} size="sm" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-body font-semibold truncate">{user?.fullName}</p>
              <p className="text-helper text-[var(--text-muted)] truncate">{t(`common.roles.${user?.role}`)}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              type="button"
              onClick={handleLogout}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-lg transition-colors"
              aria-label={t('common.logout') || 'Logout'}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full mt-3 flex justify-center p-3 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-xl transition-colors"
            aria-label={t('common.logout') || 'Logout'}
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute bottom-28 hidden md:flex items-center justify-center w-8 h-8 bg-[var(--surface)] border border-[var(--border-color)] rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all
          ${isRTL ? (isCollapsed ? '-left-4' : '-left-4 rotate-180') : (isCollapsed ? '-right-4' : '-right-4 rotate-180')}
        `}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );

  return (
    <>
      <aside 
        className={`fixed inset-y-0 hidden md:block z-[50] transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${isRTL ? 'right-0' : 'left-0'}
        `}
      >
        {SidebarContent}
      </aside>

      <div 
        className={`fixed inset-0 z-[100] md:hidden bg-[var(--overlay)] backdrop-blur-sm transition-opacity duration-300
          ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileOpen(false)}
        role="presentation"
      >
        <aside 
          className={`absolute inset-y-0 w-[260px] bg-[var(--bg-sidebar)] transition-transform duration-300 ease-in-out shadow-xl
            ${isRTL ? (isMobileOpen ? 'right-0' : 'translate-x-full') : (isMobileOpen ? 'left-0' : '-translate-x-full')}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {SidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
