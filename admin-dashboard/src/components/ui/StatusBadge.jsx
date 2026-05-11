const statusConfig = {
  ACTIVE: { label: 'نشط', className: 'badge-success' },
  INACTIVE: { label: 'غير نشط', className: 'badge-warning' },
  SUSPENDED: { label: 'موقوف', className: 'badge-danger' },
  BANNED: { label: 'محظور', className: 'badge-danger' },
  PENDING: { label: 'قيد الانتظار', className: 'badge-warning' },
  UNDER_REVIEW: { label: 'قيد المراجعة', className: 'badge-info' },
  APPROVED: { label: 'مقبول', className: 'badge-success' },
  REJECTED: { label: 'مرفوض', className: 'badge-danger' },
  OPEN: { label: 'مفتوح', className: 'badge-info' },
  IN_PROGRESS: { label: 'جاري', className: 'badge-warning' },
  COMPLETED: { label: 'مكتمل', className: 'badge-success' },
  CANCELLED: { label: 'ملغي', className: 'badge-danger' },
  CONFIRMED: { label: 'مؤكد', className: 'badge-success' },
  RESCHEDULED: { label: 'معاد جدولته', className: 'badge-warning' },
  NO_SHOW: { label: 'لم يحضر', className: 'badge-danger' },
  PAID: { label: 'مدفوع', className: 'badge-success' },
  FAILED: { label: 'فشل', className: 'badge-danger' },
  REFUNDED: { label: 'مسترد', className: 'badge-info' },
  ESCALATED: { label: 'متصاعد', className: 'badge-danger' },
  MORE_INFO_REQUESTED: { label: 'معلومات إضافية مطلوبة', className: 'badge-warning' },
  CLOSED: { label: 'مغلق', className: 'badge-secondary' },
  RESOLVED: { label: 'محلول', className: 'badge-success' },
  DRAFT: { label: 'مسودة', className: 'badge-secondary' },
  SUBMITTED: { label: 'مقدم', className: 'badge-info' },
  PROCESSING: { label: 'قيد المعالجة', className: 'badge-warning' },
  SCHEDULED: { label: 'مجدول', className: 'badge-info' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: 'badge-info' };
  return <span className={config.className}>{config.label}</span>;
}
