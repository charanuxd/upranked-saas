import { useState } from 'react'
import { t } from '../../lib/theme'
import { useAuth } from '../../App'
import { supabase, isConfigured } from '../../lib/supabase'
import { Button, useToast } from '../../components/UI'

export default function Settings() {
  const { profile } = useAuth()
  const [name, setName]         = useState(profile?.full_name || '')
  const [email, setEmail]       = useState(profile?.email || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving]     = useState(false)
  const toast = useToast()

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (!isConfigured) { toast('Profile updated (demo mode)', 'success'); setSaving(false); return }
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', profile.id)
      if (error) throw error
      toast('Profile updated', 'success')
    } catch (err) {
      toast(err.message, 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    if (newPw !== confirmPw) { toast('Passwords do not match', 'danger'); return }
    if (newPw.length < 8) { toast('Password must be at least 8 characters', 'danger'); return }
    setSaving(true)
    try {
      if (!isConfigured) { toast('Password changed (demo mode)', 'success'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setSaving(false); return }
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      toast('Password changed', 'success')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      toast(err.message, 'danger')
    } finally {
      setSaving(false)
    }
  }

  const section = (title, desc) => (
    <div style={{ marginBottom: 8 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 }}>{title}</h3>
      {desc && <p style={{ fontSize: 13, color: t.textMuted }}>{desc}</p>}
    </div>
  )

  const field = (label, value, onChange, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <div>
      <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: t.fontBody }}>Settings</h1>
      </div>

      <div style={{ padding: 32, maxWidth: 600 }}>

        {/* Profile */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: 24, marginBottom: 20 }}>
          {section('Profile', 'Update your name and email address.')}
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            {field('Full Name', name, setName, 'text', 'Your name')}
            {field('Email', email, setEmail, 'email', 'you@example.com')}
            <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </form>
        </div>

        {/* Password */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: 24, marginBottom: 20 }}>
          {section('Change Password', 'Use a strong password you don\'t use elsewhere.')}
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            {field('New Password', newPw, setNewPw, 'password', 'Min. 8 characters')}
            {field('Confirm New Password', confirmPw, setConfirmPw, 'password', 'Repeat password')}
            <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>{saving ? 'Saving…' : 'Update Password'}</Button>
          </form>
        </div>

        {/* SMS / Email templates */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: 24, marginBottom: 20 }}>
          {section('Review Request Templates', 'Default messages sent to customers.')}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>SMS Template</label>
              <textarea defaultValue="Hi {name}, thanks for choosing {business}! We'd love your feedback — it only takes 30 seconds: {link}" rows={3} style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>Email Subject</label>
              <input defaultValue="How was your experience with {business}?" type="text" style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <Button style={{ alignSelf: 'flex-start' }} onClick={() => toast('Templates saved (demo)', 'success')}>Save Templates</Button>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ background: t.card, border: `1px solid ${t.danger}44`, borderRadius: t.radius, padding: 24 }}>
          {section('Danger Zone')}
          <p style={{ fontSize: 13, color: t.textMuted, marginTop: 8, marginBottom: 16 }}>These actions are irreversible. Please be certain.</p>
          <Button variant="danger" onClick={() => toast('Contact support to delete your account', 'info')}>Delete Account</Button>
        </div>
      </div>
    </div>
  )
}
