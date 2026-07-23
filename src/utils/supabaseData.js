import { supabase } from '../lib/supabaseClient'

// Maps DB row (snake_case) <-> app object (camelCase)
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    renewalDate: row.renewal_date,
    monthlyCost: Number(row.monthly_cost),
    status: row.status,
    notes: row.notes || '',
    createdBy: row.created_by,
  }
}

function toRow(sub) {
  return {
    name: sub.name,
    department: sub.department,
    renewal_date: sub.renewalDate,
    monthly_cost: sub.monthlyCost,
    status: sub.status,
    notes: sub.notes || '',
  }
}

export async function fetchSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('renewal_date', { ascending: true })
  if (error) throw error
  return data.map(fromRow)
}

export async function insertSubscription(sub, userId) {
  const row = { ...toRow(sub), created_by: userId }
  const { data, error } = await supabase.from('subscriptions').insert([row]).select().single()
  if (error) throw error
  return fromRow(data)
}

export async function updateSubscription(id, sub) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(toRow(sub))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return fromRow(data)
}

export async function deleteSubscription(id) {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id)
  if (error) throw error
}

// Live updates: whenever any user adds/edits/deletes a row, every connected
// client gets notified via Supabase Realtime so the dashboard stays in sync.
export function subscribeToChanges(onChange) {
  const channel = supabase
    .channel('subscriptions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, onChange)
    .subscribe()

  return () => supabase.removeChannel(channel)
}
