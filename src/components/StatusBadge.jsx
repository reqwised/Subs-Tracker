const STYLES = {
  Active: 'text-status-active bg-status-activeBg border-status-active/30',
  'Expiring Soon': 'text-status-soon bg-status-soonBg border-status-soon/30',
  Expired: 'text-status-expired bg-status-expiredBg border-status-expired/30',
  Cancelled: 'text-status-cancelled bg-status-cancelledBg border-status-cancelled/30',
}

const DOT = {
  Active: 'bg-status-active',
  'Expiring Soon': 'bg-status-soon',
  Expired: 'bg-status-expired',
  Cancelled: 'bg-status-cancelled',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wide ${STYLES[status] || STYLES.Cancelled}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status] || DOT.Cancelled}`} />
      {status}
    </span>
  )
}
