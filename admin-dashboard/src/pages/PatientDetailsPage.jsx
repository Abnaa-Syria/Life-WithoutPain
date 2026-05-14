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
import { User, Activity, Shield, Users, FileText, Pill, ClipboardList, Paperclip } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import FilePreviewer from '../components/ui/FilePreviewer';

export default function PatientDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = React.useState('summary');

  const { data: response, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/admin/patients/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const patient = response?.data;

  if (!patient) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const tabs = [
    { id: 'summary', label: t('common.summary') || 'Summary', icon: Activity },
    { id: 'prescriptions', label: t('medical.prescriptions') || 'Prescriptions', icon: Pill },
    { id: 'reports', label: t('medical.reports') || 'Reports', icon: ClipboardList },
    { id: 'files', label: t('common.attachments') || 'Attachments', icon: Paperclip },
  ];

  const renderSummary = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DetailsSection title={t('patients.personal_info') || 'Personal Information'} icon={User}>
        <DetailItem label={t('patients.full_name')} value={patient.user?.fullName} />
        <DetailItem label={t('patients.email')} value={patient.user?.email} />
        <DetailItem label={t('patients.phone')} value={patient.user?.phone} />
        <DetailItem label={t('patients.gender')} value={patient.gender} render={(v) => t(`common.${v?.toLowerCase()}`) || v} />
        <DetailItem label={t('patients.city')} value={patient.city} />
        <DetailItem label={t('patients.address')} value={patient.address} fullWidth />
      </DetailsSection>

      <DetailsSection title={t('patients.medical_profile') || 'Medical Profile'} icon={Activity}>
        <DetailItem label={t('patients.blood_type')} value={patient.bloodType} />
        <DetailItem label={t('patients.height')} value={`${patient.height} cm`} />
        <DetailItem label={t('patients.weight')} value={`${patient.weight} kg`} />
        <DetailItem label={t('patients.allergies') || 'Allergies'} value={patient.medicalProfile?.allergies || 'None'} fullWidth />
        <DetailItem label={t('patients.chronic_diseases') || 'Chronic Diseases'} value={patient.medicalProfile?.chronicDiseases || 'None'} fullWidth />
        <DetailItem label={t('patients.medications') || 'Main Medications'} value={patient.medicalProfile?.currentMedications || 'None'} fullWidth />
      </DetailsSection>

      <DetailsSection title={t('patients.insurance_info') || 'Insurance Information'} icon={Shield}>
        {patient.insurances?.length > 0 ? patient.insurances.map((ins, idx) => (
          <React.Fragment key={idx}>
            <DetailItem label={t('insurance.provider')} value={ins.provider?.nameAr} />
            <DetailItem label={t('insurance.policy_number') || 'Policy Number'} value={ins.policyNumber} />
            <DetailItem label={t('insurance.expiry_date') || 'Expiry Date'} value={new Date(ins.expiryDate).toLocaleDateString()} />
          </React.Fragment>
        )) : <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
      </DetailsSection>

      <DetailsSection title={t('patients.family_members') || 'Family Members'} icon={Users}>
        {patient.familyMembers?.length > 0 ? patient.familyMembers.map((member, idx) => (
          <React.Fragment key={idx}>
            <DetailItem label={t('common.name')} value={member.fullName} />
            <DetailItem label={t('common.relationship') || 'Relationship'} value={member.relationship} />
            <DetailItem label={t('patients.phone')} value={member.phone} />
          </React.Fragment>
        )) : <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
      </DetailsSection>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {patient.prescriptions?.length > 0 ? patient.prescriptions.map((px) => (
        <div key={px.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{px.diagnosis}</h3>
              <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
                <Clock size={14} /> {new Date(px.createdAt).toLocaleDateString()} • {px.doctor?.user?.fullName}
              </p>
            </div>
            {px.pdfUrl && (
              <a href={px.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary py-1.5 px-3 text-xs">
                <FileText size={14} /> PDF
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {px.items?.map((item) => (
              <div key={item.id} className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                <p className="font-bold text-indigo-700 dark:text-indigo-400">{item.medicineName}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.dosage} • {item.frequency} • {item.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )) : <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">{t('common.no_data')}</div>}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {patient.reports?.length > 0 ? patient.reports.map((report) => (
        <div key={report.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{report.visitReason}</h3>
              <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
                <Clock size={14} /> {new Date(report.createdAt).toLocaleDateString()} • {report.doctor?.user?.fullName}
              </p>
            </div>
            {report.pdfUrl && (
              <a href={report.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary py-1.5 px-3 text-xs">
                <FileText size={14} /> PDF
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-muted)] mb-2">{t('medical.symptoms') || 'Symptoms'}</h4>
              <p className="text-sm">{report.symptoms}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--text-muted)] mb-2">{t('medical.diagnosis') || 'Diagnosis'}</h4>
              <p className="text-sm">{report.diagnosis}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-[var(--text-muted)] mb-2">{t('medical.summary') || 'Summary'}</h4>
              <p className="text-sm">{report.summary}</p>
            </div>
          </div>
        </div>
      )) : <div className="p-12 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">{t('common.no_data')}</div>}
    </div>
  );

  const renderFiles = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FilePreviewer files={patient.medicalFiles?.map(f => ({ url: f.fileUrl, name: f.title, type: f.category })) || []} height="600px" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DetailsHeader 
        title={patient.user?.fullName}
        subtitle={patient.user?.email}
        backPath="/patients"
        badges={[{ label: t('sidebar.patients'), className: 'bg-indigo-100 text-indigo-700' }]}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pb-8">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'files' && renderFiles()}
      </div>
    </div>
  );
}
