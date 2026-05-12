import { useState, useEffect } from 'react'
import { t } from '../../lib/theme'
import { useAuth } from '../../App'
import { supabase, isConfigured } from '../../lib/supabase'
import { Button, useToast, PageHeader } from '../../components/UI'
import { User, Lock, EnvelopeSimple, Warning } from '@phosphor-icons/react'

function Section({ icon: Icon, title, description, children }) {
  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: t.radiusXl,
      boxShadow: t.shadow,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* Section header */}
      <div style={{
        padding: '16px 22px',
        borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: t.bgSubtle,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: t.radiusMd,
          background: t.accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.accent, flexShrink: 0, marginTop: 1,
        }}>
          <Icon size={14} weight="bold" />
        </div>
        <div>
          <div style={{ fontFamily: t.font, fontSize: t.textLg, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>
            {title}
          </div>
          {description && (
            <div style={{ fontSize: t.textBase, color: t.textMuted, marginTop: 1, fontFamily: t.font }}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  )
}

function FieldGroup({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: t.textBase, fontWeight: 500, color: t.textSecond, fontFamily: t.font }}>
        {label}{required && <span style={{ color: t.danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputSx = (focused) => ({
  width: '100%', padding: '8px 12px',
  border: `1px solid ${focused ? t.borderFocus : t.border}`,
  borderRadius: t.radiusMd, fontFamily: t.font,
  fontSize: t.textMd, color: t.text, background: t.card,
  outline: 'none', boxSizing: 'border-box',
  boxShadow: focused ? `0 0 0 3px ${t.accentSubtle}` : t.shadowInset,
  transition: `border-color ${t.transFast}, box-shadow ${t.transFast}`,
})

function FocusInput({ type = 'text', value, onChange, placeholder, disabled, style: sx }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputSx(focused), ...(disabled ? { background: t.bgSubtle, color: t.textMuted, cursor: 'not-allowed' } : {}), ...sx }}
    />
  )
}

function FocusTextarea({ value, onChange, rows = 4 }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputSx(focused), resize: 'vertical', lineHeight: 1.5 }}
    />
  )
}

export default function Settings() {
  const { profile } = useAuth()
  const [name, setName]           = useState(profile?.full_name || '')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving]       = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [savingTpl, setSavingTpl] = useState(false)
  const [tplLoaded, setTplLoaded] = useState(false)
  const email = profile?.email || ''
  const toast = useToast()

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        setEmailSubject('How was your experience with {business}?')
        setEmailBody('Hi {name},\n\nThanks for choosing {business}! Your feedback helps us improve.')
        setTplLoaded(true)
        return
      }
      const { data } = await supabase.from('notification_settings').select('*').eq('id', 1).single()
      if (data) { setEmailSubject(data.email_subject || ''); setEmailBody(data.email_body || '') }
      setTplLoaded(true)
    }
    load()
  }, [])

  async function saveProfile(e) {
    e.preventDefault(); setSaving(true)
    try {
      if (!isConfigured) { toast('Profile updated (demo)', 'success'); return }
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', profile.id)
      if (error) throw error
      toast('Profile updated', 'success')
    } catch (err) { toast(err.message, 'danger') }
    finally { setSaving(false) }
  }

  async function changePassword(e) {
    e.preventDefault()
    if (newPw !== confirmPw) { toast('Passwords do not match', 'danger'); return }
    if (newPw.length < 8) { toast('Minimum 8 characters required', 'danger'); return }
    setSaving(true)
    try {
      if (!isConfigured) { toast('Password changed (demo)', 'success'); setNewPw(''); setConfirmPw(''); return }
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) throw error
      toast('Password updated', 'success')
      setNewPw(''); setConfirmPw('')
    } catch (err) { toast(err.message, 'danger') }
    finally { setSaving(false) }
  }

  async function saveTemplates() {
    setSavingTpl(true)
    try {
      if (!isConfigured) { toast('Templates saved (demo)', 'success'); return }
      const { error } = await supabase.from('notification_settings').update({
        email_subject: emailSubject, email_body: emailBody,
        updated_at: new Date().toISOString(),
      }).eq('id', 1)
      if (error) throw error
      toast('Templates saved', 'success')
    } catch (err) { toast(err.message, 'danger') }
    finally { setSavingTpl(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Settings" />

      <div style={{ padding: '24px 28px 40px', flex: 1, overflow: 'auto', maxWidth: 640 }}>

        {/* Profile */}
        <Section icon={User} title="Profile" description="Update your display name.">
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldGroup label="Full Name" required>
              <FocusInput value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </FieldGroup>
            <FieldGroup label="Email">
              <FocusInput type="email" value={email} disabled />
            </FieldGroup>
            <div>
              <Button type="submit" loading={saving} size="sm">Save Changes</Button>
            </div>
          </form>
        </Section>

        {/* Password */}
        <Section icon={Lock} title="Password" description="Use a strong password you don't use elsewhere.">
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FieldGroup label="New Password" required>
              <FocusInput type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" />
            </FieldGroup>
            <FieldGroup label="Confirm Password" required>
              <FocusInput type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" />
            </FieldGroup>
            <div>
              <Button type="submit" loading={saving} size="sm">Update Password</Button>
            </div>
          </form>
        </Section>

        {/* Email template */}
        <Section
          icon={EnvelopeSimple}
          title="Review Request Email"
          description="Template sent to customers. Use {name}, {business}, {link} as placeholders."
        >
          {!tplLoaded ? (
            <div style={{ fontSize: t.textMd, color: t.textMuted, fontFamily: t.font }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FieldGroup label="Subject Line">
                <FocusInput value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
              </FieldGroup>
              <FieldGroup label="Email Body">
                <FocusTextarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5} />
              </FieldGroup>
              <div>
                <Button size="sm" loading={savingTpl} onClick={saveTemplates}>Save Template</Button>
              </div>
            </div>
          )}
        </Section>

        {/* Danger zone */}
        <div style={{
          background: t.card,
          border: `1px solid ${t.dangerBorder}`,
          borderRadius: t.radiusXl,
          boxShadow: t.shadow,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 22px', background: t.dangerSoft,
            borderBottom: `1px solid ${t.dangerBorder}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Warning size={16} weight="bold" color={t.danger} />
            <span style={{ fontFamily: t.font, fontSize: t.textLg, fontWeight: 600, color: t.danger, letterSpacing: '-0.01em' }}>
              Danger Zone
            </span>
          </div>
          <div style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: t.textMd, color: t.textMuted, margin: 0, lineHeight: 1.55, fontFamily: t.font }}>
              Account deletion is handled manually. Email{' '}
              <a href="mailto:charanuxd@gmail.com?subject=Delete%20my%20Upranked%20account" style={{ color: t.accent, fontWeight: 500 }}>
                charanuxd@gmail.com
              </a>{' '}
              to remove your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
