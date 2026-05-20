const storage = require('../../shared/storage');

const UPLOAD_URL_PREFIX = '/uploads/';

function resolveStorageKeyFromFileUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return null;
  if (fileUrl.startsWith(UPLOAD_URL_PREFIX)) {
    return fileUrl.slice(UPLOAD_URL_PREFIX.length);
  }
  return fileUrl.replace(/^\//, '');
}

async function deleteStoredFile(fileUrl) {
  const key = resolveStorageKeyFromFileUrl(fileUrl);
  if (!key) return;
  await storage.delete(key);
}

module.exports = {
  resolveStorageKeyFromFileUrl,
  deleteStoredFile,
};
