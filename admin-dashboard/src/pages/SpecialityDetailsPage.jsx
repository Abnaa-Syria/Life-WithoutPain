import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import CrudPage from '../components/ui/CrudPage';
import Badge from '../components/ui/Badge';
import { Activity } from 'lucide-react';

export default function SpecialityDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-speciality', id],
    queryFn: () => api.get(`/admin/specialities/${id}`).then((r) => r.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;

  const speciality = response?.data;
  if (!speciality) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const subEndpoint = `/admin/specialities/${id}/sub-specialities`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader
        title={speciality.nameAr}
        subtitle={speciality.nameEn}
        backPath="/specialities"
        badges={[
          {
            label: speciality.isActive !== false ? t('common.active') : t('common.inactive'),
            className: speciality.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600',
          },
        ]}
      />

      <DetailsSection title={t('specialities.details')} icon={Activity}>
        <DetailItem label={t('specialities.name_ar')} value={speciality.nameAr} />
        <DetailItem label={t('specialities.name_en')} value={speciality.nameEn} />
        <DetailItem label={t('common.sort_order')} value={speciality.sortOrder ?? 0} />
        <DetailItem
          label={t('common.status')}
          value={
            <Badge variant={speciality.isActive !== false ? 'success' : 'secondary'}>
              {speciality.isActive !== false ? t('common.active') : t('common.inactive')}
            </Badge>
          }
        />
        <DetailItem label={t('specialities.description_ar')} value={speciality.descriptionAr || '—'} fullWidth />
        <DetailItem label={t('specialities.description_en')} value={speciality.descriptionEn || '—'} fullWidth />
      </DetailsSection>

      <CrudPage
        embedded
        title={t('specialities.sub_specialities')}
        subtitle={t('specialities.sub_specialities_subtitle')}
        endpoint={subEndpoint}
        queryKey={`admin-sub-specialities-${id}`}
        createLabel={t('specialities.add_sub_speciality')}
        editLabel={t('specialities.edit_sub_speciality')}
        deleteConfirmMessage={t('specialities.delete_sub_speciality_confirm')}
        columns={[
          { key: 'id', label: '#' },
          { key: 'nameAr', label: t('specialities.name_ar') },
          { key: 'nameEn', label: t('specialities.name_en') },
          { key: 'sortOrder', label: t('common.sort_order') },
          {
            key: 'isActive',
            label: t('common.status'),
            render: (row) => (
              <Badge variant={row.isActive ? 'success' : 'secondary'}>
                {row.isActive ? t('common.active') : t('common.inactive')}
              </Badge>
            ),
            exportValue: (row) => (row.isActive ? t('common.active') : t('common.inactive')),
          },
        ]}
        formFields={[
          { name: 'nameAr', label: t('specialities.name_ar'), required: true },
          { name: 'nameEn', label: t('specialities.name_en'), required: true },
          { name: 'descriptionAr', label: t('specialities.description_ar'), type: 'textarea', fullWidth: true },
          { name: 'descriptionEn', label: t('specialities.description_en'), type: 'textarea', fullWidth: true },
          { name: 'sortOrder', label: t('common.sort_order'), type: 'number', defaultValue: 0 },
          { name: 'isActive', label: t('common.is_active'), type: 'boolean', defaultValue: true },
        ]}
        invalidateQueryKeys={['admin-specialities']}
      />
    </div>
  );
}
