import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import FilePreviewer from '../components/ui/FilePreviewer';
import MedicalLicensePreview from '../components/doctors/MedicalLicensePreview';
import Tabs from '../components/ui/Tabs';
import {
  Stethoscope, FileText, Briefcase, Activity, CheckCircle, Clock,
  UserCheck, UserX, Pill, ClipboardList, Calendar, FlaskConical,
} from 'lucide-react';
import RelatedRecordCard from '../components/ui/RelatedRecordCard';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';
import { resolveUploadUrl } from '../utils/uploads';

export default function DoctorDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState('summary');

  const { data: response, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/admin/doctors/${id}`).then(res => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.patch(`/admin/doctors/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctor', id]);
      toast.success(t('doctors.approved_success') || 'Doctor approved successfully');
    },
    onError: () => toast.error(t('common.error') || 'An error occurred'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.patch(`/admin/doctors/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['doctor', id]);
      toast.success(t('doctors.rejected_success') || 'Doctor rejected successfully');
    },
    onError: () => toast.error(t('common.error') || 'An error occurred'),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const doctor = response?.data;

  if (!doctor) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const documents = doctor.verificationDocuments?.map((d) => ({
    url: d.fileUrl,
    name: d.fileType || 'Document',
    mimeType: d.mimeType,
  })) || [];

  const actions = [];
  if (doctor.verificationStatus === 'PENDING') {
    actions.push(
      {
        label: t('common.approve') || 'Approve',
        icon: UserCheck,
        onClick: () => approveMutation.mutate(),
        className: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800',
      },
      {
        label: t('common.reject') || 'Reject',
        icon: UserX,
        onClick: () => rejectMutation.mutate(),
        className: 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 border-rose-100 dark:border-rose-800',
      },
    );
  }

  const tabs = [
    { id: 'summary', label: t('common.summary') || 'Summary', icon: Activity },
    { id: 'appointments', label: t('sidebar.appointments') || 'Appointments', icon: Calendar },
    { id: 'lab_tests', label: t('medical.test_requests') || 'Test requests', icon: FlaskConical },
    { id: 'prescriptions', label: t('medical.prescriptions') || 'Prescriptions', icon: Pill },
    { id: 'reports', label: t('medical.reports') || 'Reports', icon: ClipboardList },
  ];

  const formatDateTime = (appt) => {
    const date = new Date(appt.appointmentDate).toLocaleDateString();
    const time = appt.startTime ? `${appt.startTime}${appt.endTime ? ` - ${appt.endTime}` : ''}` : '';
    return time ? `${date} • ${time}` : date;
  };

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
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">{t('doctors.available')}</span>
              <Badge variant={doctor.isAvailable ? 'success' : 'secondary'}>{doctor.isAvailable ? 'Yes' : 'No'}</Badge>
            </div>
          </div>
        </div>

        <DetailsSection title={t('doctors.fees') || 'Service Fees'} icon={Activity}>
          <DetailItem label={t('doctors.consultation_fee')} value={formatCurrency(doctor.consultationFee, t)} />
          <DetailItem label={t('doctors.follow_up_fee')} value={formatCurrency(doctor.followUpFee, t)} />
        </DetailsSection>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <MedicalLicensePreview doctor={doctor} />

        {doctor.subSpecialities?.length > 0 && (
          <DetailsSection title={t('doctors.sub_specialities') || 'Sub-specialities'} icon={Stethoscope}>
            {doctor.subSpecialities.map((sub) => (
              <div key={sub.id} className="col-span-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">{sub.nameAr}</p>
                <p className="text-xs text-[var(--text-muted)]">{sub.nameEn}</p>
                {(sub.descriptionAr || sub.descriptionEn) && (
                  <p className="text-sm mt-2 text-[var(--text-secondary)]">{sub.descriptionAr || sub.descriptionEn}</p>
                )}
              </div>
            ))}
          </DetailsSection>
        )}

        <DetailsSection title={t('doctors.professional_info') || 'Professional Information'} icon={Stethoscope}>
          <DetailItem label={t('doctors.title')} value={doctor.title} />
          <DetailItem label={t('doctors.speciality')} value={doctor.speciality?.nameAr} />
          <DetailItem label={t('doctors.bio')} value={doctor.bioAr || doctor.bio} fullWidth />
        </DetailsSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DetailsSection title={t('doctors.services') || 'Offered Services'} icon={Briefcase}>
              {doctor.doctorServices?.map((ds, idx) => (
                <div key={idx} className="p-2 bg-primary-50/80 border border-primary-100 rounded-xl flex items-center gap-3">
                  <CheckCircle size={14} className="text-primary-600" />
                  <span className="text-sm font-medium">{ds.service?.nameAr}</span>
                </div>
              )) || <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
            </DetailsSection>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 px-1">
              <FileText size={16} className="text-primary-600" />
              {t('doctors.documents') || 'Verification Documents'}
            </h3>
            <FilePreviewer files={documents} height="400px" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {doctor.appointments?.length > 0 ? doctor.appointments.map((appt) => (
        <Link
          key={appt.id}
          to={`/appointments/${appt.id}`}
          className="block bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{appt.patient?.user?.fullName}</h3>
              <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
                <Clock size={14} /> {formatDateTime(appt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary">{appt.status}</Badge>
              <span className="text-xs text-[var(--text-muted)]">{appt.appointmentType}</span>
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {appt.service?.nameAr || appt.service?.nameEn} • {formatCurrency(appt.amount, t)}
          </p>
        </Link>
      )) : (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
          {t('common.no_data')}
        </div>
      )}
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {doctor.prescriptions?.length > 0 ? doctor.prescriptions.map((px) => (
        <RelatedRecordCard
          key={px.id}
          title={px.diagnosis}
          subtitle={`${new Date(px.createdAt).toLocaleDateString()} • ${px.patient?.user?.fullName}`}
          detailPath={`/prescriptions/${px.id}`}
          appointment={px.appointment}
          appointmentId={px.appointmentId}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {px.items?.map((item) => (
              <div key={item.id} className="p-3 bg-primary-50/80 rounded-xl border border-primary-100">
                <p className="font-bold text-primary-700">{item.medicineName}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.dosage} • {item.frequency} • {item.duration}</p>
              </div>
            ))}
          </div>
          {px.pdfUrl && (
            <a href={resolveUploadUrl(px.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 btn btn-secondary py-1.5 px-3 text-xs">
              <FileText size={14} /> PDF
            </a>
          )}
        </RelatedRecordCard>
      )) : (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
          {t('common.no_data')}
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {doctor.reports?.length > 0 ? doctor.reports.map((report) => (
        <RelatedRecordCard
          key={report.id}
          title={report.visitReason}
          subtitle={`${new Date(report.createdAt).toLocaleDateString()} • ${report.patient?.user?.fullName}`}
          detailPath={`/reports/${report.id}`}
          appointment={report.appointment}
          appointmentId={report.appointmentId}
        >
          {report.diagnosis && (
            <p className="text-sm"><span className="font-semibold">{t('medical.diagnosis')}: </span>{report.diagnosis}</p>
          )}
          {report.pdfUrl && (
            <a href={resolveUploadUrl(report.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 btn btn-secondary py-1.5 px-3 text-xs">
              <FileText size={14} /> PDF
            </a>
          )}
        </RelatedRecordCard>
      )) : (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
          {t('common.no_data')}
        </div>
      )}
    </div>
  );

  const renderLabTests = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {doctor.labTestRequests?.length > 0 ? doctor.labTestRequests.map((test) => (
        <RelatedRecordCard
          key={test.id}
          title={test.title}
          subtitle={`${new Date(test.requestedAt || test.createdAt).toLocaleDateString()} • ${test.patient?.user?.fullName}`}
          status={test.status}
          detailPath={`/lab-tests/${test.id}`}
          appointment={test.appointment}
          appointmentId={test.appointmentId}
          meta={test.notes}
        />
      )) : (
        <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
          {t('common.no_data')}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DetailsHeader
        title={doctor.user?.fullName}
        subtitle={`${doctor.title} • ${doctor.speciality?.nameAr}`}
        backPath="/doctors"
        actions={actions}
        badges={[
          {
            label: t(`status.${doctor.verificationStatus?.toLowerCase()}`),
            className: doctor.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
          },
        ]}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pb-8">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'lab_tests' && renderLabTests()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
}
