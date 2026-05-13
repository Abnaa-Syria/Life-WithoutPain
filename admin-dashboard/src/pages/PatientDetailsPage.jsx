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
import { User, Activity, Shield, Users } from 'lucide-react';

export default function PatientDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => api.get(`/admin/patients/${id}`).then(res => res.data),
  });

  if (isLoading) return <LoadingSkeleton type="table" />;
  const patient = response?.data;

  if (!patient) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DetailsHeader 
        title={patient.user?.fullName}
        subtitle={patient.user?.email}
        backPath="/patients"
        badges={[{ label: t('sidebar.patients'), className: 'bg-indigo-100 text-indigo-700' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
}
