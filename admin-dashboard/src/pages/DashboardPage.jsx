import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { 
  Users, Stethoscope, Calendar, Heart, Shield, Headphones, 
  CreditCard, UserCheck, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((res) => res.data.data),
  });

  if (isLoading) return <LoadingSkeleton type="stats" />;

  const stats = data || {};
  const isInsuranceStaff = user?.role === 'INSURANCE_STAFF';

  // Mock data for charts if API doesn't provide it
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
  ];

  const appointmentData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 22 },
    { name: 'Fri', value: 30 },
    { name: 'Sat', value: 10 },
    { name: 'Sun', value: 5 },
  ];

  return (
    <div className="space-y-10">
      <div className="highlight-section px-6 py-5">
        <h1 className="text-page-title">
          {t(`dashboard.greeting_${user?.role}`) || t('sidebar.dashboard')}
        </h1>
        <p className="text-body text-[var(--text-secondary)] mt-2">{t('dashboard.overview')}</p>
      </div>

      {isInsuranceStaff && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label={t('dashboard.stats.open_insurance_cases')}
            value={stats.openInsuranceCases || 0}
            icon={Shield}
            color="rose"
          />
          <StatCard
            label={t('dashboard.stats.pending_insurance_policies')}
            value={stats.pendingInsurancePolicies || 0}
            icon={UserCheck}
            color="yellow"
          />
          <StatCard
            label={t('dashboard.stats.approved_today')}
            value={stats.insuranceApprovedToday || 0}
            icon={Shield}
            color="green"
          />
          <Card className="flex items-center justify-center p-6">
            <Link to="/insurance-cases?status=UNDER_REVIEW" className="btn btn-primary w-full text-center">
              {t('insurance.review_pending')}
            </Link>
          </Card>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard 
          label={t('dashboard.stats.total_patients')} 
          value={stats.totalPatients || 0} 
          icon={Heart} 
          color="rose"
          trend="up"
          trendValue={12}
        />
        <StatCard 
          label={t('dashboard.stats.total_doctors')} 
          value={stats.totalDoctors || 0} 
          icon={Stethoscope} 
          color="green"
          trend="up"
          trendValue={5}
        />
        <StatCard 
          label={t('dashboard.stats.today_appointments')} 
          value={stats.todayAppointments || 0} 
          icon={Calendar} 
          color="purple" 
        />
        <StatCard 
          label={t('dashboard.stats.pending_verifications')} 
          value={stats.pendingVerifications || 0} 
          icon={UserCheck} 
          color="yellow" 
        />
        <StatCard 
          label={t('dashboard.stats.open_insurance_cases')} 
          value={stats.openInsuranceCases || 0} 
          icon={Shield} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard 
          label={t('dashboard.stats.open_support_cases')} 
          value={stats.openSupportCases || 0} 
          icon={Headphones} 
          color="yellow" 
        />
        <StatCard 
          label={t('dashboard.stats.monthly_revenue')} 
          value={`${stats.monthlyRevenue || 0} ر.س`} 
          icon={CreditCard} 
          color="green" 
          trend="up"
          trendValue={8.2}
        />
        <StatCard 
          label={t('dashboard.stats.completed_this_month')} 
          value={stats.completedThisMonth || 0} 
          icon={TrendingUp} 
          color="rose" 
        />
        <StatCard 
          label={t('dashboard.stats.pending_payouts')} 
          value={`${stats.pendingPayouts || 0} ر.س`} 
          icon={Wallet} 
          color="red" 
        />
        <StatCard 
          label={t('dashboard.stats.total_appointments')} 
          value={stats.totalAppointments || 0} 
          icon={Calendar} 
          color="purple" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title={t('dashboard.revenue_trend') || 'Revenue Trend'}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D98C9A" stopOpacity={0.35}/>
                    <stop offset="50%" stopColor="#F4B6C2" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#F4B6C2" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D98C9A"/>
                    <stop offset="100%" stopColor="#F4B6C2"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={13} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={13} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-dropdown)'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="url(#strokeRevenue)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t('dashboard.appointment_activity') || 'Appointment Activity'}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData}>
                <defs>
                  <linearGradient id="barPink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F4B6C2"/>
                    <stop offset="100%" stopColor="#BFA2DB"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={13} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={13} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-main)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-card)', 
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-dropdown)'
                  }} 
                />
                <Bar dataKey="value" fill="url(#barPink)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
