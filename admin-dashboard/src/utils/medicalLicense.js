import { guessMimeType, resolveUploadUrl } from './uploads';

export { resolveUploadUrl } from './uploads';

export function getLicenseDocuments(doctor) {
  return (doctor?.verificationDocuments || [])
    .filter((doc) => doc.fileType === 'LICENSE')
    .map((doc) => {
      const url = resolveUploadUrl(doc.fileUrl);
      return {
        url,
        name: doc.fileType || 'LICENSE',
        mimeType: doc.mimeType || guessMimeType(url),
      };
    });
}

export function formatLicenseExpiryDate(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function isLicenseExpired(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}
