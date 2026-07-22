// Status is derived automatically from renewalDate, unless the user manually
// sets it to "Cancelled" (a manual override that always wins).
export const STATUSES = ['Active', 'Expiring Soon', 'Expired', 'Cancelled']

export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

// Computes the effective status. If the subscription was manually cancelled,
// that's respected. Otherwise status is derived from the renewal date so the
// dashboard is always accurate without the user manually flipping switches.
export function effectiveStatus(sub) {
  if (sub.status === 'Cancelled') return 'Cancelled'
  const diff = daysUntil(sub.renewalDate)
  if (diff < 0) return 'Expired'
  if (diff <= 14) return 'Expiring Soon'
  return 'Active'
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatCurrency(amount) {
  const n = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n)
}

export function exportToCSV(subscriptions) {
  const headers = ['Tool Name', 'Department', 'Renewal Date', 'Monthly Cost', 'Status', 'Notes']
  const rows = subscriptions.map((s) => [
    s.name,
    s.department,
    s.renewalDate,
    s.monthlyCost,
    effectiveStatus(s),
    (s.notes || '').replace(/\n/g, ' '),
  ])

  const escapeCell = (cell) => {
    const str = String(cell ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function seedData() {
  const today = new Date()
  const addDays = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }
  return [
    { id: uid(), name: 'Figma', department: 'Design', renewalDate: addDays(9), monthlyCost: 45, status: 'Active', notes: 'Org plan, 6 seats' },
    { id: uid(), name: 'Slack', department: 'Operations', renewalDate: addDays(40), monthlyCost: 120, status: 'Active', notes: 'Business+ plan' },
    { id: uid(), name: 'Notion', department: 'Product', renewalDate: addDays(3), monthlyCost: 32, status: 'Active', notes: '' },
    { id: uid(), name: 'Adobe Creative Cloud', department: 'Marketing', renewalDate: addDays(-5), monthlyCost: 89, status: 'Active', notes: 'Renewal payment failed' },
    { id: uid(), name: 'Zoom', department: 'Operations', renewalDate: addDays(60), monthlyCost: 20, status: 'Active', notes: '' },
    { id: uid(), name: 'GitHub Enterprise', department: 'Engineering', renewalDate: addDays(120), monthlyCost: 210, status: 'Active', notes: '20 seats' },
    { id: uid(), name: 'Mailchimp', department: 'Marketing', renewalDate: addDays(-30), monthlyCost: 60, status: 'Cancelled', notes: 'Switched to alternative' },
  ]
}
