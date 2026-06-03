import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import {
  User, Activity, Shield, Users, Paperclip, HeartPulse, AlertTriangle,
  Pill, ClipboardList, FlaskConical, Calendar,
} from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import FilePreviewer from '../components/ui/FilePreviewer';
import MedicalProfileCatalogTab from '../components/medical/MedicalProfileCatalogTab';
import MedicalProfileAttachments from '../components/medical/MedicalProfileAttachments';
import PatientInsuranceTab from '../components/patients/PatientInsuranceTab';
import EntityMedicalRecordsTab from '../components/medical/EntityMedicalRecordsTab';
import { useAuth } from '../hooks/useAuth';
import { canAccess, ROUTE_PERMISSIONS as P } from '../auth/permissions';
import {
  DEFAULT_PATIENT_SECTION,
  PATIENT_DETAIL_SECTIONS,
  isValidPatientSection,
} from '../config/patientDetailSections';

const SECTION_ICONS = {
  Activity, Shield, HeartPulse, Pill, AlertTriangle, Calendar, ClipboardList, FlaskConical, Paperclip,
};

export default function PatientDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id, section: sectionParam } = useParams();
  const activeSection = sectionParam || DEFAULT_PATIENT_SECTION;
  const { permissions, role } = useAuth();
  const showInsuranceTab = canAccess(
    { permissions, role },
    { permission: P.patientsInsurance, anyOf: [P.patients] },
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/admin/patients/${id}`).then((res) => res.data),
  });

  const tabs = useMemo(() => PATIENT_DETAIL_SECTIONS
    .filter((s) => (s.id !== 'insurance' || showInsuranceTab))
    .map((s) => ({
      id: s.id,
      label: t(s.translationKey),
      icon: SECTION_ICONS[s.icon],
    })), [t, showInsuranceTab]);

  if (!isValidPatientSection(activeSection) || (activeSection === 'insurance' && !showInsuranceTab)) {
    return <Navigate to={`/patients/${id}/${DEFAULT_PATIENT_SECTION}`} replace />;
  }

  if (isLoading) return <LoadingSkeleton type="table" />;
  const patient = response?.data;
  if (!patient) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  const mp = patient.medicalProfile;
  const backBasePath = `/patients/${id}`;

  const renderSummary = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DetailsSection title={t('patients.personal_info')} icon={User}>
        <DetailItem label={t('patients.full_name')} value={patient.user?.fullName} />
        <DetailItem label={t('patients.email')} value={patient.user?.email} />
        <DetailItem label={t('patients.phone')} value={patient.user?.phone} />
        <DetailItem label={t('patients.gender')} value={patient.gender} render={(v) => t(`common.${v?.toLowerCase()}`) || v} />
        <DetailItem label={t('patients.city')} value={patient.city} />
        <DetailItem label={t('patients.address')} value={patient.address} fullWidth />
      </DetailsSection>
      <DetailsSection title={t('patients.medical_profile')} icon={Activity}>
        <DetailItem label={t('patients.blood_type')} value={patient.bloodType} />
        <DetailItem label={t('patients.height')} value={`${patient.height} cm`} />
        <DetailItem label={t('patients.weight')} value={`${patient.weight} kg`} />
        <DetailItem label={t('medical.summary')} value={mp?.notes || '—'} fullWidth />
        <DetailItem label={t('medical.clinical_findings')} value={mp?.surgeries || '—'} fullWidth />
        <DetailItem label={t('patients.family_members')} value={mp?.familyHistory || '—'} fullWidth />
      </DetailsSection>
      <div className="lg:col-span-2">
        <DetailsSection title={t('patients.report_attachments')} icon={Paperclip}>
          <div className="col-span-full">
            <MedicalProfileAttachments patientId={patient.id} attachments={mp?.reportAttachments || []} />
          </div>
        </DetailsSection>
      </div>
      <DetailsSection title={t('patients.family_members')} icon={Users}>
        {patient.familyMembers?.length > 0 ? patient.familyMembers.map((member, idx) => (
          <React.Fragment key={idx}>
            <DetailItem label={t('common.name')} value={member.fullName} />
            <DetailItem label={t('common.relationship')} value={member.relationType || member.relationship} />
            <DetailItem label={t('patients.phone')} value={member.phone} />
          </React.Fragment>
        )) : <div className="col-span-full text-center text-[var(--text-muted)] py-4">{t('common.no_data')}</div>}
      </DetailsSection>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DetailsHeader
        title={patient.user?.fullName}
        subtitle={patient.user?.email}
        backPath="/patients"
        badges={[{ label: t('sidebar.patients'), className: 'badge-info' }]}
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSection}
        onChange={(tabId) => navigate(`/patients/${id}/${tabId}`)}
      />

      <div className="pb-8">
        {activeSection === 'summary' && renderSummary()}
        {activeSection === 'insurance' && showInsuranceTab && <PatientInsuranceTab patientId={patient.id} />}
        {activeSection === 'diseases' && (
          <MedicalProfileCatalogTab
            patientId={patient.id}
            catalogEndpoint="/admin/chronic-diseases"
            idsField="chronicDiseaseIds"
            items={mp?.chronicDiseases}
            medicalProfile={mp}
            title={t('patients.tab_diseases')}
          />
        )}
        {activeSection === 'medications' && (
          <MedicalProfileCatalogTab
            patientId={patient.id}
            catalogEndpoint="/admin/medications"
            idsField="medicationIds"
            items={mp?.medications}
            medicalProfile={mp}
            title={t('patients.tab_medications')}
          />
        )}
        {activeSection === 'allergies' && (
          <MedicalProfileCatalogTab
            patientId={patient.id}
            catalogEndpoint="/admin/allergies"
            idsField="allergyIds"
            items={mp?.allergies}
            medicalProfile={mp}
            title={t('patients.tab_allergies')}
          />
        )}
        {activeSection === 'appointments' && (
          <EntityMedicalRecordsTab
            type="appointments"
            entityKind="patient"
            entityId={patient.id}
            embeddedItems={patient.appointments || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'prescriptions' && (
          <EntityMedicalRecordsTab
            type="prescriptions"
            entityKind="patient"
            entityId={patient.id}
            embeddedItems={patient.prescriptions || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'reports' && (
          <EntityMedicalRecordsTab
            type="reports"
            entityKind="patient"
            entityId={patient.id}
            embeddedItems={patient.reports || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'lab-tests' && (
          <EntityMedicalRecordsTab
            type="lab-tests"
            entityKind="patient"
            entityId={patient.id}
            embeddedItems={patient.labTests || []}
            backBasePath={backBasePath}
          />
        )}
        {activeSection === 'files' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FilePreviewer
              files={patient.medicalFiles?.map((f) => ({ url: f.fileUrl, name: f.title, type: f.category, mimeType: f.mimeType })) || []}
              height="600px"
            />
          </div>
        )}
      </div>
    </div>
  );
}
