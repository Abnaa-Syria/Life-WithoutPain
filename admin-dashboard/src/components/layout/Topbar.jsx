import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';

const roleLabels = {
  SUPER_ADMIN: 'مدير النظام',
  MEDICAL_ADMIN: 'المدير الطبي',
  INSURANCE_STAFF: 'موظف التأمين',
  SUPPORT_STAFF: 'موظف الدعم',
  ACCOUNTANT: 'المحاسب',
};

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">حياة بلا ألم</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700">
            <User className="w-4 h-4 text-gray-500" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabels[user?.role] || user?.role}</p>
            </div>
          </div>

          <button onClick={logout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors" title="تسجيل الخروج">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
