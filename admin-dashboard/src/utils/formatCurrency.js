/**
 * Format monetary amounts with locale-aware currency suffix (SAR).
 */
export function formatCurrency(amount, t) {
  if (amount == null || amount === '') return '-';
  return t('common.currency_sar', { amount });
}
