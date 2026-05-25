/** Shared OpenAPI tag names for Doctor App and Patient App sub-modules */

const DOCTOR_APP_PREFIX = 'Doctor App';
const PATIENT_APP_PREFIX = 'Patient App';

const DOCTOR_APP_SUBMODULES = [
  { key: 'auth', name: 'Auth', description: 'Doctor mobile authentication' },
  { key: 'specializations', name: 'Specializations', description: 'Medical specializations catalog' },
  { key: 'availabilities', name: 'Availabilities', description: 'Doctor schedule and availability slots' },
  { key: 'appointments', name: 'Appointments', description: 'Appointment management for doctors' },
  { key: 'patients', name: 'Patients', description: 'Patient list and details for treating doctors' },
  { key: 'prescriptions', name: 'Prescriptions', description: 'Electronic prescriptions' },
  { key: 'reports', name: 'Reports', description: 'Medical reports' },
  { key: 'notifications', name: 'Notifications', description: 'Doctor notifications' },
  { key: 'profile', name: 'Profile', description: 'Doctor personal profile' },
  { key: 'clinic-details', name: 'Clinic', description: 'Clinic details and working hours' },
  { key: 'settings', name: 'Settings', description: 'Doctor app settings' },
  { key: 'support', name: 'Support', description: 'Help and support tickets' },
];

const PATIENT_APP_SUBMODULES = [
  { key: 'auth', name: 'Auth', description: 'Patient mobile authentication' },
  { key: 'insurances', name: 'Insurances', description: 'Patient insurance policies' },
  { key: 'insurance-requests', name: 'Insurance Requests', description: 'Insurance pre-authorization requests and status' },
  { key: 'family-members', name: 'Family Members', description: 'Family members for booking' },
  { key: 'services', name: 'Services', description: 'Healthcare services catalog' },
  { key: 'appointments', name: 'Appointments', description: 'Book and manage clinic or remote appointments' },
  { key: 'home-services', name: 'Home Services', description: 'Request home visit services' },
  { key: 'directories', name: 'Directories', description: 'Medical records directory' },
  { key: 'specializations', name: 'Specializations', description: 'Browse specializations and doctors' },
  { key: 'doctors', name: 'Doctors', description: 'Doctor search and profiles' },
  { key: 'payments', name: 'Payments', description: 'Appointment payments' },
  { key: 'conversations', name: 'Conversations', description: 'Chat with doctors' },
  { key: 'profile', name: 'Profile', description: 'Patient personal profile' },
  { key: 'medical-profile', name: 'Medical Profile', description: 'Medical history and catalog selections' },
  { key: 'files', name: 'Files', description: 'Medical file attachments' },
  { key: 'settings', name: 'Settings', description: 'Patient app settings' },
  { key: 'support', name: 'Support', description: 'Customer support tickets' },
];

function appSubmoduleTag(appPrefix, submoduleKey) {
  const list = appPrefix === DOCTOR_APP_PREFIX ? DOCTOR_APP_SUBMODULES : PATIENT_APP_SUBMODULES;
  const found = list.find((m) => m.key === submoduleKey);
  const label = found?.name || submoduleKey.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `${appPrefix} - ${label}`;
}

function submoduleKeyFromMount(mountPrefix, appSegment) {
  const prefix = `/${appSegment}/`;
  if (!mountPrefix.startsWith(prefix)) return null;
  const rest = mountPrefix.slice(prefix.length);
  return rest.split('/')[0] || null;
}

function tagForDoctorPatientRoute(moduleName, mountPrefix) {
  if (moduleName === 'doctor') {
    const key = submoduleKeyFromMount(mountPrefix, 'doctor');
    if (!key) return null;
    return appSubmoduleTag(DOCTOR_APP_PREFIX, key);
  }
  if (moduleName === 'patient') {
    const key = submoduleKeyFromMount(mountPrefix, 'patient');
    if (!key) return null;
    return appSubmoduleTag(PATIENT_APP_PREFIX, key);
  }
  return null;
}

function buildAppTags(appPrefix, submodules) {
  return submodules.map((m) => ({
    name: `${appPrefix} - ${m.name}`,
    description: m.description,
  }));
}

function allDoctorAppTagNames() {
  return DOCTOR_APP_SUBMODULES.map((m) => `${DOCTOR_APP_PREFIX} - ${m.name}`);
}

function allPatientAppTagNames() {
  return PATIENT_APP_SUBMODULES.map((m) => `${PATIENT_APP_PREFIX} - ${m.name}`);
}

module.exports = {
  DOCTOR_APP_PREFIX,
  PATIENT_APP_PREFIX,
  DOCTOR_APP_SUBMODULES,
  PATIENT_APP_SUBMODULES,
  appSubmoduleTag,
  submoduleKeyFromMount,
  tagForDoctorPatientRoute,
  buildAppTags,
  allDoctorAppTagNames,
  allPatientAppTagNames,
};
