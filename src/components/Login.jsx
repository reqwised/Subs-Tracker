import { useState } from 'react'
import { Receipt, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const err = await signIn(email.trim(), password)
    setBusy(false)
    if (err) setError('Email atau password salah.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-pine text-white">
            <Receipt size={18} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold leading-tight text-ink">Ledger</h1>
            <p className="text-xs text-muted">Sign in to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
              placeholder="tester1@ledger.app"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/30"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-status-expired">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-pine px-4 py-2 text-sm font-medium text-white transition hover:bg-pine-dark disabled:opacity-60"
          >
            <LogIn size={15} /> {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Belum punya akun? Minta admin buat akun testing di Supabase Dashboard.
        </p>
      </div>
    </div>
  )
}
