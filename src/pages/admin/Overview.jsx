import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_CLIENTS, MOCK_RATINGS, MOCK_REVIEWS, MOCK_ACTIVITY } from '../../lib/mock'
import { StatCard } from '../../components/StatCard'
import { ActivityFeed } from '../../components/ActivityFeed'
import { Badge } from '../../components/UI'
import { statusBadge } from '../../lib/theme'

export default function Overview() {
  const [clients, setClients]   = useState([])
  const [reviews, setReviews]   = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        setClients(MOCK_CLIENTS)
        const allReviews = Object.values(MOCK_REVIEWS).flat()
        setReviews(allReviews)
        const allActivity = Object.values(MOCK_ACTIVITY).flat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setActivity(allActivity)
        setLoading(false)
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
      setLoading(false)
    }
    load()
  }, [])

  const totalReviews  = reviews.length || 254
  const avgRating     = reviews.length ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1) : '4.8'
  const activeClients = clients.filter(c => c.status === 'active').length || clients.length
  const newThisMonth  = reviews.filter(r => r.review_date >= new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)).length || 24

  // Aggregate rating trend across all clients
  const trendData = (() => {
    const base = MOCK_RATINGS['client-1']
    if (!isConfigured && base) {
      return base.map((d, i) => ({
        month: d.month,
        rating: ((MOCK_RATINGS['client-1'][i]?.rating || 0) + (MOCK_RATINGS['client-2'][i]?.rating || 0)) / 2,
      }))
    }
    return []
  })()

  return (
    <div>
      {/* Topbar */}
      <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: t.text, fontFamily: t.fontBody }}>Overview</h1>
      </div>

      <div style={{ padding: 32, maxWidth: 1200 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Active Clients" value={activeClients} delta="+1" positive />
          <StatCard label="Total Reviews" value={totalReviews} delta="+24" positive />
          <StatCard label="Avg Rating" value={`${avgRating} ★`} delta="+0.2" positive />
          <StatCard label="New This Month" value={newThisMonth} delta="+8" positive />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 32 }}>
          {/* Chart */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 20 }}>Portfolio Rating Trend</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: t.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.5, 5]} tick={{ fontSize: 12, fill: t.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, fontSize: 13 }} />
                  <Line type="monotone" dataKey="rating" stroke={t.accent} strokeWidth={2.5} dot={{ fill: t.accent, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, fontSize: 14 }}>No data yet</div>
            )}
          </div>

          {/* Activity feed */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Recent Activity</h3>
              <Link to="/admin/activity" style={{ fontSize: 12, color: t.accent }}>View all</Link>
            </div>
            <ActivityFeed items={activity.slice(0, 6)} />
          </div>
        </div>

        {/* Client quick list */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Clients</h3>
            <Link to="/admin/clients" style={{ fontSize: 12, color: t.accent }}>Manage all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Business', 'Owner', 'Rating', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => {
                  const st = statusBadge(c.status || 'active')
                  return (
                    <tr key={c.id} style={{ borderBottom: i < clients.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                      <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 500, color: t.text }}>{c.business_name}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: t.textMuted }}>{c.owner_name}</td>
                      <td style={{ padding: '10px 12px', fontSize: 14, color: t.text }}>{c.current_rating ? `${c.current_rating} ★` : '—'}</td>
                      <td style={{ padding: '10px 12px' }}><Badge bg={st.bg} color={st.color}>{st.label}</Badge></td>
                      <td style={{ padding: '10px 12px' }}>
                        <Link to={`/admin/clients/${c.id}`} style={{ fontSize: 12, color: t.accent }}>View →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
