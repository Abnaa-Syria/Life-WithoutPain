import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export default function useConfirmDelete() {
  const { t } = useTranslation();

  const confirmDelete = async (options = {}) => {
    const { title, text, confirmButtonText, cancelButtonText } = options;

    const result = await Swal.fire({
      title: title || t('common.confirm.delete_title'),
      text: text || t('common.confirm.delete_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: confirmButtonText || t('common.confirm.yes_delete'),
      cancelButtonText: cancelButtonText || t('common.cancel'),
      reverseButtons: true, // Swaps cancel/confirm for better UX in RTL/LTR
      customClass: {
        popup: 'rounded-2xl border-none',
        confirmButton: 'rounded-lg px-6 py-2',
        cancelButton: 'rounded-lg px-6 py-2',
      },
    });

    return result.isConfirmed;
  };

  return confirmDelete;
}
