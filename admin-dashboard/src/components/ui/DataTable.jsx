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
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
  ArrowUpDown, Search, MoreHorizontal, Edit, Trash2, Eye 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView,
  bulkActions,
  searchPlaceholder,
  renderCustomActions
}) => {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const tableColumns = useMemo(() => {
    const cols = [...columns];
    
    // Add Selection Column
    cols.unshift({
      id: 'selection',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[var(--border-color)]"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
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

    // Add Actions Column
    cols.push({
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {onView && (
            <button onClick={() => onView(row.original)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              <Eye size={16} />
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(row.original)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(row.original)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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

  if (isLoading) return <LoadingSkeleton type="table" rows={8} />;

  return (
    <div className="flex flex-col gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="input pl-10"
            placeholder={searchPlaceholder || t('common.search')}
          />
        </div>
        
        {selectedRows.length > 0 && bulkActions && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {selectedRows.length} {t('common.selected')}
            </span>
            <div className="h-4 w-[1px] bg-indigo-200 dark:bg-indigo-800 mx-2" />
            {bulkActions(selectedRows.map(r => r.original))}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ArrowUpDown size={14} className="opacity-50" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className={`transition-colors ${onView ? 'cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  onClick={(e) => {
                    // Don't trigger if clicking selection checkbox or action buttons
                    if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
                    if (onView) onView(row.original);
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-4 text-sm text-[var(--text-primary)]">
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

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-[var(--text-muted)]">
          {t('common.pagination_info', { 
            start: table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
            end: Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data?.length || 0),
            total: data?.length || 0
          }) || `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to ${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data?.length || 0)} of ${data?.length || 0} entries`}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="input h-9 px-2 w-20"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-semibold text-sm">
              {table.getState().pagination.pageIndex + 1}
            </div>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
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
