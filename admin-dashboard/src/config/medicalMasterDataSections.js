/**
 * Registry of medical master data sections.
 * Add new entries here to scale (e.g. symptoms, examination types).
 */
export const MEDICAL_MASTER_DATA_SECTIONS = [
  {
    id: 'diseases',
    endpoint: '/admin/chronic-diseases',
    queryKey: 'medical-master-diseases',
    translationKey: 'medical_master_data.tabs.diseases',
    icon: 'HeartPulse',
    variant: 'catalog',
  },
  {
    id: 'medications',
    endpoint: '/admin/medications',
    queryKey: 'medical-master-medications',
    translationKey: 'medical_master_data.tabs.medications',
    icon: 'Pill',
    variant: 'catalog',
  },
  {
    id: 'allergies',
    endpoint: '/admin/allergies',
    queryKey: 'medical-master-allergies',
    translationKey: 'medical_master_data.tabs.allergies',
    icon: 'AlertTriangle',
    variant: 'catalog',
  },
  {
    id: 'lab-test-types',
    endpoint: '/admin/medical-tests',
    queryKey: 'medical-master-lab-test-types',
    translationKey: 'medical_master_data.tabs.lab_test_types',
    icon: 'ClipboardList',
    variant: 'labTest',
  },
];

export const DEFAULT_MEDICAL_MASTER_DATA_SECTION = MEDICAL_MASTER_DATA_SECTIONS[0].id;

export function getMedicalMasterDataSection(id) {
  return MEDICAL_MASTER_DATA_SECTIONS.find((s) => s.id === id);
}

export function isValidMedicalMasterDataSection(id) {
  return MEDICAL_MASTER_DATA_SECTIONS.some((s) => s.id === id);
}
