import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../lib/theme'
import { Button, Input, useToast } from '../components/UI'
import { supabase, isConfigured } from '../lib/supabase'
import { useAuth } from '../App'

export default function Invite() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [bizName, setBizName]     = useState('')
  const navigate = useNavigate()
  const toast    = useToast()
  const { setMockAuth } = useAuth()

  useEffect(() => {
    if (!isConfigured) { setBizName('Your Business'); return }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase.from('clients').select('business_name').eq('profile_id', session.user.id).single()
        if (data) setBizName(data.business_name)
      }
    })
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (password !== confirm) { toast('Passwords do not match', 'danger'); return }
    if (password.length < 8) { toast('Password must be at least 8 characters', 'danger'); return }
    setLoading(true)
    try {
      if (!isConfigured) { setMockAuth('client'); navigate('/dashboard'); return }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast('Password set! Welcome to Upranked.', 'success')
      navigate('/dashboard')
    } catch (err) {
      toast(err.message || 'Something went wrong', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '40px 32px', boxShadow: t.shadowMd, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
          <h1 style={{ fontFamily: t.fontHeading, fontSize: 24, color: t.text, marginBottom: 8 }}>Welcome to Upranked</h1>
          {bizName && <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 28 }}>You're setting up access for <strong style={{ color: t.text }}>{bizName}</strong>. Create a password to get started.</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            <Input label="Create Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
            <Input label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
            <Button type="submit" fullWidth disabled={loading} size="lg" style={{ marginTop: 8 }}>{loading ? 'Setting up…' : 'Access My Dashboard'}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
