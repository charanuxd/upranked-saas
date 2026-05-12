import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { t } from '../lib/theme'
import { Button, useToast } from '../components/UI'
import { createLoginClient, isConfigured, SUPABASE_AUTH_KEY } from '../lib/supabase'
import { useAuth } from '../App'
import { Envelope, Lock, ArrowRight } from '@phosphor-icons/react'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()
  const toast    = useToast()
  const { setMockAuth, setAuthDirect } = useAuth()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isConfigured) {
        if (email === 'admin@upranked.co' && password === 'demo') {
          setMockAuth('admin'); navigate('/admin')
        } else if (password === 'demo') {
          setMockAuth('client'); navigate('/dashboard')
        } else {
          toast('Demo: use admin@upranked.co / demo or any email / demo', 'info')
        }
        return
      }

      const withTimeout = (p, ms, label) => Promise.race([
        p,
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))
      ])

      // Quick connectivity check before attempting sign-in.
      try {
        await withTimeout(
          fetch('https://cnqobihoukbsxwyemrbm.supabase.co/auth/v1/health', { method: 'GET', cache: 'no-store' }),
          4000, 'Connectivity check'
        )
      } catch {
        throw new Error("Can't reach Upranked servers. Try a Private / Incognito window — a browser extension may be blocking the connection.")
      }

      // Use an isolated client for sign-in.
      //
      // The main supabase client may have a stuck internal lock: if the app
      // initialised with an expired session, getSession() made a refresh HTTP
      // call that is still in flight holding the lock. signInWithPassword()
      // on the same client would block on that lock until our timeout fires.
      //
      // createLoginClient() creates a client with a unique storageKey, giving
      // it its own independent lock. It finds no session in its private storage
      // slot so getSession() returns instantly and signInWithPassword() runs
      // immediately with zero lock contention.
      const loginClient = createLoginClient()
      const { data, error } = await withTimeout(
        loginClient.auth.signInWithPassword({ email, password }),
        15000, 'Sign-in'
      )
      if (error) throw error

      // Persist the session into the main client's localStorage slot so it
      // survives page reloads and the auto-refresh timer can find it.
      if (SUPABASE_AUTH_KEY && data.session) {
        try { localStorage.setItem(SUPABASE_AUTH_KEY, JSON.stringify(data.session)) } catch {}
      }

      // Fetch the full profile via the login client (it holds the session in
      // memory even with persistSession:false, so RLS headers are correct).
      let prof = null
      try {
        const { data: profData } = await withTimeout(
          loginClient.from('profiles').select('*').eq('id', data.user.id).single(),
          8000, 'Profile lookup'
        )
        prof = profData || null
      } catch {
        console.warn('[Login] profile fetch timed out or failed')
      }

      // Set user + profile atomically in the auth context BEFORE navigating.
      //
      // RequireAuth checks both `user` and `profile` on every render. If we
      // navigate and rely on the async onAuthStateChange → loadProfile path,
      // RequireAuth will see user≠null but profile=null for the brief window
      // between setUser() and the DB call completing, and will immediately
      // redirect back to /login. setAuthDirect sets both in one call so React
      // flushes a single consistent render with both values present.
      setAuthDirect(data.user, prof)

      try { sessionStorage.removeItem('_auth_timeout_reloads') } catch {}
      navigate(prof?.role === 'admin' ? '/admin' : '/dashboard')

    } catch (err) {
      toast(err.message || 'Sign in failed', 'danger')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: t.bgSubtle,
      display: 'flex',
      fontFamily: t.font,
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: '0 0 420px',
        background: t.sidebar,
        display: 'flex', flexDirection: 'column',
        padding: '48px 44px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background vector illustration */}
        <BrandIllustration />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#4F46E5"/>
            <path d="M6 20L11 13L15 17L22 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="22" cy="8" r="2" fill="#818CF8"/>
          </svg>
          <span style={{ fontFamily: t.font, fontSize: t.text2xl, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
            Upranked
          </span>
        </div>

        {/* Hero copy */}
        <div style={{ marginTop: 'auto', marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: t.font, fontSize: '26px', fontWeight: 700,
            color: '#FFFFFF', lineHeight: 1.3, letterSpacing: '-0.03em',
            marginBottom: 14, margin: 0,
          }}>
            Turn every job into a 5-star review
          </h1>
          <p style={{
            fontSize: t.textMd, color: '#94A3B8',
            lineHeight: 1.6, marginTop: 12, marginBottom: 0,
            maxWidth: 300,
          }}>
            Automated review collection for service businesses that want to rank higher and win more.
          </p>

          {/* Social proof chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              '4.9 avg rating',
              '3x more reviews',
              'Google verified',
            ].map(chip => (
              <span key={chip} style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '5px 12px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: t.radiusFull,
                fontSize: t.textSm, color: '#CBD5E1',
                fontWeight: 500, fontFamily: t.font,
              }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {!isConfigured && (
            <div style={{
              background: t.accentSoft,
              border: `1px solid ${t.accentSubtle}`,
              borderRadius: t.radiusMd,
              padding: '10px 14px',
              marginBottom: 24,
              fontSize: t.textBase, color: t.accent, fontFamily: t.font,
            }}>
              <strong>Demo mode</strong> — use <code style={{ background: t.card, padding: '1px 5px', borderRadius: 3, fontSize: t.textSm }}>admin@upranked.co</code> / <code style={{ background: t.card, padding: '1px 5px', borderRadius: 3, fontSize: t.textSm }}>demo</code>
            </div>
          )}

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: t.font, fontSize: t.text3xl, fontWeight: 700,
              color: t.text, margin: 0, letterSpacing: '-0.03em',
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: t.textMd, color: t.textMuted, margin: '6px 0 0', fontFamily: t.font }}>
              Sign in to your Upranked account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormField label="Email address" icon={<Envelope size={14} color={t.textMuted} />}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{ ...fieldInputSx }}
                onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
                onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              />
            </FormField>

            <FormField label="Password" icon={<Lock size={14} color={t.textMuted} />}>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" required
                style={{ ...fieldInputSx }}
                onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
                onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: t.textBase, color: t.accent, textDecoration: 'none', fontWeight: 500, fontFamily: t.font }}
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth disabled={loading} size="lg" style={{ marginTop: 6, borderRadius: t.radiusMd }}>
              {loading ? 'Signing in…' : (
                <>
                  Sign In
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: t.textBase, color: t.textMuted, fontFamily: t.font }}>
            Don&apos;t have access?{' '}
            <a href="https://upranked.co" style={{ color: t.accent, fontWeight: 500, textDecoration: 'none' }}>
              Learn more
            </a>
          </p>
        </div>
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

// Background vector illustration for left panel
function BrandIllustration() {
  return (
    <svg
      width="420" height="500"
      viewBox="0 0 420 500"
      fill="none"
      style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.06, pointerEvents: 'none' }}
    >
      {/* Abstract upward chart shape */}
      <path d="M-40 400 Q80 300 160 220 Q240 140 320 80 Q380 40 460 0" stroke="white" strokeWidth="60" strokeLinecap="round" fill="none"/>
      <path d="M-40 460 Q80 360 160 280 Q240 200 320 140" stroke="white" strokeWidth="40" strokeLinecap="round" fill="none"/>
      <circle cx="320" cy="80" r="60" fill="white"/>
      <circle cx="160" cy="220" r="40" fill="white"/>
      {/* Stars */}
      <circle cx="80" cy="120" r="6" fill="white"/>
      <circle cx="200" cy="60" r="4" fill="white"/>
      <circle cx="360" cy="200" r="5" fill="white"/>
    </svg>
  )
}
