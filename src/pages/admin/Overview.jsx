import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t, statusBadge } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_CLIENTS, MOCK_REVIEWS, MOCK_ACTIVITY } from '../../lib/mock'
import { StatCard } from '../../components/StatCard'
import { ActivityFeed } from '../../components/ActivityFeed'
import { Badge, PageHeader } from '../../components/UI'
import {
  Users, Star, ChartLineUp, PaperPlaneTilt, ArrowUpRight,
} from '@phosphor-icons/react'

export default function Overview() {
  const [clients, setClients]   = useState([])
  const [reviews, setReviews]   = useState([])
  const [activity, setActivity] = useState([])

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        setClients(MOCK_CLIENTS)
        const allReviews = Object.values(MOCK_REVIEWS).flat()
        setReviews(allReviews)
        const allActivity = Object.values(MOCK_ACTIVITY).flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setActivity(allActivity)
        return
      }
      const [c, r, a] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('review_date', { ascending: false }).limit(100),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20),
      ])
      setClients(c.data || [])
      setReviews(r.data || [])
      setActivity(a.data || [])
    }
    load()

    if (!isConfigured) return
    const channel = supabase.channel('admin-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, async () => {
        const { data } = await supabase.from('reviews').select('*').order('review_date', { ascending: false }).limit(100)
        setReviews(data || [])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, async () => {
        const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20)
        setActivity(data || [])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
        const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
        setClients(data || [])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalReviews  = reviews.length
  const avgRating     = reviews.length
    ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1)
    : '—'
  const activeClients = clients.filter(c => c.status === 'active').length

  const [cutoffs] = useState(() => ({
    cutoff30: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    cutoff60: new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10),
  }))
  const { cutoff30, cutoff60 } = cutoffs
  const newThisMonth  = reviews.filter(r => r.review_date >= cutoff30).length
  const newPriorMonth = reviews.filter(r => r.review_date >= cutoff60 && r.review_date < cutoff30).length
  const monthDelta    = newThisMonth - newPriorMonth
  const fmt = n => n > 0 ? `+${n}` : n < 0 ? `${n}` : null

  // Area chart data — review count per month
  const chartData = (() => {
    if (reviews.length === 0) return []
    const buckets = {}
    for (const r of reviews) {
      const key = (r.review_date || '').slice(0, 7)
      if (!key) continue
      if (!buckets[key]) buckets[key] = { reviews: 0, totalRating: 0 }
      buckets[key].reviews++
      buckets[key].totalRating += r.star_rating
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, { reviews: rv, totalRating }]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        reviews: rv,
        rating: Number((totalRating / rv).toFixed(2)),
      }))
  })()

  const stats = [
    { label: 'Active Clients', value: activeClients, icon: Users },
    { label: 'Total Reviews',  value: totalReviews, delta: fmt(newThisMonth), positive: newThisMonth >= 0, icon: Star },
    { label: 'Avg Rating',     value: avgRating === '—' ? '—' : `${avgRating}`, icon: ChartLineUp },
    { label: 'New This Month', value: newThisMonth, delta: fmt(monthDelta), positive: monthDelta >= 0, icon: PaperPlaneTilt },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: t.radiusMd, padding: '10px 14px',
        boxShadow: t.shadowMd, fontFamily: t.font,
      }}>
        <div style={{ fontSize: t.textBase, fontWeight: 600, color: t.text, marginBottom: 6 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ fontSize: t.textSm, color: t.textMuted, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ textTransform: 'capitalize' }}>{p.dataKey}</span>
            <span style={{ fontWeight: 600, color: t.text, marginLeft: 'auto' }}>{p.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Overview" />

      <div style={{ padding: '28px 28px 40px', flex: 1, overflow: 'auto' }}>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Chart + Activity row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 20, marginBottom: 28,
        }}>
          {/* Chart */}
          <div style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: t.radiusXl, padding: '20px 22px',
            boxShadow: t.shadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{
                  fontFamily: t.font, fontSize: t.textMd, fontWeight: 600,
                  color: t.text, margin: 0, letterSpacing: '-0.01em',
                }}>
                  Review Volume
                </h3>
                <p style={{ fontSize: t.textSm, color: t.textMuted, margin: '2px 0 0' }}>
                  New reviews per month across all clients
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={t.accent} stopOpacity={0.12}/>
                      <stop offset="95%" stopColor={t.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="none" stroke={t.border} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: t.textMuted, fontFamily: t.font }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: t.textMuted, fontFamily: t.font }}
                    axisLine={false} tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="reviews"
                    stroke={t.accent}
                    strokeWidth={2}
                    fill="url(#gradReviews)"
                    dot={false}
                    activeDot={{ r: 4, fill: t.accent, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Activity */}
          <div style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: t.radiusXl, padding: '20px 22px',
            boxShadow: t.shadow,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <h3 style={{
                fontFamily: t.font, fontSize: t.textMd, fontWeight: 600,
                color: t.text, margin: 0, letterSpacing: '-0.01em',
              }}>
                Recent Activity
              </h3>
              <Link
                to="/admin/activity"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: t.textSm, color: t.accent, textDecoration: 'none',
                  fontWeight: 500, fontFamily: t.font,
                }}
              >
                View all <ArrowUpRight size={12} weight="bold" />
              </Link>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ActivityFeed items={activity.slice(0, 7)} />
            </div>
          </div>
        </div>

        {/* Clients quick view */}
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: t.radiusXl, boxShadow: t.shadow, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: `1px solid ${t.border}`,
          }}>
            <h3 style={{
              fontFamily: t.font, fontSize: t.textMd, fontWeight: 600,
              color: t.text, margin: 0, letterSpacing: '-0.01em',
            }}>
              Clients
            </h3>
            <Link
              to="/admin/clients"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: t.textSm, color: t.accent, textDecoration: 'none',
                fontWeight: 500, fontFamily: t.font,
              }}
            >
              Manage all <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>

          {clients.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: t.textMuted, fontSize: t.textMd, fontFamily: t.font }}>
              No clients yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Business', 'Owner', 'Rating', 'Status', ''].map(h => (
                    <th key={h} style={{
                      padding: '9px 20px', textAlign: 'left',
                      fontSize: t.textXs, fontWeight: 600,
                      color: t.textMuted, textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 8).map((c, i) => {
                  const st = statusBadge(c.status || 'active')
                  return (
                    <tr
                      key={c.id}
                      style={{ borderBottom: i < Math.min(clients.length, 8) - 1 ? `1px solid ${t.border}` : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle }}
                      onMouseLeave={e => { e.currentTarget.style.background = '' }}
                    >
                      <td style={{ padding: '11px 20px', fontSize: t.textMd, fontWeight: 500, color: t.text }}>
                        {c.business_name}
                      </td>
                      <td style={{ padding: '11px 20px', fontSize: t.textMd, color: t.textMuted }}>
                        {c.owner_name}
                      </td>
                      <td style={{ padding: '11px 20px', fontSize: t.textMd, color: t.text }}>
                        {c.current_rating ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Star size={13} weight="fill" color="#F59E0B" />
                            {c.current_rating}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '11px 20px' }}>
                        <Badge bg={st.bg} color={st.color} border={st.border}>{st.label}</Badge>
                      </td>
                      <td style={{ padding: '11px 20px' }}>
                        <Link
                          to={`/admin/clients/${c.id}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: t.textSm, color: t.accent,
                            textDecoration: 'none', fontWeight: 500,
                          }}
                        >
                          View <ArrowUpRight size={11} weight="bold" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div style={{
      height: 200, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      color: t.textMuted,
    }}>
      {/* Inline SVG illustration */}
      <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
        <rect x="0" y="24" width="8" height="12" rx="2" fill={t.border}/>
        <rect x="10" y="16" width="8" height="20" rx="2" fill={t.border}/>
        <rect x="20" y="20" width="8" height="16" rx="2" fill={t.border}/>
        <rect x="30" y="10" width="8" height="26" rx="2" fill={t.accentSubtle}/>
        <rect x="40" y="4" width="8" height="32" rx="2" fill={t.accent} opacity="0.4"/>
      </svg>
      <span style={{ fontSize: t.textBase, fontFamily: t.font }}>No data yet</span>
    </div>
  )
}
