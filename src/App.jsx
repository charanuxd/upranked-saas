import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/UI'
import { supabase, isConfigured } from './lib/supabase'
import { MOCK_ADMIN } from './lib/mock'

import Landing       from './pages/Landing'
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await loadProfile(session.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) await loadProfile(session.user)
      else { setUser(null); setProfile(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(u) {
    setUser(u)
    const { data } = await supabase.from('profiles').select('*').eq('id', u.id).single()
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
  if (role && profile?.role !== role) return <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
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
