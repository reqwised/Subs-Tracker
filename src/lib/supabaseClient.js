import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Doesn't throw so the app can still render a helpful message instead of a blank screen.
  console.warn(
    'Supabase env vars missing. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
