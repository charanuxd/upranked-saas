import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// NOTE: Do NOT pass a custom fetch with AbortController here.
// Aborting Supabase's internal auth requests mid-flight corrupts the auth
// client's internal state and causes subsequent sign-in calls to hang.
export const isConfigured = !!(url && key)
export const supabase = isConfigured ? createClient(url, key) : null

// The localStorage key where the Supabase client stores the auth session.
// Used to clear stale sessions directly (bypassing the auth client lock).
const projectRef = url ? url.split('//')[1]?.split('.')[0] : null
export const SUPABASE_AUTH_KEY = projectRef ? `sb-${projectRef}-auth-token` : null

// Creates a completely isolated Supabase client for the sign-in flow.
//
// The main `supabase` client initialises with getSession() on app mount.
// If there was an expired session, getSession() makes a refresh HTTP call.
// That HTTP call can hang (browser extension, flaky network, etc.) while
// holding the GoTrue internal lock. Because signInWithPassword() tries to
// acquire the same lock, it blocks until the hang resolves (30-60 seconds)
// and our 20s timeout fires -- producing "Sign-in timed out."
//
// A client with a unique storageKey has its own independent lock namespace.
// It finds no session in its private storage slot, so getSession() returns
// null instantly and the lock is never contended. signInWithPassword()
// proceeds immediately over a fresh lock with no background work in flight.
export function createLoginClient() {
  if (!isConfigured) return null
  return createClient(url, key, {
    auth: {
      storageKey: `sb-${projectRef}-login-tmp`,
      autoRefreshToken: false,
      persistSession: false, // session written to main key manually after sign-in
    },
  })
}

// Invoke a Supabase Edge Function without going through the main client's
// GoTrue internal lock.
//
// supabase.functions.invoke() calls supabase.auth.getSession() internally
// to attach the Bearer token. getSession() acquires the GoTrue lock --
// if the lock is held by a stuck background refresh call, invoke() hangs
// indefinitely and the UI freezes with no error.
//
// This helper reads the access token directly from localStorage (same slot
// we write to after login) and calls fetch() directly, bypassing the lock
// entirely. Includes a configurable timeout via AbortController.
export async function invokeFn(name, body, timeoutMs = 20000) {
  if (!isConfigured) throw new Error('Supabase not configured')

  let accessToken = null
  try {
    const raw = localStorage.getItem(SUPABASE_AUTH_KEY)
    if (raw) accessToken = JSON.parse(raw)?.access_token
  } catch { /* localStorage unavailable */ }
  if (!accessToken) throw new Error('Not authenticated. Please sign in again.')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${url}/functions/v1/${name}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': key,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || `Request failed (HTTP ${res.status})`)
    return data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection and try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}
