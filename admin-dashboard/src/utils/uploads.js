export function getApiOrigin() {
  const configured =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:4000/api/v1';
  return configured.replace(/\/api\/v1\/?$/, '');
}

export function resolveUploadUrl(path) {
  if (!path) return '';

  if (/^https?:\/\//i.test(path)) {
    if (import.meta.env.DEV) {
      try {
        const { pathname } = new URL(path);
        if (pathname.startsWith('/uploads/')) return pathname;
      } catch {
        // keep absolute URL
      }
    }
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  // In dev, use same-origin paths so Vite proxies /uploads to the API server.
  if (import.meta.env.DEV) return normalized;

  return `${getApiOrigin()}${normalized}`;
}

export function guessMimeType(urlOrPath) {
  const value = String(urlOrPath || '').split('?')[0].toLowerCase();
  if (value.endsWith('.pdf')) return 'application/pdf';
  if (/\.jpe?g$/.test(value)) return 'image/jpeg';
  if (value.endsWith('.png')) return 'image/png';
  if (value.endsWith('.gif')) return 'image/gif';
  if (value.endsWith('.webp')) return 'image/webp';
  return null;
}

export function normalizePreviewFiles(items = []) {
  if (!items?.length) return [];
  return items
    .map((item, index) => {
      if (typeof item === 'string') {
        const url = resolveUploadUrl(item);
        return { url, name: `File ${index + 1}`, mimeType: guessMimeType(url) };
      }
      const rawUrl = item.url || item.fileUrl || item.attachmentUrl;
      const url = resolveUploadUrl(rawUrl);
      return {
        url,
        name: item.name || item.title || item.fileType || item.type || `File ${index + 1}`,
        mimeType: item.mimeType || guessMimeType(url),
      };
    })
    .filter((file) => file.url);
}
