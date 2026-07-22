const KEY = 'subscription-tracker:data'

export function loadSubscriptions(fallback) {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return fallback
  } catch {
    return fallback
  }
}

export function saveSubscriptions(subs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(subs))
  } catch {
    // storage unavailable (e.g. private mode) — fail silently, in-memory state still works
  }
}
