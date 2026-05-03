import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { t } from '../lib/theme'
import { Button, Input, useToast } from '../components/UI'
import { supabase, isConfigured } from '../lib/supabase'
import { useAuth } from '../App'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()
  const toast    = useToast()
  const { setMockAuth } = useAuth()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!isConfigured) {
        // Demo mode — accept admin credentials
        if (email === 'admin@upranked.co' && password === 'demo') {
          setMockAuth('admin')
          navigate('/admin')
        } else if (password === 'demo') {
          setMockAuth('client')
          navigate('/dashboard')
        } else {
          toast('Demo: use admin@upranked.co / demo or any email / demo', 'info')
        }
        return
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast(err.message || 'Sign in failed', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.text }}>Upranked</div>
          <p style={{ color: t.textMuted, fontSize: 14, marginTop: 4 }}>Sign in to your account</p>
        </div>

        {!isConfigured && (
          <div style={{ background: t.accentSoft, border: `1px solid ${t.accent}33`, borderRadius: t.radiusSm, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: t.accent }}>
            <strong>Demo mode</strong> — Use <code>admin@upranked.co</code> / <code>demo</code> for admin, or any email / <code>demo</code> for client view.
          </div>
        )}

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: 32, boxShadow: t.shadow }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: t.accent }}>Forgot password?</Link>
            </div>
            <Button type="submit" fullWidth disabled={loading} size="lg">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: t.textMuted }}>
          Don't have access? <Link to="/" style={{ color: t.accent }}>Learn more about Upranked</Link>
        </p>
      </div>
    </div>
  )
}
