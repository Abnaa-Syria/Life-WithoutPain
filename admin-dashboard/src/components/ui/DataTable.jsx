import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import useConfirmDelete from '../../hooks/useConfirmDelete';
import { exportTableToExcel } from '../../utils/exportTableToExcel';

const DataTable = ({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  exportFileName = 'export',
  enableBulkDelete,
  extraBulkActions,
  searchPlaceholder,
  renderCustomActions,
}) => {
  const { t, i18n } = useTranslation();
  const confirmDelete = useConfirmDelete();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [bulkBusy, setBulkBusy] = useState(false);

  const showBulkDelete =
    enableBulkDelete !== false && typeof onBulkDelete === 'function';

  const tableColumns = useMemo(() => {
    const cols = [...columns];

    // Selection applies to current page rows only (TanStack default).
    cols.unshift({
      id: 'selection',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[var(--border-color)]"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[var(--border-color)]"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
    });

    cols.push({
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {onView && (
            <button
              type="button"
              onClick={() => onView(row.original)}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-sidebar-active)] rounded-lg transition-colors"
            >
              <Eye size={16} />
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="p-2.5 text-[var(--text-muted)] hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(row.original)}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          {renderCustomActions && renderCustomActions(row.original)}
        </div>
      ),
      enableSorting: false,
    });

    return cols;
  }, [columns, t, onEdit, onDelete, onView, renderCustomActions]);

  const table = useReactTable({
    data: data || [],
    columns: tableColumns,
    getRowId: (row, index) => String(row.id ?? row._id ?? row.uuid ?? index),
    enableRowSelection: true,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedOriginals = selectedRows.map((r) => r.original);
  const hasSelection = selectedRows.length > 0;

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const handleExport = () => {
    if (!selectedOriginals.length) return;
    try {
      exportTableToExcel({
        columns,
        rows: selectedOriginals,
        t,
        fileName: exportFileName,
        language: i18n.language,
      });
      toast.success(t('common.export_success'));
    } catch {
      toast.error(t('messages.error'));
    }
  };

  const handleBulkDelete = async () => {
    if (!showBulkDelete || !selectedOriginals.length) return;
    const confirmed = await confirmDelete({
      text: t('common.confirm.bulk_delete_text', { count: selectedOriginals.length }),
    });
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await onBulkDelete(selectedOriginals);
      table.resetRowSelection();
    } catch {
      toast.error(t('messages.error'));
    } finally {
      setBulkBusy(false);
    }
  };

  if (isLoading) return <LoadingSkeleton type="table" rows={8} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search
            className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            size={18}
          />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="input ps-10"
            placeholder={searchPlaceholder || t('common.search')}
          />
        </div>
      </div>

      {hasSelection && (
        <div className="flex flex-wrap items-center gap-3 bg-[var(--bg-sidebar-active)] px-5 py-3.5 rounded-xl">
          <span className="text-body font-medium text-[var(--primary)]">
            {selectedRows.length} {t('common.selected')}
          </span>
          <div className="h-4 w-px bg-[var(--divider)]" />
          <button
            type="button"
            onClick={handleExport}
            disabled={bulkBusy}
            className="btn btn-secondary py-1.5 px-3 text-sm inline-flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            {t('common.export')}
          </button>
          {showBulkDelete && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkBusy}
              className="btn btn-danger py-1.5 px-3 text-sm inline-flex items-center gap-2"
            >
              <Trash2 size={16} />
              {t('common.delete')}
            </button>
          )}
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={bulkBusy}
            className="btn btn-secondary py-1.5 px-3 text-sm inline-flex items-center gap-2"
          >
            <X size={16} />
            {t('common.clear_selection')}
          </button>
          {extraBulkActions?.(selectedOriginals)}
        </div>
      )}

      <div className="table-elevated overflow-x-auto">
        <table className="w-full text-start border-collapse table-zebra">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-4 text-table font-semibold text-[var(--text-secondary)] cursor-pointer select-none"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown size={14} className="opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-200 ${onView ? 'cursor-pointer hover:bg-[var(--bg-sidebar-active)]' : 'hover:bg-[var(--surface-secondary)]/60'}`}
                  onClick={(e) => {
                    if (
                      e.target.closest('input[type="checkbox"]') ||
                      e.target.closest('button')
                    )
                      return;
                    if (onView) onView(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-5 py-[22px] text-table font-medium text-[var(--text-primary)]"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableColumns.length} className="px-4 py-12">
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="text-body text-[var(--text-muted)]">
          {t('common.pagination_info', {
            start:
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
              1,
            end: Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              data?.length || 0
            ),
            total: data?.length || 0,
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="input h-9 px-2 w-20"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2.5 rounded-lg hover:bg-[var(--surface-secondary)] disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2.5 rounded-lg hover:bg-[var(--surface-secondary)] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 rounded-lg bg-[var(--gradient-nav-active)] text-[var(--primary)] font-semibold text-body shadow-sm">
              {table.getState().pagination.pageIndex + 1}
            </div>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2.5 rounded-lg hover:bg-[var(--surface-secondary)] disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2.5 rounded-lg hover:bg-[var(--surface-secondary)] disabled:opacity-30 transition-colors"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
