const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export function resolveUploadUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export function getLicenseDocuments(doctor) {
  return (doctor?.verificationDocuments || [])
    .filter((doc) => doc.fileType === 'LICENSE')
    .map((doc) => ({
      url: resolveUploadUrl(doc.fileUrl),
      name: doc.fileType,
      mimeType: doc.mimeType,
    }));
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
