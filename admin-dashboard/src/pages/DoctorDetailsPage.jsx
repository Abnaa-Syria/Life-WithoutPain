import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import FilePreviewer from '../components/ui/FilePreviewer';
import { Stethoscope, FileText, Briefcase, Activity, CheckCircle, Clock, Maximize2 } from 'lucide-react';

export default function DoctorDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/admin/doctors/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const doctor = response?.data;

  if (!doctor) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const documents = doctor.verificationDocuments?.map(d => ({ url: d.fileUrl, name: d.type })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={doctor.user?.fullName}
        subtitle={`${doctor.title} • ${doctor.speciality?.nameAr}`}
        backPath="/doctors"
        badges={[
          { label: t(`status.${doctor.verificationStatus?.toLowerCase()}`), className: doctor.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
            <Avatar name={doctor.user?.fullName} size="xl" className="mb-4 ring-4 ring-indigo-50 dark:ring-indigo-900/20" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{doctor.user?.fullName}</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">{doctor.speciality?.nameAr}</p>
            
            <div className="w-full pt-6 border-t border-[var(--border-color)] space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('doctors.rating')}</span>
                <span className="font-bold text-amber-500">★ {doctor.ratingAverage?.toFixed(1) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('doctors.consultations')}</span>
                <span className="font-semibold">{doctor.ratingCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('doctors.available')}</span>
                <Badge variant={doctor.isAvailable ? 'success' : 'secondary'}>{doctor.isAvailable ? 'Yes' : 'No'}</Badge>
              </div>
            </div>
          </div>

          <DetailsSection title={t('doctors.fees') || 'Service Fees'} icon={Activity}>
            <DetailItem label={t('doctors.consultation_fee')} value={`${doctor.consultationFee} ر.س`} />
            <DetailItem label={t('doctors.follow_up_fee')} value={`${doctor.followUpFee} ر.س`} />
          </DetailsSection>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DetailsSection title={t('doctors.professional_info') || 'Professional Information'} icon={Stethoscope}>
            <DetailItem label={t('doctors.title')} value={doctor.title} />
            <DetailItem label={t('doctors.speciality')} value={doctor.speciality?.nameAr} />
            <DetailItem label={t('doctors.city')} value={doctor.city} />
            <DetailItem label={t('doctors.bio')} value={doctor.bio} fullWidth />
          </DetailsSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <DetailsSection title={t('doctors.services') || 'Offered Services'} icon={Briefcase}>
                {doctor.doctorServices?.map((ds, idx) => (
                  <div key={idx} className="p-2 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-xl flex items-center gap-3">
                    <CheckCircle size={14} className="text-indigo-600" />
                    <span className="text-sm font-medium">{ds.service?.nameAr}</span>
                  </div>
                )) || <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
              </DetailsSection>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 px-1">
                <FileText size={16} className="text-indigo-600" />
                {t('doctors.documents') || 'Verification Documents'}
              </h3>
              <FilePreviewer files={documents} height="400px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
