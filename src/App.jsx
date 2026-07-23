import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Download, Receipt, LogOut, Loader2 } from 'lucide-react'
import Dashboard from './components/Dashboard'
import SubscriptionTable from './components/SubscriptionTable'
import SubscriptionForm from './components/SubscriptionForm'
import Login from './components/Login'
import { useAuth } from './context/AuthContext'
import { effectiveStatus, exportToCSV } from './utils/helpers'
import {
  fetchSubscriptions,
  insertSubscription,
  updateSubscription,
  deleteSubscription,
  subscribeToChanges,
} from './utils/supabaseData'

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <Loader2 className="animate-spin text-pine" size={22} />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <DashboardScreen user={user} onSignOut={signOut} />
}

function DashboardScreen({ user, onSignOut }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      const data = await fetchSubscriptions()
      setSubscriptions(data)
    } catch (err) {
      setError(err.message || 'Gagal memuat data dari Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Live sync: refetch whenever another user (or tab) changes the shared table.
    const unsubscribe = subscribeToChanges(() => load())
    return unsubscribe
  }, [load])

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

  async function handleSave(data) {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateSubscription(editing.id, data)
        setSubscriptions((prev) => prev.map((s) => (s.id === editing.id ? updated : s)))
      } else {
        const created = await insertSubscription(data, user.id)
        setSubscriptions((prev) => [...prev, created])
      }
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan subscription.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSubscription(id)
      setSubscriptions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err.message || 'Gagal menghapus subscription.')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-paper pb-16">
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
            <div className="ml-1 hidden items-center gap-2 border-l border-line pl-3 sm:flex">
              <span className="max-w-[140px] truncate text-xs text-muted" title={user.email}>
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="rounded-md p-1.5 text-muted transition hover:bg-paper hover:text-ink"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-md border border-status-expired/30 bg-status-expiredBg px-4 py-3 text-sm text-status-expired">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted">
            <Loader2 className="mr-2 animate-spin" size={18} /> Memuat data…
          </div>
        ) : (
          <>
            <Dashboard counts={counts} monthlySpend={monthlySpend} />

            <div className="flex items-center justify-between sm:hidden">
              <button
                onClick={() => exportToCSV(subscriptions)}
                className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink"
              >
                <Download size={15} /> Export CSV
              </button>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-muted"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>

            <SubscriptionTable
              subscriptions={subscriptions}
              onEdit={openEdit}
              onDelete={(id) => setDeleteTarget(id)}
            />
          </>
        )}
      </main>

      {formOpen && (
        <SubscriptionForm
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            if (saving) return
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
              Tindakan ini tidak bisa dibatalkan. Data akan dihapus secara permanen untuk semua user.
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
