/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components, react-hooks/immutability */
import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/UI'
import { supabase, isConfigured, SUPABASE_AUTH_KEY } from './lib/supabase'
import { MOCK_ADMIN } from './lib/mock'

import Login         from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Invite        from './pages/Invite'
import Dashboard     from './pages/Dashboard'
import Review        from './pages/Review'
import AdminLayout   from './pages/admin/AdminLayout'
import Overview      from './pages/admin/Overview'
import Clients       from './pages/admin/Clients'
import ClientDetail  from './pages/admin/ClientDetail'
import Activity      from './pages/admin/Activity'
import Reports       from './pages/admin/Reports'
import Settings      from './pages/admin/Settings'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return }
    let cancelled = false

    // Pre-clear sessions whose access token is expired (or will expire within
    // 30 seconds). getSession() refreshes expired tokens over HTTP while holding
    // the internal lock. If that HTTP call hangs, the lock never releases and
    // signInWithPassword blocks until our timeout fires. Clearing the entry
    // before the Supabase client touches it means getSession() reads null,
    // returns immediately, and the lock is never held for long.
    //
    // Threshold is -30s (clear if expiry is less than 30 seconds away).
    // Valid sessions with plenty of time left are untouched so auto-refresh
    // works normally for active users.
    try {
      if (SUPABASE_AUTH_KEY) {
        const raw = localStorage.getItem(SUPABASE_AUTH_KEY)
        if (raw) {
          const { expires_at } = JSON.parse(raw)
          if (expires_at && Date.now() / 1000 >= expires_at - 30) {
            localStorage.removeItem(SUPABASE_AUTH_KEY)
            console.log('[Auth] Pre-cleared expired/near-expired session token')
          }
        }
      }
    } catch {}

    // Race a promise against a timeout. On timeout the error has isTimeout=true.
    const race = (p, ms, label) => Promise.race([
      p,
      new Promise((_, rej) =>
        setTimeout(() => rej(Object.assign(new Error(`${label} timed out after ${ms / 1000}s`), { isTimeout: true })), ms)
      ),
    ])

    ;(async () => {
      try {
        const { data: { session } } = await race(supabase.auth.getSession(), 5000, 'getSession')
        if (cancelled) return
        // Successful init -- clear any previous reload-loop counter
        try { sessionStorage.removeItem('_auth_timeout_reloads') } catch {}
        if (session?.user) await race(loadProfile(session.user), 8000, 'loadProfile')
      } catch (e) {
        if (e.isTimeout) {
          // getSession() timed out. The underlying HTTP refresh request is still
          // in flight holding the internal lock. We cannot call signOut() because
          // it also acquires the same lock. Instead:
          //   1. Clear localStorage directly (no lock required).
          //   2. Reload the page to get a completely fresh JS runtime and auth
          //      client with no in-flight requests or held locks.
          //
          // Loop guard: track how many times we've reloaded for this reason.
          // If it happens more than once in a row, stop reloading and show
          // the login page so the user can manually sign in.
          console.warn(`[Auth] ${e.message} — stuck lock detected, clearing session`)
          try { if (SUPABASE_AUTH_KEY) localStorage.removeItem(SUPABASE_AUTH_KEY) } catch {}
          const reloadCount = Number(sessionStorage.getItem('_auth_timeout_reloads') || '0')
          if (reloadCount < 2) {
            sessionStorage.setItem('_auth_timeout_reloads', String(reloadCount + 1))
            window.location.reload()
            return
          }
          // Two reloads already tried -- something else is wrong (extension
          // blocking requests, Supabase down, etc.). Fall through to login.
          console.warn('[Auth] Reload loop guard hit — proceeding to login without reload')
          sessionStorage.removeItem('_auth_timeout_reloads')
        } else {
          console.error('[Auth] session init failed:', e)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      try {
        if (session?.user) await loadProfile(session.user)
        else { setUser(null); setProfile(null) }
      } catch (e) {
        console.error('[Auth] onAuthStateChange/loadProfile failed:', e)
      }
    })
    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  async function loadProfile(u) {
    setUser(u)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    if (error) {
      console.error('[Auth] profile fetch error:', error)
      setProfile(null)
      return
    }
    setProfile(data)
  }

  function setMockAuth(role) {
    if (role === 'admin') {
      setUser(MOCK_ADMIN)
      setProfile({ ...MOCK_ADMIN, role: 'admin' })
    } else {
      const mockClient = { id: 'client-demo', role: 'client', full_name: 'James Mitchell', email: 'james@metrohvac.com' }
      setUser(mockClient)
      setProfile({ ...mockClient, client_id: 'client-1' })
    }
  }

  function signOut() {
    if (isConfigured) supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, setMockAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function RequireAuth({ children, role }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: '#6B7280' }}>Loading…</div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  // If we're authenticated but the profile didn't load, force re-auth instead of looping
  if (!profile) return <Navigate to="/login" state={{ from: location }} replace />
  // Wrong-role redirect — guard against self-redirect
  if (role && profile.role !== role) {
    const target = profile.role === 'admin' ? '/admin' : '/dashboard'
    if (location.pathname === target) return children // shouldn't happen, but don't loop
    return <Navigate to={target} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/review/:slug" element={<Review />} />
            <Route path="/dashboard" element={<RequireAuth role="client"><Dashboard /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
              <Route index element={<Overview />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="activity" element={<Activity />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
