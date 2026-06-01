import React from 'react';
import { useTranslation } from 'react-i18next';
import { IdCard } from 'lucide-react';
import DetailsSection from '../ui/DetailsSection';
import DetailItem from '../ui/DetailItem';
import FilePreviewer from '../ui/FilePreviewer';
import Badge from '../ui/Badge';
import {
  formatLicenseExpiryDate,
  getLicenseDocuments,
  isLicenseExpired,
} from '../../utils/medicalLicense';

export default function MedicalLicensePreview({ doctor, asSection = true }) {
  const { t, i18n } = useTranslation();
  const licenseFiles = getLicenseDocuments(doctor);
  const expired = isLicenseExpired(doctor?.licenseExpiryDate);
  const expiryLabel = formatLicenseExpiryDate(doctor?.licenseExpiryDate, i18n.language);

  const content = (
    <>
      <DetailItem
        label={t('doctors.license_number')}
        value={doctor?.licenseNumber || '—'}
      />
      <DetailItem
        label={t('doctors.license_expiry_date')}
        value={
          <span className="inline-flex items-center gap-2">
            {expiryLabel}
            {doctor?.licenseExpiryDate && (
              <Badge variant={expired ? 'danger' : 'success'}>
                {expired ? t('doctors.license_expired') : t('doctors.license_valid')}
              </Badge>
            )}
          </span>
        }
      />
      <DetailItem label={t('doctors.workplace')} value={doctor?.workplace || '—'} />
      <DetailItem label={t('doctors.city')} value={doctor?.city || '—'} />
      <DetailItem
        label={t('doctors.license_attachment')}
        value={<FilePreviewer files={licenseFiles} height="360px" />}
        fullWidth
      />
    </>
  );

  if (!asSection) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{content}</div>;
  }

  return (
    <DetailsSection title={t('doctors.medical_license')} icon={IdCard}>
      {content}
    </DetailsSection>
  );
}
