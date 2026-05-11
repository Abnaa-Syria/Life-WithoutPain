import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Users, Stethoscope, UserCheck, Heart, Briefcase,
  Calendar, Shield, HeadphonesIcon, CreditCard, FileText, Pill,
  Bell, Star, Settings, ScrollText, Building2, Receipt, Wallet, FlaskConical,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'INSURANCE_STAFF', 'SUPPORT_STAFF', 'ACCOUNTANT'] },
  { path: '/users', label: 'المستخدمون', icon: Users, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/patients', label: 'المرضى', icon: Heart, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'SUPPORT_STAFF'] },
  { path: '/doctors', label: 'الأطباء', icon: Stethoscope, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/doctor-verification', label: 'التحقق من الأطباء', icon: UserCheck, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/specialities', label: 'التخصصات', icon: Briefcase, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/services', label: 'الخدمات', icon: Briefcase, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/appointments', label: 'المواعيد', icon: Calendar, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/insurance-providers', label: 'شركات التأمين', icon: Building2, roles: ['SUPER_ADMIN', 'INSURANCE_STAFF'] },
  { path: '/insurance-cases', label: 'حالات التأمين', icon: Shield, roles: ['SUPER_ADMIN', 'INSURANCE_STAFF', 'MEDICAL_ADMIN'] },
  { path: '/support-cases', label: 'حالات الدعم', icon: HeadphonesIcon, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF'] },
  { path: '/lab-tests', label: 'الفحوصات المخبرية', icon: FlaskConical, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/payments', label: 'المدفوعات', icon: CreditCard, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
  { path: '/claims', label: 'المطالبات', icon: Receipt, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
  { path: '/doctor-payouts', label: 'مستحقات الأطباء', icon: Wallet, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
  { path: '/reconciliations', label: 'التسويات', icon: Receipt, roles: ['SUPER_ADMIN', 'ACCOUNTANT'] },
  { path: '/reports', label: 'التقارير الطبية', icon: FileText, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/prescriptions', label: 'الوصفات الطبية', icon: Pill, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/notifications', label: 'الإشعارات', icon: Bell, roles: ['SUPER_ADMIN'] },
  { path: '/reviews', label: 'التقييمات', icon: Star, roles: ['SUPER_ADMIN', 'MEDICAL_ADMIN'] },
  { path: '/settings', label: 'الإعدادات', icon: Settings, roles: ['SUPER_ADMIN'] },
  { path: '/audit-logs', label: 'سجل العمليات', icon: ScrollText, roles: ['SUPER_ADMIN'] },
];

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className={`fixed top-0 right-0 z-40 h-screen pt-16 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto`}>
      <div className="px-3 py-4">
        <div className="px-4 py-3 mb-4">
          <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400">حياة بلا ألم</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">لوحة الإدارة</p>
        </div>
        <nav className="space-y-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
