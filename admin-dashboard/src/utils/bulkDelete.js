/**
 * Delete multiple records via per-id DELETE calls; toast + invalidate on completion.
 */
export async function executeBulkDelete({ items, deleteOne, t, toast, invalidate }) {
  if (!items?.length) return;

  const results = await Promise.allSettled(items.map((item) => deleteOne(item)));
  const success = results.filter((r) => r.status === 'fulfilled').length;

  if (success === 0) {
    throw new Error('bulk delete failed');
  }

  if (success < items.length) {
    toast.error(t('messages.bulk_delete_partial', { success, total: items.length }));
  } else {
    toast.success(t('messages.bulk_deleted', { count: success }));
  }

  await invalidate?.();
}
