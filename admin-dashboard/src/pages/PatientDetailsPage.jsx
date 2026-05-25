import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { User, Activity, Shield, Users, FileText, Pill, ClipboardList, Paperclip, Clock, HeartPulse, AlertTriangle } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import FilePreviewer from '../components/ui/FilePreviewer';
import MedicalProfileCatalogTab from '../components/medical/MedicalProfileCatalogTab';
import MedicalProfileAttachments from '../components/medical/MedicalProfileAttachments';
import PatientInsuranceTab from '../components/patients/PatientInsuranceTab';
import { useAuth } from '../hooks/useAuth';
import { canAccess, ROUTE_PERMISSIONS as P } from '../auth/permissions';

export default function PatientDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { permissions, role } = useAuth();
  const [activeTab, setActiveTab] = React.useState('summary');
  const showInsuranceTab = canAccess(
    { permissions, role },
    { permission: P.patientsInsurance, anyOf: [P.patients] },
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/admin/patients/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const patient = response?.data;

  if (!patient) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const mp = patient.medicalProfile;

  const tabs = [
    { id: 'summary', label: t('common.summary') || 'Summary', icon: Activity },
    ...(showInsuranceTab ? [{ id: 'insurance', label: t('patients.tab_insurance') || 'Insurance', icon: Shield }] : []),
    { id: 'diseases', label: t('patients.tab_diseases') || 'Diseases', icon: HeartPulse },
    { id: 'medications', label: t('patients.tab_medications') || 'Medications', icon: Pill },
    { id: 'allergies', label: t('patients.tab_allergies') || 'Allergies', icon: AlertTriangle },
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
        <DetailItem label={t('medical.summary') || 'Notes'} value={mp?.notes || '—'} fullWidth />
        <DetailItem label={t('medical.clinical_findings') || 'Surgeries'} value={mp?.surgeries || '—'} fullWidth />
        <DetailItem label={t('patients.family_members') || 'Family History'} value={mp?.familyHistory || '—'} fullWidth />
      </DetailsSection>

      <div className="lg:col-span-2">
        <DetailsSection title={t('patients.report_attachments') || 'Medical Report Attachments'} icon={Paperclip}>
          <div className="col-span-full">
            <MedicalProfileAttachments
              patientId={patient.id}
              attachments={mp?.reportAttachments || []}
            />
          </div>
        </DetailsSection>
      </div>

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
      <FilePreviewer files={patient.medicalFiles?.map(f => ({ url: f.fileUrl, name: f.title, type: f.category, mimeType: f.mimeType })) || []} height="600px" />
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
        {activeTab === 'insurance' && showInsuranceTab && <PatientInsuranceTab patientId={patient.id} />}
        {activeTab === 'diseases' && (
          <MedicalProfileCatalogTab
            patientId={patient.id}
            catalogEndpoint="/admin/chronic-diseases"
            idsField="chronicDiseaseIds"
            items={mp?.chronicDiseases}
            medicalProfile={mp}
            title={t('patients.tab_diseases')}
          />
        )}
        {activeTab === 'medications' && (
          <MedicalProfileCatalogTab
            patientId={patient.id}
            catalogEndpoint="/admin/medications"
            idsField="medicationIds"
            items={mp?.medications}
            medicalProfile={mp}
            title={t('patients.tab_medications')}
          />
        )}
        {activeTab === 'allergies' && (
          <MedicalProfileCatalogTab
            patientId={patient.id}
            catalogEndpoint="/admin/allergies"
            idsField="allergyIds"
            items={mp?.allergies}
            medicalProfile={mp}
            title={t('patients.tab_allergies')}
          />
        )}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'files' && renderFiles()}
      </div>
    </div>
  );
}
