import { useState } from 'react'
import { Link } from 'react-router-dom'
import { t } from '../lib/theme'
import { Button, Input, useToast } from '../components/UI'
import { supabase, isConfigured } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!isConfigured) { setSent(true); return }
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/invite` })
      if (error) throw error
      setSent(true)
    } catch (err) {
      toast(err.message || 'Something went wrong', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.text }}>Upranked</div>
          <p style={{ color: t.textMuted, fontSize: 14, marginTop: 4 }}>Reset your password</p>
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: 32, boxShadow: t.shadow }}>
          {sent ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 40 }}>📬</div>
              <h3 style={{ fontFamily: t.fontHeading, color: t.text }}>Check your email</h3>
              <p style={{ color: t.textMuted, fontSize: 14 }}>We've sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.</p>
              <Link to="/login"><Button variant="secondary" fullWidth>Back to Sign In</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required hint="We'll send a reset link to this address." />
              <Button type="submit" fullWidth disabled={loading} size="lg">{loading ? 'Sending…' : 'Send Reset Link'}</Button>
              <Link to="/login" style={{ textAlign: 'center', fontSize: 13, color: t.textMuted }}>Back to Sign In</Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
