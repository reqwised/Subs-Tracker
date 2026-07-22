import { useEffect, useMemo, useState } from 'react'
import { Plus, Download, Receipt } from 'lucide-react'
import Dashboard from './components/Dashboard'
import SubscriptionTable from './components/SubscriptionTable'
import SubscriptionForm from './components/SubscriptionForm'
import { effectiveStatus, exportToCSV, seedData, uid } from './utils/helpers'
import { loadSubscriptions, saveSubscriptions } from './utils/storage'

export default function App() {
  const [subscriptions, setSubscriptions] = useState(() => loadSubscriptions(seedData()))
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    saveSubscriptions(subscriptions)
  }, [subscriptions])

  const counts = useMemo(() => {
    const c = { total: subscriptions.length, Active: 0, 'Expiring Soon': 0, Expired: 0, Cancelled: 0 }
    subscriptions.forEach((s) => {
      c[effectiveStatus(s)] += 1
    })
    return c
  }, [subscriptions])

  const monthlySpend = useMemo(
    () =>
      subscriptions
        .filter((s) => effectiveStatus(s) !== 'Cancelled')
        .reduce((sum, s) => sum + Number(s.monthlyCost || 0), 0),
    [subscriptions]
  )

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(sub) {
    setEditing(sub)
    setFormOpen(true)
  }

  function handleSave(data) {
    if (editing) {
      setSubscriptions((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s)))
    } else {
      setSubscriptions((prev) => [...prev, { ...data, id: uid() }])
    }
    setFormOpen(false)
    setEditing(null)
  }

  function handleDelete(id) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen bg-paper pb-16">
      {/* Header */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-pine text-white">
              <Receipt size={18} />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight text-ink sm:text-xl">Ledger</h1>
              <p className="text-xs text-muted">Subscription &amp; renewal tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(subscriptions)}
              className="hidden items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:bg-paper sm:flex"
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 rounded-md bg-pine px-3 py-2 text-sm font-medium text-white transition hover:bg-pine-dark"
            >
              <Plus size={15} /> <span className="hidden sm:inline">Add Subscription</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Dashboard counts={counts} monthlySpend={monthlySpend} />

        <div className="flex items-center justify-between sm:hidden">
          <button
            onClick={() => exportToCSV(subscriptions)}
            className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        <SubscriptionTable subscriptions={subscriptions} onEdit={openEdit} onDelete={(id) => setDeleteTarget(id)} />
      </main>

      {formOpen && (
        <SubscriptionForm
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl">
            <h3 className="font-display text-base font-semibold text-ink">Delete subscription?</h3>
            <p className="mt-1.5 text-sm text-muted">
              Tindakan ini tidak bisa dibatalkan. Data akan dihapus secara permanen dari daftar.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted hover:bg-paper"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="rounded-md bg-status-expired px-4 py-2 text-sm font-medium text-white hover:bg-status-expired/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
