import { useTranslation } from 'react-i18next';

const STATUS_CLASS = {
  ACTIVE: 'badge-success',
  INACTIVE: 'badge-warning',
  SUSPENDED: 'badge-danger',
  BANNED: 'badge-danger',
  PENDING: 'badge-warning',
  UNDER_REVIEW: 'badge-info',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  OPEN: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
  CONFIRMED: 'badge-success',
  RESCHEDULED: 'badge-warning',
  NO_SHOW: 'badge-danger',
  PAID: 'badge-success',
  FAILED: 'badge-danger',
  REFUNDED: 'badge-info',
  ESCALATED: 'badge-danger',
  MORE_INFO_REQUESTED: 'badge-warning',
  CLOSED: 'badge-secondary',
  RESOLVED: 'badge-success',
  DRAFT: 'badge-secondary',
  SUBMITTED: 'badge-info',
  PROCESSING: 'badge-warning',
  SCHEDULED: 'badge-info',
  SAMPLE_COLLECTED: 'badge-info',
  MATCHED: 'badge-success',
  DISCREPANCY: 'badge-danger',
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

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const key = statusTranslationKey(status);
  const label = key ? t(key, { defaultValue: status }) : status;
  const className = STATUS_CLASS[status] || 'badge-info';

  return <span className={className}>{label}</span>;
}
