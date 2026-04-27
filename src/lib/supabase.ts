import { createClient } from '@supabase/supabase-js'
import { isDemoMode } from './demoMode'

const realClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

const noopChannel = {
  on(_event: unknown, _filter: unknown, _callback?: unknown) { return this },
  subscribe(_callback?: unknown) { return this },
}

const stubClient = {
  channel: () => noopChannel,
  removeChannel: () => {},
} as unknown as typeof realClient

export const supabase = isDemoMode() ? stubClient : realClient
