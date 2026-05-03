import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { t } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_CLIENTS } from '../../lib/mock'
import { Button, Badge, Modal, useToast } from '../../components/UI'
import { statusBadge } from '../../lib/theme'

const EMPTY = { business_name: '', owner_name: '', owner_email: '', owner_phone: '', google_profile_url: '', review_slug: '', status: 'active', internal_notes: '' }

function ClientForm({ value, onChange }) {
  const fields = [
    { key: 'business_name', label: 'Business Name', required: true },
    { key: 'owner_name',    label: 'Owner Name', required: true },
    { key: 'owner_email',   label: 'Owner Email', type: 'email', required: true },
    { key: 'owner_phone',   label: 'Owner Phone', type: 'tel' },
    { key: 'google_profile_url', label: 'Google Profile URL', type: 'url' },
    { key: 'review_slug',  label: 'Review Page Slug', placeholder: 'e.g. metro-hvac', hint: 'Used in /review/:slug link' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {fields.map(f => (
        <div key={f.key}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>
            {f.label}{f.required && <span style={{ color: t.danger }}> *</span>}
          </label>
          <input
            type={f.type || 'text'}
            value={value[f.key] || ''}
            onChange={e => onChange({ ...value, [f.key]: e.target.value })}
            placeholder={f.placeholder || ''}
            required={f.required}
            style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', boxSizing: 'border-box' }}
          />
          {f.hint && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{f.hint}</div>}
        </div>
      ))}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>Status</label>
        <select value={value.status || 'active'} onChange={e => onChange({ ...value, status: e.target.value })} style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none' }}>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="paused">Paused</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>Internal Notes</label>
        <textarea value={value.internal_notes || ''} onChange={e => onChange({ ...value, internal_notes: e.target.value })} rows={3} style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>
    </div>
  )
}

export default function Clients() {
  const [clients, setClients]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [showEdit, setShowEdit]   = useState(null)
  const [showInvite, setShowInvite] = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [saving, setSaving]       = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [search, setSearch]       = useState('')
  const toast = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    if (!isConfigured) { setClients(MOCK_CLIENTS); setLoading(false); return }
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function saveClient(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (!isConfigured) {
        if (showEdit) {
          setClients(cs => cs.map(c => c.id === showEdit.id ? { ...c, ...form } : c))
        } else {
          setClients(cs => [{ ...form, id: `client-${Date.now()}`, created_at: new Date().toISOString() }, ...cs])
        }
        toast(showEdit ? 'Client updated' : 'Client added', 'success')
        setShowAdd(false); setShowEdit(null); setForm(EMPTY)
        return
      }
      if (showEdit) {
        const { error } = await supabase.from('clients').update(form).eq('id', showEdit.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clients').insert(form)
        if (error) throw error
      }
      toast(showEdit ? 'Client updated' : 'Client added', 'success')
      setShowAdd(false); setShowEdit(null); setForm(EMPTY)
      await load()
    } catch (err) {
      toast(err.message, 'danger')
    } finally {
      setSaving(false)
    }
  }

  async function sendInvite(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (isConfigured) {
        const { error } = await supabase.auth.admin?.inviteUserByEmail(inviteEmail)
        if (error) throw error
      }
      toast(`Invite sent to ${inviteEmail}`, 'success')
      setShowInvite(null); setInviteEmail('')
    } catch (err) {
      toast(isConfigured ? err.message : 'Demo mode: invite simulated', isConfigured ? 'danger' : 'success')
      if (!isConfigured) { setShowInvite(null); setInviteEmail('') }
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients.filter(c =>
    c.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.owner_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: t.fontBody }}>Clients</h1>
        <Button onClick={() => { setForm(EMPTY); setShowAdd(true) }}>+ Add Client</Button>
      </div>

      <div style={{ padding: 32, maxWidth: 1200 }}>
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 14px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.card, outline: 'none', width: 280 }}
          />
        </div>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.bg }}>
                {['Business', 'Owner', 'Email', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const st = statusBadge(c.status || 'active')
                return (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/admin/clients/${c.id}`} style={{ fontSize: 14, fontWeight: 500, color: t.accent, textDecoration: 'none' }}>{c.business_name}</Link>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: t.text }}>{c.owner_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: t.textMuted }}>{c.owner_email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: t.text }}>{c.current_rating ? `${c.current_rating} ★` : '—'}</td>
                    <td style={{ padding: '12px 16px' }}><Badge bg={st.bg} color={st.color}>{st.label}</Badge></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="secondary" onClick={() => { setForm({ ...c }); setShowEdit(c) }}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowInvite(c); setInviteEmail(c.owner_email || '') }}>Invite</Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
                    {search ? 'No clients match your search.' : 'No clients yet. Add your first client.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={showAdd || !!showEdit} onClose={() => { setShowAdd(false); setShowEdit(null); setForm(EMPTY) }} title={showEdit ? 'Edit Client' : 'Add New Client'}>
        <form onSubmit={saveClient}>
          <ClientForm value={form} onChange={setForm} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button type="button" variant="secondary" fullWidth onClick={() => { setShowAdd(false); setShowEdit(null); setForm(EMPTY) }}>Cancel</Button>
            <Button type="submit" fullWidth disabled={saving}>{saving ? 'Saving…' : (showEdit ? 'Save Changes' : 'Add Client')}</Button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal open={!!showInvite} onClose={() => { setShowInvite(null); setInviteEmail('') }} title="Send Client Invite">
        <form onSubmit={sendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: t.textMuted }}>
            Send an email invite to <strong style={{ color: t.text }}>{showInvite?.owner_name}</strong> so they can access their client dashboard.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 5 }}>Email Address</label>
            <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="button" variant="secondary" fullWidth onClick={() => { setShowInvite(null); setInviteEmail('') }}>Cancel</Button>
            <Button type="submit" fullWidth disabled={saving}>{saving ? 'Sending…' : 'Send Invite'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
