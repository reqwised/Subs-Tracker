import { Layers, CheckCircle2, AlertTriangle, XCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'

function Card({ label, value, icon: Icon, tone }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-4 sm:p-5">
      <div className="ledger-texture pointer-events-none absolute -right-4 -top-4 h-20 w-20 opacity-30" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink tabular sm:text-3xl">{value}</p>
        </div>
        <div className={`rounded-md p-2 ${tone}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ counts, monthlySpend }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <Card label="Total" value={counts.total} icon={Layers} tone="bg-pine-light text-pine-dark" />
      <Card label="Active" value={counts.Active} icon={CheckCircle2} tone="bg-status-activeBg text-status-active" />
      <Card label="Expiring Soon" value={counts['Expiring Soon']} icon={AlertTriangle} tone="bg-status-soonBg text-status-soon" />
      <Card label="Expired" value={counts.Expired} icon={XCircle} tone="bg-status-expiredBg text-status-expired" />
      <Card
        label="Monthly Spend"
        value={formatCurrency(monthlySpend)}
        icon={Wallet}
        tone="bg-pine-light text-pine-dark"
      />
    </div>
  )
}
