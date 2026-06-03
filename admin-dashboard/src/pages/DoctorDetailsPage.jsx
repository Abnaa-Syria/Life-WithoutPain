import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import StatusBadge from '../components/ui/StatusBadge';
import Avatar from '../components/ui/Avatar';
import FilePreviewer from '../components/ui/FilePreviewer';
import MedicalLicensePreview from '../components/doctors/MedicalLicensePreview';
import Tabs from '../components/ui/Tabs';
import {
  Stethoscope, FileText, Briefcase, Activity, CheckCircle,
  UserCheck, UserX, Pill, ClipboardList, Calendar, FlaskConical,
} from 'lucide-react';
import EntityMedicalRecordsTab from '../components/medical/EntityMedicalRecordsTab';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';
import {
  DEFAULT_DOCTOR_SECTION,
  DOCTOR_DETAIL_SECTIONS,
  isValidDoctorSection,
} from '../config/doctorDetailSections';

const SECTION_ICONS = {
  Activity, Calendar, FlaskConical, Pill, ClipboardList,
};

export default function DoctorDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id, section: sectionParam } = useParams();
  const activeSection = sectionParam || DEFAULT_DOCTOR_SECTION;
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/admin/doctors/${id}`).then((res) => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.patch(`/admin/doctors/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctor', id]);
      toast.success(t('doctors.approved_success'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.patch(`/admin/doctors/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctor', id]);
      toast.success(t('doctors.rejected_success'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const tabs = useMemo(
    () => DOCTOR_DETAIL_SECTIONS.map((s) => ({
      id: s.id,
      label: t(s.translationKey),
      icon: SECTION_ICONS[s.icon],
    })),
    [t],
  );

  if (!isValidDoctorSection(activeSection)) {
    return <Navigate to={`/doctors/${id}/${DEFAULT_DOCTOR_SECTION}`} replace />;
  }

  if (isLoading) return <LoadingSkeleton type="table" />;
  const doctor = response?.data;
  if (!doctor) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const backBasePath = `/doctors/${id}`;
  const documents = doctor.verificationDocuments?.map((d) => ({
    url: d.fileUrl,
    name: d.fileType || 'Document',
    mimeType: d.mimeType,
  })) || [];

  const actions = [];
  if (doctor.verificationStatus === 'PENDING') {
    actions.push(
      {
        label: t('common.approve'),
        icon: UserCheck,
        onClick: () => approveMutation.mutate(),
        className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800',
      },
      {
        label: t('common.reject'),
        icon: UserX,
        onClick: () => rejectMutation.mutate(),
        className: 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 border-rose-100 dark:border-rose-800',
      },
    );
  }

  const renderSummary = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
          <Avatar name={doctor.user?.fullName} size="xl" className="mb-4 ring-4 ring-primary-100" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{doctor.user?.fullName}</h2>
          <p className="text-[var(--text-muted)] text-sm mb-2">{doctor.speciality?.nameAr}</p>
          {doctor.subSpecialities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mb-4 px-2">
              {doctor.subSpecialities.map((sub) => (
                <Badge key={sub.id} variant="secondary">{sub.nameAr}</Badge>
              ))}
            </div>
          )}
          <div className="w-full pt-6 border-t border-[var(--border-color)] space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{t('doctors.rating')}</span>
              <span className="font-bold text-amber-500">★ {doctor.ratingAverage?.toFixed(1) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{t('doctors.consultations')}</span>
              <span className="font-semibold">{doctor.ratingCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-[var(--text-muted)]">{t('doctors.available')}</span>
              <StatusBadge status={doctor.isAvailable ? 'ACTIVE' : 'INACTIVE'} />
            </div>
          </div>
        </div>
        <DetailsSection title={t('doctors.fees')} icon={Activity}>
          <DetailItem label={t('doctors.consultation_fee')} value={formatCurrency(doctor.consultationFee, t)} />
          <DetailItem label={t('doctors.follow_up_fee')} value={formatCurrency(doctor.followUpFee, t)} />
        </DetailsSection>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <MedicalLicensePreview doctor={doctor} />
        {doctor.subSpecialities?.length > 0 && (
          <DetailsSection title={t('doctors.sub_specialities')} icon={Stethoscope}>
            {doctor.subSpecialities.map((sub) => (
              <div key={sub.id} className="col-span-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">{sub.nameAr}</p>
                <p className="text-xs text-[var(--text-muted)]">{sub.nameEn}</p>
              </div>
            ))}
          </DetailsSection>
        )}
        <DetailsSection title={t('doctors.professional_info')} icon={Stethoscope}>
          <DetailItem label={t('doctors.title')} value={doctor.title} />
          <DetailItem label={t('doctors.speciality')} value={doctor.speciality?.nameAr} />
          <DetailItem label={t('doctors.bio')} value={doctor.bioAr || doctor.bio} fullWidth />
        </DetailsSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailsSection title={t('doctors.services')} icon={Briefcase}>
            {doctor.doctorServices?.map((ds, idx) => (
              <div key={idx} className="p-2 bg-primary-50/80 border border-primary-100 rounded-xl flex items-center gap-3">
                <CheckCircle size={14} className="text-primary-600" />
                <span className="text-sm font-medium">{ds.service?.nameAr}</span>
              </div>
            )) || <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
          </DetailsSection>
          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 px-1">
              <FileText size={16} className="text-primary-600" />
              {t('doctors.documents')}
            </h3>
            <FilePreviewer files={documents} height="400px" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DetailsHeader
        title={doctor.user?.fullName}
        subtitle={`${doctor.title} • ${doctor.speciality?.nameAr}`}
        backPath="/doctors"
        actions={actions}
        badges={[{ status: doctor.verificationStatus }]}
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSection}
        onChange={(tabId) => navigate(`/doctors/${id}/${tabId}`)}
      />

      <div className="pb-8">
        {activeSection === 'summary' && renderSummary()}
        {activeSection === 'appointments' && (
          <EntityMedicalRecordsTab
            type="appointments"
            entityKind="doctor"
            entityId={doctor.id}
            embeddedItems={doctor.appointments || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'prescriptions' && (
          <EntityMedicalRecordsTab
            type="prescriptions"
            entityKind="doctor"
            entityId={doctor.id}
            embeddedItems={doctor.prescriptions || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'reports' && (
          <EntityMedicalRecordsTab
            type="reports"
            entityKind="doctor"
            entityId={doctor.id}
            embeddedItems={doctor.reports || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'lab-tests' && (
          <EntityMedicalRecordsTab
            type="lab-tests"
            entityKind="doctor"
            entityId={doctor.id}
            embeddedItems={doctor.labTestRequests || []}
            backBasePath={backBasePath}
          />
        )}
      </div>
    </div>
  );
}
