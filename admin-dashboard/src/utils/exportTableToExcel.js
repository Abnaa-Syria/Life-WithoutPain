import * as XLSX from 'xlsx';
import { format, isValid, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const SKIP_COLUMN_IDS = new Set(['selection', 'actions']);
const EMPTY = '—';

function getLocale(language) {
  return language?.startsWith('ar') ? ar : enUS;
}

function formatDateValue(value, language) {
  if (value == null || value === '') return EMPTY;
  const locale = getLocale(language);
  let date = value;
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    date = isValid(parsed) ? parsed : new Date(value);
  } else if (!(value instanceof Date)) {
    date = new Date(value);
  }
  if (!isValid(date)) return String(value);
  return format(date, 'PP', { locale });
}

function getNestedValue(obj, path) {
  if (!path || !obj) return undefined;
  return String(path).split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

function resolveHeader(columnDef) {
  const { header, meta, accessorKey } = columnDef;
  if (typeof header === 'string') return header;
  if (meta?.exportHeader) return meta.exportHeader;
  if (typeof accessorKey === 'string') return accessorKey;
  return '';
}

function resolveCellValue(row, columnDef, language) {
  const { meta, accessorKey, accessorFn } = columnDef;

  if (meta?.exportValue) {
    const v = meta.exportValue(row);
    return v == null || v === '' ? EMPTY : String(v);
  }

  let raw;
  if (accessorFn) {
    raw = accessorFn(row);
  } else if (accessorKey) {
    raw = getNestedValue(row, accessorKey);
  }

  if (raw == null || raw === '') return EMPTY;

  if (raw instanceof Date || (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw))) {
    return formatDateValue(raw, language);
  }

  if (typeof raw === 'boolean') return raw ? 'true' : 'false';
  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw);
}

/**
 * Export selected table rows to a localized .xlsx file matching visible data columns.
 */
export function exportTableToExcel({ columns, rows, t, fileName = 'export', language = 'en' }) {
  if (!rows?.length) return;

  const dataColumns = columns.filter((col) => {
    const id = col.id ?? col.accessorKey;
    if (id && SKIP_COLUMN_IDS.has(id)) return false;
    return Boolean(col.header || col.accessorKey || col.accessorFn || col.meta?.exportValue);
  });

  const headers = dataColumns.map((col) => resolveHeader(col));
  const sheetRows = rows.map((row) =>
    dataColumns.map((col) => resolveCellValue(row, col, language))
  );

  const aoa = [headers, ...sheetRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  const sheetLabel = (t?.('common.export') || 'Export').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetLabel);

  const dateSuffix = format(new Date(), 'yyyy-MM-dd');
  const safeName = (fileName || 'export').replace(/[^\w\u0600-\u06FF-]+/g, '_');
  XLSX.writeFile(wb, `${safeName}_${dateSuffix}.xlsx`);
}
