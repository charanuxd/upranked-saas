import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_CLIENTS, MOCK_RATINGS, MOCK_REVIEWS, MOCK_REQUESTS, MOCK_ACTIVITY, timeAgo } from '../../lib/mock'
import { StatCard } from '../../components/StatCard'
import { ReviewCard } from '../../components/ReviewCard'
import { ActivityFeed } from '../../components/ActivityFeed'
import { Badge, Button, Spinner, useToast } from '../../components/UI'
import { statusBadge } from '../../lib/theme'

export default function ClientDetail() {
  const { id } = useParams()
  const [client, setClient]     = useState(null)
  const [ratings, setRatings]   = useState([])
  const [reviews, setReviews]   = useState([])
  const [requests, setRequests] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')
  const toast = useToast()

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        const c = MOCK_CLIENTS.find(c => c.id === id) || MOCK_CLIENTS[0]
        setClient(c)
        setRatings(MOCK_RATINGS[c.id] || [])
        setReviews(MOCK_REVIEWS[c.id] || [])
        setRequests(MOCK_REQUESTS[c.id] || [])
        setActivity(MOCK_ACTIVITY[c.id] || [])
        setLoading(false)
        return
      }
      const { data: c } = await supabase.from('clients').select('*').eq('id', id).single()
      if (!c) { setLoading(false); return }
      setClient(c)
      const [rev, req, act] = await Promise.all([
        supabase.from('reviews').select('*').eq('client_id', id).order('review_date', { ascending: false }),
        supabase.from('review_requests').select('*').eq('client_id', id).order('sent_at', { ascending: false }).limit(20),
        supabase.from('activity_log').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(20),
      ])
      setReviews(rev.data || [])
      setRequests(req.data || [])
      setActivity(act.data || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Spinner /></div>
  if (!client) return <div style={{ padding: 32, color: t.textMuted }}>Client not found. <Link to="/admin/clients" style={{ color: t.accent }}>Back to clients</Link></div>

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1) : client.current_rating
  const replied   = reviews.filter(r => r.reply_text).length
  const responseRate = reviews.length ? Math.round((replied / reviews.length) * 100) : 94
  const st = statusBadge(client.status || 'active')

  const tabs = ['overview', 'reviews', 'requests', 'activity']

  return (
    <div>
      {/* Topbar */}
      <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/admin/clients" style={{ fontSize: 13, color: t.textMuted }}>← Clients</Link>
        <span style={{ color: t.border }}>/</span>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: t.text, fontFamily: t.fontBody }}>{client.business_name}</h1>
        <Badge bg={st.bg} color={st.color}>{st.label}</Badge>
      </div>

      <div style={{ padding: '24px 32px 0', maxWidth: 1200 }}>
        {/* Client info */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Owner</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{client.owner_name}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Email</div>
            <a href={`mailto:${client.owner_email}`} style={{ fontSize: 14, color: t.accent }}>{client.owner_email}</a>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Phone</div>
            <div style={{ fontSize: 14, color: t.text }}>{client.owner_phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Review Link</div>
            {client.review_slug ? (
              <a href={`/review/${client.review_slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: t.accent }}>/review/{client.review_slug} ↗</a>
            ) : <span style={{ fontSize: 14, color: t.textMuted }}>—</span>}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Joined</div>
            <div style={{ fontSize: 14, color: t.text }}>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}</div>
          </div>
          {client.internal_notes && (
            <div style={{ flex: '1 1 100%' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Notes</div>
              <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>{client.internal_notes}</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.border}`, marginBottom: 24 }}>
          {tabs.map(tab_ => (
            <button key={tab_} onClick={() => setTab(tab_)} style={{ background: 'none', border: 'none', borderBottom: tab === tab_ ? `2px solid ${t.accent}` : '2px solid transparent', padding: '10px 20px', fontSize: 14, color: tab === tab_ ? t.accent : t.textMuted, fontWeight: tab === tab_ ? 600 : 400, cursor: 'pointer', fontFamily: t.fontBody, textTransform: 'capitalize', marginBottom: -1 }}>
              {tab_}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard label="Average Rating" value={`${avgRating} ★`} delta="+0.3" positive />
              <StatCard label="Total Reviews" value={reviews.length} delta="+8" positive />
              <StatCard label="Response Rate" value={`${responseRate}%`} delta="+2%" positive />
              <StatCard label="Requests Sent" value={requests.length} delta="+5" positive />
            </div>
            {ratings.length > 0 && (
              <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px', marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 20 }}>Rating Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={ratings}>
                    <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: t.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3, 5]} tick={{ fontSize: 12, fill: t.textMuted }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, fontSize: 13 }} />
                    <Line type="monotone" dataKey="rating" stroke={t.accent} strokeWidth={2.5} dot={{ fill: t.accent, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16 }}>Activity</h3>
              <ActivityFeed items={activity.slice(0, 8)} />
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
            {reviews.length === 0
              ? <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>No reviews yet.</div>
              : reviews.map((r, i) => <ReviewCard key={r.id || i} review={r} />)
            }
          </div>
        )}

        {tab === 'requests' && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, overflow: 'hidden', marginBottom: 32 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}`, background: t.bg }}>
                  {['Customer', 'Contact', 'Channel', 'Status', 'Sent'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => {
                  const src = statusBadge(r.channel || 'sms')
                  const st  = statusBadge(r.status || 'sent')
                  return (
                    <tr key={r.id || i} style={{ borderBottom: i < requests.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                      <td style={{ padding: '10px 16px', fontSize: 14, color: t.text }}>{r.customer_name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: t.textMuted }}>{r.customer_phone || r.customer_email || '—'}</td>
                      <td style={{ padding: '10px 16px' }}><Badge bg={src.bg} color={src.color}>{src.label}</Badge></td>
                      <td style={{ padding: '10px 16px' }}><Badge bg={st.bg} color={st.color}>{st.label}</Badge></td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: t.textMuted }}>{timeAgo(r.sent_at)}</td>
                    </tr>
                  )
                })}
                {requests.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: t.textMuted, fontSize: 14 }}>No requests sent yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'activity' && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px', marginBottom: 32 }}>
            <ActivityFeed items={activity} />
          </div>
        )}
      </div>
    </div>
  )
}
