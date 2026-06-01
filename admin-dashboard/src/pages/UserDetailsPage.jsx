import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { User, Shield, Globe, Clock, Smartphone } from 'lucide-react';

export default function UserDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/admin/users/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const user = response?.data;

  if (!user) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={user.fullName}
        subtitle={user.email}
        backPath="/users"
        badges={[
          { label: t(`common.roles.${user.role}`), className: 'bg-primary-100 text-primary-700' },
          { label: t(`common.${user.status?.toLowerCase()}`), className: user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--surface-secondary)] text-[var(--text-muted)]' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
            <Avatar name={user.fullName} size="xl" className="mb-4 ring-4 ring-primary-100" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{user.fullName}</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">{user.email}</p>
            
            <div className="w-full pt-6 border-t border-[var(--border-color)] space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('common.status')}</span>
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {t(`common.${user.status?.toLowerCase()}`, { defaultValue: user.status })}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('users.role')}</span>
                <span className="font-semibold">{t(`common.roles.${user.role}`)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('users.verified')}</span>
                <Badge variant={user.isVerified ? 'success' : 'warning'}>{user.isVerified ? 'Yes' : 'No'}</Badge>
              </div>
            </div>
          </div>

          <DetailsSection title={t('users.preferences') || 'Preferences'} icon={Globe}>
            <DetailItem label={t('users.language')} value={user.preferredLanguage} />
            <DetailItem label={t('users.theme')} value={user.darkModeEnabled ? 'Dark' : 'Light'} />
          </DetailsSection>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DetailsSection title={t('users.account_info') || 'Account Information'} icon={User}>
            <DetailItem label={t('users.full_name')} value={user.fullName} />
            <DetailItem label={t('users.email')} value={user.email} />
            <DetailItem label={t('users.phone')} value={user.phone} />
            <DetailItem label={t('common.id')} value={user.id} />
          </DetailsSection>

          <DetailsSection title={t('users.security') || 'Security & Activity'} icon={Shield}>
            <DetailItem label={t('users.last_login')} value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
            <DetailItem label={t('common.created_at')} value={new Date(user.createdAt).toLocaleString()} />
          </DetailsSection>
        </div>
      </div>
    </div>
  );
}
