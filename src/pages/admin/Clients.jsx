import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { t, statusBadge } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_CLIENTS } from '../../lib/mock'
import { Button, Badge, Modal, useToast, PageHeader, SearchInput, Select } from '../../components/UI'
import {
  Plus, PencilSimple, Envelope, ArrowUpRight, Star, Buildings,
  Users,
} from '@phosphor-icons/react'

const EMPTY = {
  business_name: '', owner_name: '', owner_email: '', owner_phone: '',
  google_profile_url: '', review_slug: '', status: 'active', internal_notes: '',
}

function FieldRow({ label, required, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: t.textBase, fontWeight: 500, color: t.textSecond, fontFamily: t.font }}>
        {label}{required && <span style={{ color: t.danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: t.textSm, color: t.textMuted, fontFamily: t.font }}>{hint}</span>}
    </div>
  )
}

function ClientForm({ value, onChange }) {
  const inputSx = {
    width: '100%', padding: '8px 12px',
    border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
    fontFamily: t.font, fontSize: t.textMd, color: t.text,
    background: t.card, outline: 'none', boxSizing: 'border-box',
    boxShadow: t.shadowInset,
    transition: `border-color ${t.transFast}`,
  }
  const fields = [
    { key: 'business_name', label: 'Business Name', required: true },
    { key: 'owner_name',    label: 'Owner Name',    required: true },
    { key: 'owner_email',   label: 'Owner Email',   type: 'email', required: true },
    { key: 'owner_phone',   label: 'Phone',         type: 'tel' },
    { key: 'google_profile_url', label: 'Google Profile URL', type: 'url' },
    { key: 'review_slug',  label: 'Review Slug',   hint: 'Used in /review/:slug' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {fields.map(f => (
        <FieldRow key={f.key} label={f.label} required={f.required} hint={f.hint}>
          <input
            type={f.type || 'text'}
            value={value[f.key] || ''}
            onChange={e => onChange({ ...value, [f.key]: e.target.value })}
            required={f.required}
            onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
            onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
            style={inputSx}
          />
        </FieldRow>
      ))}
      <FieldRow label="Status">
        <select
          value={value.status || 'active'}
          onChange={e => onChange({ ...value, status: e.target.value })}
          style={{ ...inputSx, cursor: 'pointer' }}
        >
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="paused">Paused</option>
        </select>
      </FieldRow>
      <FieldRow label="Internal Notes">
        <textarea
          value={value.internal_notes || ''}
          onChange={e => onChange({ ...value, internal_notes: e.target.value })}
          rows={3}
          onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
          onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
          style={{ ...inputSx, resize: 'vertical', lineHeight: 1.5 }}
        />
      </FieldRow>
    </div>
  )
}

export default function Clients() {
  const [clients, setClients]       = useState([])
  const [showAdd, setShowAdd]       = useState(false)
  const [showEdit, setShowEdit]     = useState(null)
  const [showInvite, setShowInvite] = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [search, setSearch]         = useState('')
  const toast = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    if (!isConfigured) { setClients(MOCK_CLIENTS); return }
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function saveClient(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (!isConfigured) {
        if (showEdit) setClients(cs => cs.map(c => c.id === showEdit.id ? { ...c, ...form } : c))
        else setClients(cs => [{ ...form, id: `client-${Date.now()}`, created_at: new Date().toISOString() }, ...cs])
        toast(showEdit ? 'Client updated' : 'Client added', 'success')
        closeModals(); return
      }
      if (showEdit) {
        const { error } = await supabase.from('clients').update(form).eq('id', showEdit.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clients').insert(form)
        if (error) throw error
      }
      toast(showEdit ? 'Client updated' : 'Client added', 'success')
      closeModals()
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
      if (!isConfigured) {
        toast(`Demo: invite would be sent to ${inviteEmail}`, 'success')
        setShowInvite(null); setInviteEmail(''); return
      }
      const { data, error } = await supabase.functions.invoke('invite-client', {
        body: { client_id: showInvite.id, email: inviteEmail, redirect_to: `${window.location.origin}/invite` },
      })
      if (error) throw new Error(error.message || 'Invite failed')
      if (data?.error) throw new Error(data.error)
      toast(data?.message || `Invite sent to ${inviteEmail}`, 'success')
      setShowInvite(null); setInviteEmail('')
      await load()
    } catch (err) {
      toast(err.message || 'Invite failed', 'danger')
    } finally {
      setSaving(false)
    }
  }

  function closeModals() { setShowAdd(false); setShowEdit(null); setForm(EMPTY) }
  function openEdit(c)   { setForm({ ...c }); setShowEdit(c) }
  function openInvite(c) { setShowInvite(c); setInviteEmail(c.owner_email || '') }

  const filtered = clients.filter(c =>
    [c.business_name, c.owner_name, c.owner_email].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  const inputSx = {
    width: '100%', padding: '8px 12px', border: `1px solid ${t.border}`,
    borderRadius: t.radiusMd, fontFamily: t.font, fontSize: t.textMd,
    color: t.text, background: t.card, outline: 'none', boxSizing: 'border-box',
    boxShadow: t.shadowInset,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Clients"
        right={
          <Button onClick={() => { setForm(EMPTY); setShowAdd(true) }} size="sm">
            <Plus size={13} weight="bold" />
            Add Client
          </Button>
        }
      />

      <div style={{ padding: '24px 28px 40px', flex: 1, overflow: 'auto' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients…"
            style={{ width: 280 }}
          />
          {search && (
            <span style={{ fontSize: t.textBase, color: t.textMuted, fontFamily: t.font }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Table card */}
        <div style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: t.radiusXl,
          boxShadow: t.shadow,
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {['Business', 'Owner', 'Email', 'Rating', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 18px', textAlign: 'left',
                    fontSize: t.textXs, fontWeight: 600,
                    color: t.textMuted, textTransform: 'uppercase',
                    letterSpacing: '0.05em', background: t.bgSubtle,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const st = statusBadge(c.status || 'active')
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none', transition: `background ${t.transFast}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                  >
                    <td style={{ padding: '12px 18px' }}>
                      <Link
                        to={`/admin/clients/${c.id}`}
                        style={{
                          fontSize: t.textMd, fontWeight: 500,
                          color: t.text, textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = t.accent }}
                        onMouseLeave={e => { e.currentTarget.style.color = t.text }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: t.radiusMd,
                          background: t.accentSoft, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, color: t.accent,
                        }}>
                          <Buildings size={13} weight="bold" />
                        </div>
                        {c.business_name}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: t.textMd, color: t.textSecond }}>
                      {c.owner_name}
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: t.textMd, color: t.textMuted }}>
                      {c.owner_email}
                    </td>
                    <td style={{ padding: '12px 18px', fontSize: t.textMd, color: t.text }}>
                      {c.current_rating ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Star size={12} weight="fill" color="#F59E0B" />
                          {c.current_rating}
                        </span>
                      ) : (
                        <span style={{ color: t.textMuted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <Badge bg={st.bg} color={st.color} border={st.border}>{st.label}</Badge>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
                          <PencilSimple size={12} weight="bold" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openInvite(c)}>
                          <Envelope size={12} weight="bold" />
                          Invite
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div style={{
                      padding: '52px 20px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: t.radiusXl,
                        background: t.bgSubtle, border: `1px solid ${t.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: t.textMuted,
                      }}>
                        <Users size={18} />
                      </div>
                      <div style={{ fontSize: t.textMd, fontWeight: 600, color: t.text, fontFamily: t.font }}>
                        {search ? 'No clients match your search' : 'No clients yet'}
                      </div>
                      {!search && (
                        <div style={{ fontSize: t.textMd, color: t.textMuted, fontFamily: t.font }}>
                          Add your first client to get started
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showAdd || !!showEdit}
        onClose={closeModals}
        title={showEdit ? 'Edit Client' : 'Add Client'}
        description={showEdit ? 'Update client details.' : 'Add a new client to start managing their reputation.'}
        width={520}
      >
        <form onSubmit={saveClient}>
          <ClientForm value={form} onChange={setForm} />
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <Button type="button" variant="secondary" fullWidth onClick={closeModals}>Cancel</Button>
            <Button type="submit" fullWidth loading={saving}>
              {showEdit ? 'Save Changes' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal
        open={!!showInvite}
        onClose={() => { setShowInvite(null); setInviteEmail('') }}
        title="Invite Client"
        description={`Send a login link to ${showInvite?.owner_name || 'this client'} for their dashboard.`}
        width={440}
      >
        <form onSubmit={sendInvite} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FieldRow label="Email Address" required>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
              onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              style={inputSx}
            />
          </FieldRow>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="button" variant="secondary" fullWidth onClick={() => { setShowInvite(null); setInviteEmail('') }}>Cancel</Button>
            <Button type="submit" fullWidth loading={saving}>
              <Envelope size={13} weight="bold" />
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
