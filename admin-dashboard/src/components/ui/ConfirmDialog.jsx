import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const btnClass = variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
  const resolvedConfirm = confirmLabel ?? t('common.confirm_action');
  const resolvedCancel = cancelLabel ?? t('common.cancel');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-[var(--shadow-dropdown)] p-6 max-w-md w-full border border-[var(--border-color)]">
        <h3 className="text-section-title mb-2">{title}</h3>
        <p className="text-body text-[var(--text-muted)] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn btn-secondary">{resolvedCancel}</button>
          <button type="button" onClick={onConfirm} className={btnClass}>{resolvedConfirm}</button>
        </div>
      </div>
    </div>
  );
}
