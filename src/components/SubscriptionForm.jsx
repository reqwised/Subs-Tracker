import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { STATUSES } from '../utils/helpers'

const EMPTY = {
  name: '',
  department: '',
  renewalDate: '',
  monthlyCost: '',
  status: 'Active',
  notes: '',
}

export default function SubscriptionForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(initial ? { ...initial } : EMPTY)
    setErrors({})
  }, [initial])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Wajib diisi'
    if (!form.department.trim()) e.department = 'Wajib diisi'
    if (!form.renewalDate) e.renewalDate = 'Wajib diisi'
    if (form.monthlyCost === '' || Number(form.monthlyCost) < 0) e.monthlyCost = 'Masukkan angka valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    if (!validate()) return
    onSave({ ...form, monthlyCost: Number(form.monthlyCost) })
  }

  const inputCls = (field) =>
    `w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-pine/30 ${
      errors[field] ? 'border-status-expired' : 'border-line'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-surface shadow-xl sm:max-w-lg sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">
            {initial ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted transition hover:bg-paper hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Tool / Application Name
            </label>
            <input
              className={inputCls('name')}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Figma"
            />
            {errors.name && <p className="mt-1 text-xs text-status-expired">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Department Owner
            </label>
            <input
              className={inputCls('department')}
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              placeholder="e.g. Design"
            />
            {errors.department && <p className="mt-1 text-xs text-status-expired">{errors.department}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                Renewal Date
              </label>
              <input
                type="date"
                className={inputCls('renewalDate') + ' font-mono'}
                value={form.renewalDate}
                onChange={(e) => update('renewalDate', e.target.value)}
              />
              {errors.renewalDate && <p className="mt-1 text-xs text-status-expired">{errors.renewalDate}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                Monthly Cost (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls('monthlyCost') + ' font-mono'}
                value={form.monthlyCost}
                onChange={(e) => update('monthlyCost', e.target.value)}
                placeholder="0.00"
              />
              {errors.monthlyCost && <p className="mt-1 text-xs text-status-expired">{errors.monthlyCost}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Status
            </label>
            <select
              className={inputCls('status')}
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">
              Active / Expiring Soon / Expired dihitung otomatis dari tanggal renewal. Pilih "Cancelled" untuk override manual.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Notes</label>
            <textarea
              className={inputCls('notes')}
              rows={3}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Optional notes…"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted transition hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-pine px-4 py-2 text-sm font-medium text-white transition hover:bg-pine-dark"
            >
              {initial ? 'Save changes' : 'Add subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
