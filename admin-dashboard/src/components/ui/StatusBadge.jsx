import { useTranslation } from 'react-i18next';
import Badge from './Badge';

export const STATUS_VARIANT = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'danger',
  BANNED: 'danger',
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  CONFIRMED: 'success',
  RESCHEDULED: 'warning',
  NO_SHOW: 'danger',
  PAID: 'success',
  FAILED: 'danger',
  REFUNDED: 'info',
  ESCALATED: 'danger',
  MORE_INFO_REQUESTED: 'warning',
  CLOSED: 'secondary',
  RESOLVED: 'success',
  DRAFT: 'secondary',
  SUBMITTED: 'info',
  PROCESSING: 'warning',
  SCHEDULED: 'info',
  SAMPLE_COLLECTED: 'info',
  REQUESTED: 'info',
  MATCHED: 'success',
  DISCREPANCY: 'danger',
  DISPUTED: 'warning',
};

/** Maps API status codes to i18n keys (status.* or common.*). */
function statusTranslationKey(status) {
  if (!status) return null;
  const normalized = status.toLowerCase();
  const userAccountStatuses = ['active', 'inactive', 'suspended', 'banned'];
  if (userAccountStatuses.includes(normalized)) {
    return `common.${normalized}`;
  }
  return `status.${normalized}`;
}

export function getStatusVariant(status) {
  return STATUS_VARIANT[status] || 'info';
}

export default function StatusBadge({ status, className = '' }) {
  const { t } = useTranslation();
  const key = statusTranslationKey(status);
  const label = key ? t(key, { defaultValue: status }) : status;
  const variant = getStatusVariant(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
