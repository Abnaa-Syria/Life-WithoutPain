export const DEFAULT_SUPPORT_SECTION = 'tickets';

export const SUPPORT_SECTIONS = [
  {
    id: 'info',
    translationKey: 'support.tabs.info',
    icon: 'Info',
  },
  {
    id: 'tickets',
    translationKey: 'support.tabs.tickets',
    icon: 'Headphones',
  },
];

export function isValidSupportSection(id) {
  return SUPPORT_SECTIONS.some((s) => s.id === id);
}

export function getSupportSection(id) {
  return SUPPORT_SECTIONS.find((s) => s.id === id);
}
