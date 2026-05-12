import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t, statusBadge } from '../../lib/theme'
import { supabase, isConfigured } from '../../lib/supabase'
import { MOCK_CLIENTS, MOCK_RATINGS, MOCK_REVIEWS, MOCK_REQUESTS, MOCK_ACTIVITY, timeAgo } from '../../lib/mock'
import { StatCard } from '../../components/StatCard'
import { ReviewCard } from '../../components/ReviewCard'
import { ActivityFeed } from '../../components/ActivityFeed'
import { Badge, Button, Spinner, useToast, PageHeader, Tabs } from '../../components/UI'
import {
  ArrowLeft, Star, Users, ChartLineUp, PaperPlaneTilt,
  Envelope, Phone, Globe, CalendarBlank, ArrowSquareOut,
  PlugsConnected,
} from '@phosphor-icons/react'

export default function ClientDetail() {
  const { id } = useParams()
  const [client, setClient]     = useState(null)
  const [ratings, setRatings]   = useState([])
  const [reviews, setReviews]   = useState([])
  const [requests, setRequests] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')
  const [googleBusy, setGoogleBusy] = useState(false)
  const toast = useToast()

  async function connectGoogle() {
    if (!isConfigured) { toast('Demo: Google connect would open OAuth', 'info'); return }
    setGoogleBusy(true)
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth-start', { body: { client_id: id } })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      if (data?.url) window.location.href = data.url
    } catch (e) {
      toast(e.message || 'Failed to start Google OAuth', 'danger')
    } finally {
      setGoogleBusy(false)
    }
  }

  async function syncGoogleReviews() {
    if (!isConfigured) { toast('Demo: would import Google reviews', 'info'); return }
    setGoogleBusy(true)
    try {
      const { data, error } = await supabase.functions.invoke('import-google-reviews', { body: { client_id: id } })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      toast(`Imported ${data?.imported ?? 0} review(s) from Google`, 'success')
    } catch (e) {
      toast(e.message || 'Failed to sync', 'danger')
    } finally {
      setGoogleBusy(false)
    }
  }

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
      const buckets = {}
      for (const r of (rev.data || [])) {
        const key = (r.review_date || '').slice(0, 7)
        if (!key) continue
        if (!buckets[key]) buckets[key] = { sum: 0, n: 0 }
        buckets[key].sum += r.star_rating
        buckets[key].n   += 1
      }
      const trend = Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b)).slice(-6)
        .map(([month, { sum, n }]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          rating: Number((sum / n).toFixed(1)),
        }))
      setRatings(trend)
      setLoading(false)
    }
    load()
    if (!isConfigured) return
    const ch = supabase.channel(`admin-client-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `client_id=eq.${id}` }, async () => {
        const { data } = await supabase.from('reviews').select('*').eq('client_id', id).order('review_date', { ascending: false })
        setReviews(data || [])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_requests', filter: `client_id=eq.${id}` }, async () => {
        const { data } = await supabase.from('review_requests').select('*').eq('client_id', id).order('sent_at', { ascending: false }).limit(20)
        setRequests(data || [])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `client_id=eq.${id}` }, async () => {
        const { data } = await supabase.from('activity_log').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(20)
        setActivity(data || [])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Spinner size={24} />
    </div>
  )
  if (!client) return (
    <div style={{ padding: 32, color: t.textMuted, fontFamily: t.font, fontSize: t.textMd }}>
      Client not found.{' '}
      <Link to="/admin/clients" style={{ color: t.accent }}>Back to clients</Link>
    </div>
  )

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1)
    : (client.current_rating ?? '—')
  const replied = reviews.filter(r => r.reply_text).length
  const responseRate = reviews.length ? Math.round((replied / reviews.length) * 100) : 0
  const st = statusBadge(client.status || 'active')

  const tabList = [
    { key: 'overview',  label: 'Overview' },
    { key: 'reviews',   label: 'Reviews',  count: reviews.length },
    { key: 'requests',  label: 'Requests', count: requests.length },
    { key: 'activity',  label: 'Activity' },
  ]

  const stats = [
    { label: 'Avg Rating',    value: avgRating === '—' ? '—' : `${avgRating}`, icon: Star },
    { label: 'Total Reviews', value: reviews.length, icon: Star },
    { label: 'Response Rate', value: `${responseRate}%`, icon: ChartLineUp },
    { label: 'Requests Sent', value: requests.length, icon: PaperPlaneTilt },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusMd, padding: '10px 14px', boxShadow: t.shadowMd, fontFamily: t.font }}>
        <div style={{ fontSize: t.textBase, fontWeight: 600, color: t.text, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: t.textSm, color: t.textMuted }}>{payload[0]?.value} avg rating</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        left={
          <Link to="/admin/clients" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: t.textBase, color: t.textMuted, textDecoration: 'none',
            fontWeight: 500, fontFamily: t.font,
            transition: `color ${t.transFast}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = t.text }}
          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted }}
          >
            <ArrowLeft size={14} />
            Clients
          </Link>
        }
        title={client.business_name}
        right={
          <>
            <Badge bg={st.bg} color={st.color} border={st.border}>{st.label}</Badge>
            {client.google_refresh_token ? (
              <Button size="sm" variant="secondary" onClick={syncGoogleReviews} loading={googleBusy}>
                <PlugsConnected size={12} weight="bold" />
                Sync Google
              </Button>
            ) : (
              <Button size="sm" onClick={connectGoogle} loading={googleBusy}>
                <PlugsConnected size={12} weight="bold" />
                Connect Google
              </Button>
            )}
          </>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 40px' }}>
        {/* Client info card */}
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: t.radiusXl, padding: '18px 22px',
          marginBottom: 22, boxShadow: t.shadow,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 36px' }}>
            <InfoField icon={Users} label="Owner" value={client.owner_name} />
            {client.owner_email && (
              <InfoField
                icon={Envelope} label="Email"
                value={
                  <a href={`mailto:${client.owner_email}`} style={{ color: t.accent, textDecoration: 'none', fontFamily: t.font, fontSize: t.textMd }}>
                    {client.owner_email}
                  </a>
                }
              />
            )}
            {client.owner_phone && <InfoField icon={Phone} label="Phone" value={client.owner_phone} />}
            {client.review_slug && (
              <InfoField
                icon={Globe} label="Review Link"
                value={
                  <a
                    href={`/review/${client.review_slug}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      color: t.accent, textDecoration: 'none', fontFamily: t.font,
                      fontSize: t.textMd, display: 'inline-flex', alignItems: 'center', gap: 3,
                    }}
                  >
                    /review/{client.review_slug}
                    <ArrowSquareOut size={12} weight="bold" />
                  </a>
                }
              />
            )}
            {client.created_at && (
              <InfoField
                icon={CalendarBlank}
                label="Joined"
                value={new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              />
            )}
            {client.internal_notes && (
              <div style={{ flex: '1 1 100%' }}>
                <div style={{ fontSize: t.textXs, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontFamily: t.font }}>
                  Notes
                </div>
                <div style={{ fontSize: t.textMd, color: t.textSecond, lineHeight: 1.5, fontFamily: t.font }}>
                  {client.internal_notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabList} active={tab} onChange={setTab} style={{ marginBottom: 22 }} />

        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {ratings.length > 0 && (
              <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, padding: '18px 22px', marginBottom: 20, boxShadow: t.shadow }}>
                <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, marginBottom: 18, letterSpacing: '-0.01em' }}>
                  Rating Trend
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={ratings} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="gradRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.accent} stopOpacity={0.12}/>
                        <stop offset="95%" stopColor={t.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="none" stroke={t.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.textMuted, fontFamily: t.font }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: t.textMuted, fontFamily: t.font }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="rating" stroke={t.accent} strokeWidth={2} fill="url(#gradRating)" dot={false} activeDot={{ r: 4, fill: t.accent, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, padding: '18px 22px', boxShadow: t.shadow }}>
              <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, marginBottom: 14, letterSpacing: '-0.01em' }}>
                Recent Activity
              </h3>
              <ActivityFeed items={activity.slice(0, 8)} />
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
            {reviews.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: t.textMuted, fontFamily: t.font, fontSize: t.textMd }}>
                No reviews yet.
              </div>
            ) : (
              reviews.map((r, i) => <ReviewCard key={r.id || i} review={r} />)
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, overflow: 'hidden', marginBottom: 32, boxShadow: t.shadow }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Customer', 'Contact', 'Status', 'Sent'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', fontSize: t.textXs, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', background: t.bgSubtle }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => {
                  const { bg, color, border, label } = statusBadge(r.status || 'sent')
                  return (
                    <tr key={r.id || i} style={{ borderBottom: i < requests.length - 1 ? `1px solid ${t.border}` : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle }}
                      onMouseLeave={e => { e.currentTarget.style.background = '' }}
                    >
                      <td style={{ padding: '11px 18px', fontSize: t.textMd, color: t.text, fontWeight: 500 }}>{r.customer_name}</td>
                      <td style={{ padding: '11px 18px', fontSize: t.textMd, color: t.textMuted }}>{r.customer_email || r.customer_phone || '—'}</td>
                      <td style={{ padding: '11px 18px' }}><Badge bg={bg} color={color} border={border}>{label}</Badge></td>
                      <td style={{ padding: '11px 18px', fontSize: t.textSm, color: t.textMuted }}>{timeAgo(r.sent_at)}</td>
                    </tr>
                  )
                })}
                {requests.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: t.textMuted, fontSize: t.textMd, fontFamily: t.font }}>No requests sent yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'activity' && (
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, padding: '18px 22px', marginBottom: 32, boxShadow: t.shadow }}>
            <ActivityFeed items={activity} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: t.textXs, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5, fontFamily: t.font }}>
        <Icon size={11} />
        {label}
      </div>
      <div style={{ fontSize: t.textMd, color: t.text, fontFamily: t.font, fontWeight: 400 }}>
        {value}
      </div>
    </div>
  )
}
