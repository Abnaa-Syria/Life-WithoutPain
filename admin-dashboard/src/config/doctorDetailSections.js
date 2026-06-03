export const DEFAULT_DOCTOR_SECTION = 'summary';

export const DOCTOR_DETAIL_SECTIONS = [
  { id: 'summary', translationKey: 'common.summary', icon: 'Activity' },
  { id: 'appointments', translationKey: 'patients.tab_appointments', icon: 'Calendar' },
  { id: 'prescriptions', translationKey: 'medical.prescriptions', icon: 'Pill' },
  { id: 'reports', translationKey: 'medical.reports', icon: 'ClipboardList' },
  { id: 'lab-tests', translationKey: 'medical.test_requests', icon: 'FlaskConical' },
];

export function isValidDoctorSection(id) {
  return DOCTOR_DETAIL_SECTIONS.some((s) => s.id === id);
}

export function getDoctorSection(id) {
  return DOCTOR_DETAIL_SECTIONS.find((s) => s.id === id);
}
