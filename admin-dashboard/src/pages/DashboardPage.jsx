import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import StatsCard from '../components/ui/StatsCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import {
  Users, Stethoscope, Calendar, Heart, Shield, HeadphonesIcon,
  CreditCard, UserCheck, TrendingUp, Wallet,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((res) => res.data.data),
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const stats = data || {};

  const roleGreeting = {
    SUPER_ADMIN: 'مرحباً بك في لوحة إدارة النظام',
    MEDICAL_ADMIN: 'مرحباً بك في لوحة الإدارة الطبية',
    INSURANCE_STAFF: 'مرحباً بك في لوحة التأمين',
    SUPPORT_STAFF: 'مرحباً بك في لوحة الدعم الفني',
    ACCOUNTANT: 'مرحباً بك في لوحة المحاسبة',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{roleGreeting[user?.role] || 'لوحة التحكم'}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">نظرة عامة على أداء المنصة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <StatsCard title="إجمالي المرضى" value={stats.totalPatients || 0} icon={Heart} color="primary" />
        <StatsCard title="إجمالي الأطباء" value={stats.totalDoctors || 0} icon={Stethoscope} color="green" />
        <StatsCard title="مواعيد اليوم" value={stats.todayAppointments || 0} icon={Calendar} color="purple" />
        <StatsCard title="بانتظار التحقق" value={stats.pendingVerifications || 0} icon={UserCheck} color="yellow" />
        <StatsCard title="حالات تأمين مفتوحة" value={stats.openInsuranceCases || 0} icon={Shield} color="red" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatsCard title="حالات دعم مفتوحة" value={stats.openSupportCases || 0} icon={HeadphonesIcon} color="yellow" />
        <StatsCard title="إيرادات الشهر" value={`${stats.monthlyRevenue || 0} ر.س`} icon={CreditCard} color="green" />
        <StatsCard title="مواعيد مكتملة (الشهر)" value={stats.completedThisMonth || 0} icon={TrendingUp} color="primary" />
        <StatsCard title="مستحقات معلقة" value={`${stats.pendingPayouts || 0} ر.س`} icon={Wallet} color="red" />
        <StatsCard title="إجمالي المواعيد" value={stats.totalAppointments || 0} icon={Calendar} color="purple" />
      </div>
    </div>
  );
}
