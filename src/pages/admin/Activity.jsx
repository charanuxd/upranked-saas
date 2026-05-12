import { useState, useEffect } from 'react'
import { t, statusBadge } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_ACTIVITY, MOCK_CLIENTS, timeAgo } from '../../lib/mock'
import { Button, Badge, PageHeader, SearchInput } from '../../components/UI'
import {
  Star, PaperPlaneTilt, ChartLineUp, Note, UserPlus,
  ClockCounterClockwise, DownloadSimple,
} from '@phosphor-icons/react'

const typeConfig = {
  review_received:  { icon: Star,           label: 'Review',   bg: '#FFF7ED', color: '#C2410C' },
  request_sent:     { icon: PaperPlaneTilt, label: 'Request',  bg: t.accentSoft, color: t.accent },
  report_generated: { icon: ChartLineUp,    label: 'Report',   bg: t.successSoft, color: t.success },
  note:             { icon: Note,           label: 'Note',     bg: '#F5F3FF', color: '#7C3AED' },
  client_added:     { icon: UserPlus,       label: 'Client',   bg: t.successSoft, color: t.success },
}

export default function ActivityPage() {
  const [items, setItems]     = useState([])
  const [filter, setFilter]   = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [clients, setClients] = useState([])

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        const all = Object.values(MOCK_ACTIVITY).flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setItems(all)
        setClients(MOCK_CLIENTS)
        return
      }
      const [{ data: act }, { data: cls }] = await Promise.all([
        supabase.from('activity_log').select('*, clients(business_name)').order('created_at', { ascending: false }).limit(200),
        supabase.from('clients').select('id, business_name'),
      ])
      setItems(act || [])
      setClients(cls || [])
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
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'activity.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const types = ['all', ...Array.from(new Set(items.map(i => i.type).filter(Boolean)))]
  const filtered = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false
    if (clientFilter !== 'all' && item.client_id !== clientFilter) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Activity"
        right={
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <DownloadSimple size={13} weight="bold" />
            Export CSV
          </Button>
        }
      />

      <div style={{ padding: '24px 28px 40px', flex: 1, overflow: 'auto' }}>
        {/* Filters row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type filter pills */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {types.map(type => {
              const cfg = typeConfig[type]
              const isActive = filter === type
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px',
                    borderRadius: t.radiusFull,
                    border: `1px solid ${isActive ? t.accent : t.border}`,
                    background: isActive ? t.accentSoft : t.card,
                    color: isActive ? t.accent : t.textMuted,
                    fontSize: t.textBase,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: t.font,
                    transition: `all ${t.transFast}`,
                  }}
                >
                  {cfg && <cfg.icon size={11} weight="bold" color={isActive ? t.accent : t.textMuted} />}
                  {type === 'all' ? 'All' : (cfg?.label || type)}
                </button>
              )
            })}
          </div>

          {/* Client filter */}
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            style={{
              border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
              padding: '5px 10px', fontSize: t.textBase,
              fontFamily: t.font, color: t.textMuted,
              background: t.card, outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
          </select>

          <span style={{ fontSize: t.textBase, color: t.textMuted, fontFamily: t.font, marginLeft: 'auto' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Feed card */}
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: t.radiusXl, boxShadow: t.shadow, overflow: 'hidden',
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '52px 20px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: t.radiusXl, background: t.bgSubtle, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted }}>
                <ClockCounterClockwise size={18} />
              </div>
              <span style={{ fontSize: t.textMd, color: t.textMuted, fontFamily: t.font }}>No activity found</span>
            </div>
          ) : (
            filtered.map((item, i) => {
              const cfg = typeConfig[item.type] || { icon: ClockCounterClockwise, label: item.type, bg: t.bgSubtle, color: t.textMuted }
              const IconComp = cfg.icon
              return (
                <div
                  key={item.id || i}
                  style={{
                    display: 'flex', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : 'none',
                    alignItems: 'flex-start',
                    transition: `background ${t.transFast}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle }}
                  onMouseLeave={e => { e.currentTarget.style.background = '' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: t.radiusMd,
                    background: cfg.bg, flexShrink: 0, marginTop: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.color,
                  }}>
                    <IconComp size={14} weight="bold" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: t.textMd, color: t.text, margin: 0, lineHeight: 1.45, fontFamily: t.font }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: t.textSm, color: t.textMuted, fontFamily: t.font }}>
                        {timeAgo(item.created_at)}
                      </span>
                      <Badge bg={cfg.bg} color={cfg.color} border="transparent" size="xs">
                        {cfg.label || item.type}
                      </Badge>
                      {(item.clients?.business_name || item.client_id) && (
                        <span style={{ fontSize: t.textSm, color: t.textMuted, fontFamily: t.font }}>
                          {item.clients?.business_name || item.client_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
