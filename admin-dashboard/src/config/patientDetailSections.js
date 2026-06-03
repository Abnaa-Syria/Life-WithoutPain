export const DEFAULT_PATIENT_SECTION = 'summary';

export const PATIENT_DETAIL_SECTIONS = [
  { id: 'summary', translationKey: 'common.summary', icon: 'Activity' },
  { id: 'insurance', translationKey: 'patients.tab_insurance', icon: 'Shield', requiresInsurance: true },
  { id: 'diseases', translationKey: 'patients.tab_diseases', icon: 'HeartPulse' },
  { id: 'medications', translationKey: 'patients.tab_medications', icon: 'Pill' },
  { id: 'allergies', translationKey: 'patients.tab_allergies', icon: 'AlertTriangle' },
  { id: 'appointments', translationKey: 'patients.tab_appointments', icon: 'Calendar' },
  { id: 'prescriptions', translationKey: 'medical.prescriptions', icon: 'Pill' },
  { id: 'reports', translationKey: 'medical.reports', icon: 'ClipboardList' },
  { id: 'lab-tests', translationKey: 'medical.test_requests', icon: 'FlaskConical' },
  { id: 'files', translationKey: 'common.attachments', icon: 'Paperclip' },
];

export function isValidPatientSection(id) {
  return PATIENT_DETAIL_SECTIONS.some((s) => s.id === id);
}

export function getPatientSection(id) {
  return PATIENT_DETAIL_SECTIONS.find((s) => s.id === id);
}
