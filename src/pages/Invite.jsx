import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../lib/theme'
import { Button, useToast } from '../components/UI'
import { supabase, isConfigured } from '../lib/supabase'
import { useAuth } from '../App'
import { Lock, ArrowRight, Buildings } from '@phosphor-icons/react'

export default function Invite() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [bizName, setBizName]   = useState('')
  const navigate  = useNavigate()
  const toast     = useToast()
  const { setMockAuth, setAuthDirect } = useAuth()

  // Once Supabase processes the invite magic-link token, the user is
  // authenticated. Fetch their linked business name to personalise the UI.
  useEffect(() => {
    if (!isConfigured) { setBizName('Your Business'); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const { data } = await supabase
        .from('clients')
        .select('business_name')
        .eq('profile_id', session.user.id)
        .single()
      if (data) setBizName(data.business_name)
    })
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirm) { toast('Passwords do not match', 'danger'); return }
    if (password.length < 8)  { toast('Password must be at least 8 characters', 'danger'); return }
    setLoading(true)

    try {
      if (!isConfigured) { setMockAuth('client'); navigate('/dashboard'); return }

      const { data, error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      // Fetch profile and set auth state atomically before navigating.
      // Without this, RequireAuth sees user!=null but profile=null for the
      // brief window before onAuthStateChange fires and bounces to /login.
      let prof = null
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        prof = profData || null
      } catch { /* profile fetch failure is non-fatal */ }

      setAuthDirect(data.user, prof)
      toast('Welcome to Upranked! Your account is ready.', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Something went wrong', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bgSubtle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      fontFamily: t.font,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#4F46E5"/>
            <path d="M6 20L11 13L15 17L22 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="22" cy="8" r="2" fill="#818CF8"/>
          </svg>
          <span style={{ fontSize: t.text2xl, fontWeight: 700, color: t.text, letterSpacing: '-0.03em' }}>
            Upranked
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: t.radiusXl,
          padding: '36px 32px',
          boxShadow: t.shadowMd,
        }}>
          {/* Business badge */}
          {bizName && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: t.accentSoft, border: `1px solid ${t.accentSubtle}`,
              borderRadius: t.radiusFull, padding: '4px 12px',
              fontSize: t.textSm, color: t.accent, fontWeight: 500,
              marginBottom: 20,
            }}>
              <Buildings size={12} weight="bold" />
              {bizName}
            </div>
          )}

          <h1 style={{
            fontFamily: t.font, fontSize: t.text2xl, fontWeight: 700,
            color: t.text, margin: '0 0 6px', letterSpacing: '-0.03em',
          }}>
            Welcome to Upranked
          </h1>
          <p style={{ fontSize: t.textMd, color: t.textMuted, margin: '0 0 28px', lineHeight: 1.5 }}>
            Create a password to access your client dashboard.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormField label="Create Password" icon={<Lock size={14} color={t.textMuted} />}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                style={fieldInputSx}
                onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
                onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              />
            </FormField>

            <FormField label="Confirm Password" icon={<Lock size={14} color={t.textMuted} />}>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                style={fieldInputSx}
                onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
                onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              />
            </FormField>

            <Button type="submit" fullWidth disabled={loading} size="lg" style={{ marginTop: 8, borderRadius: t.radiusMd }}>
              {loading ? 'Setting up…' : (
                <>
                  Access My Dashboard
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: t.textSm, color: t.textMuted }}>
          Not expecting this?{' '}
          <a href="mailto:charan@upranked.co" style={{ color: t.accent, textDecoration: 'none', fontWeight: 500 }}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}

const fieldInputSx = {
  width: '100%',
  padding: '9px 12px 9px 36px',
  border: `1px solid ${t.border}`,
  borderRadius: t.radiusMd,
  fontFamily: t.font,
  fontSize: t.textMd,
  color: t.text,
  background: t.card,
  outline: 'none',
  boxSizing: 'border-box',
  boxShadow: t.shadowInset,
  transition: `border-color 80ms, box-shadow 80ms`,
}

function FormField({ label, icon, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: t.textBase, fontWeight: 500, color: t.textSecond, fontFamily: t.font }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', pointerEvents: 'none',
        }}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}
