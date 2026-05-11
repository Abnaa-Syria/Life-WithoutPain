export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء', variant = 'danger' }) {
  if (!isOpen) return null;

  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">{cancelLabel}</button>
          <button onClick={onConfirm} className={btnClass}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
