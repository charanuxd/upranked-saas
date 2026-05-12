import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// NOTE: Do NOT pass a custom fetch with AbortController here.
// Aborting Supabase's internal auth requests (token refresh etc.) mid-flight
// corrupts the auth client's internal state and causes subsequent sign-in
// calls to hang indefinitely. Timeouts are handled at the call-site level
// using Promise.race, which gives up waiting without cancelling the request.
export const isConfigured = !!(url && key)
export const supabase = isConfigured ? createClient(url, key) : null

// The localStorage key where the Supabase client stores the auth session.
// Used to clear stale sessions directly (bypassing the auth client lock).
const projectRef = url ? url.split('//')[1]?.split('.')[0] : null
export const SUPABASE_AUTH_KEY = projectRef ? `sb-${projectRef}-auth-token` : null
