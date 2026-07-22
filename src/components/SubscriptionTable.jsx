import { useMemo, useState } from 'react'
import { Pencil, Trash2, AlertCircle, Search } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { STATUSES, effectiveStatus, formatDate, formatCurrency, daysUntil } from '../utils/helpers'

export default function SubscriptionTable({ subscriptions, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortKey, setSortKey] = useState('renewalDate')
  const [sortDir, setSortDir] = useState('asc')

  const filtered = useMemo(() => {
    let rows = subscriptions.map((s) => ({ ...s, _status: effectiveStatus(s) }))

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      rows = rows.filter(
        (s) => s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'All') {
      rows = rows.filter((s) => s._status === statusFilter)
    }

    rows.sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]
      if (sortKey === 'monthlyCost') {
        av = Number(av)
        bv = Number(bv)
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }, [subscriptions, query, statusFilter, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortHeader = ({ label, sortField, className = '' }) => (
    <th
      className={`cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted hover:text-ink ${className}`}
      onClick={() => toggleSort(sortField)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === sortField && <span className="text-pine">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  )

  return (
    <div className="rounded-lg border border-line bg-surface">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tool atau department…"
            className="w-full rounded-md border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-pine/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === s
                  ? 'border-pine bg-pine text-white'
                  : 'border-line bg-surface text-muted hover:border-pine/40 hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table (desktop) */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-paper">
              <SortHeader label="Tool" sortField="name" />
              <SortHeader label="Department" sortField="department" />
              <SortHeader label="Renewal Date" sortField="renewalDate" />
              <SortHeader label="Monthly Cost" sortField="monthlyCost" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">Notes</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const d = daysUntil(s.renewalDate)
              const soon = s._status === 'Expiring Soon'
              return (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-muted">{s.department}</td>
                  <td className="px-4 py-3 font-mono text-sm tabular text-ink">
                    <div className="flex items-center gap-1.5">
                      {formatDate(s.renewalDate)}
                      {soon && (
                        <span title={`${d} hari lagi`} className="text-status-soon">
                          <AlertCircle size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm tabular text-ink">{formatCurrency(s.monthlyCost)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s._status} />
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-sm text-muted" title={s.notes}>
                    {s.notes || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(s)}
                        className="rounded p-1.5 text-muted transition hover:bg-pine-light hover:text-pine-dark"
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="rounded p-1.5 text-muted transition hover:bg-status-expiredBg hover:text-status-expired"
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                  Tidak ada subscription yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="divide-y divide-line sm:hidden">
        {filtered.map((s) => {
          const d = daysUntil(s.renewalDate)
          const soon = s._status === 'Expiring Soon'
          return (
            <div key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-muted">{s.department}</p>
                </div>
                <StatusBadge status={s._status} />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-sm tabular">
                <span className="flex items-center gap-1 text-ink">
                  {formatDate(s.renewalDate)}
                  {soon && <AlertCircle size={13} className="text-status-soon" />}
                </span>
                <span className="text-ink">{formatCurrency(s.monthlyCost)}</span>
              </div>
              {s.notes && <p className="mt-1.5 text-xs text-muted">{s.notes}</p>}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onEdit(s)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line py-1.5 text-xs font-medium text-ink"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-status-expired/30 bg-status-expiredBg py-1.5 text-xs font-medium text-status-expired"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted">Tidak ada subscription yang cocok.</div>
        )}
      </div>
    </div>
  )
}
