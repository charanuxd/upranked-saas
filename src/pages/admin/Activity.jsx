import { useState, useEffect } from 'react'
import { t } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_ACTIVITY, MOCK_CLIENTS, timeAgo } from '../../lib/mock'
import { Button, Badge } from '../../components/UI'
import { statusBadge } from '../../lib/theme'

const typeIcons = {
  review_received:  '⭐',
  request_sent:     '📤',
  report_generated: '📊',
  note:             '📝',
  client_added:     '👤',
}

const typeLabels = {
  review_received:  'Review',
  request_sent:     'Request',
  report_generated: 'Report',
  note:             'Note',
  client_added:     'Client',
}

export default function Activity() {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [clients, setClients]     = useState([])

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        const allActivity = Object.values(MOCK_ACTIVITY).flat()
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setItems(allActivity)
        setClients(MOCK_CLIENTS)
        setLoading(false)
        return
      }
      const [{ data: act }, { data: cls }] = await Promise.all([
        supabase.from('activity_log').select('*, clients(business_name)').order('created_at', { ascending: false }).limit(200),
        supabase.from('clients').select('id, business_name'),
      ])
      setItems(act || [])
      setClients(cls || [])
      setLoading(false)
    }
    load()
  }, [])

  function exportCSV() {
    const rows = [['Date', 'Type', 'Description', 'Client']]
    filtered.forEach(item => {
      rows.push([
        new Date(item.created_at).toLocaleDateString(),
        item.type || '',
        item.description || '',
        item.clients?.business_name || item.client_id || '',
      ])
    })
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'activity.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false
    if (clientFilter !== 'all' && item.client_id !== clientFilter) return false
    return true
  })

  const types = ['all', ...Array.from(new Set(items.map(i => i.type).filter(Boolean)))]

  return (
    <div>
      <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: t.fontBody }}>Activity Log</h1>
        <Button variant="secondary" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>

      <div style={{ padding: 32, maxWidth: 1100 }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {types.map(type => (
              <button key={type} onClick={() => setFilter(type)} style={{ background: filter === type ? t.accent : t.card, border: `1px solid ${filter === type ? t.accent : t.border}`, borderRadius: t.radiusSm, padding: '5px 12px', fontSize: 12, color: filter === type ? '#fff' : t.textMuted, cursor: 'pointer', fontFamily: t.fontBody, textTransform: 'capitalize' }}>
                {type === 'all' ? 'All' : (typeLabels[type] || type)}
              </button>
            ))}
          </div>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} style={{ border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '5px 12px', fontSize: 12, fontFamily: t.fontBody, color: t.textMuted, background: t.card, outline: 'none' }}>
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
          </select>
          <span style={{ fontSize: 12, color: t.textMuted, alignSelf: 'center', marginLeft: 'auto' }}>{filtered.length} events</span>
        </div>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>No activity found.</div>
          ) : (
            filtered.map((item, i) => (
              <div key={item.id || i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.bg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginTop: 2 }}>
                  {typeIcons[item.type] || '•'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: t.text, margin: 0, lineHeight: 1.5 }}>{item.description}</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: t.textMuted }}>{timeAgo(item.created_at)}</span>
                    {item.type && (
                      <span style={{ fontSize: 11, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, padding: '1px 6px', color: t.textMuted, textTransform: 'capitalize' }}>
                        {typeLabels[item.type] || item.type}
                      </span>
                    )}
                    {(item.clients?.business_name || item.client_id) && (
                      <span style={{ fontSize: 11, color: t.textMuted }}>{item.clients?.business_name || item.client_id}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
