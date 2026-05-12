import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t, statusBadge } from '../lib/theme'
import { useAuth } from '../App'
import { supabase, isConfigured } from '../lib/supabase'
import { MOCK_CLIENTS, MOCK_RATINGS, MOCK_REVIEWS, MOCK_REQUESTS, MOCK_ACTIVITY, MOCK_REPORTS, timeAgo } from '../lib/mock'
import { StatCard } from '../components/StatCard'
import { ReviewCard } from '../components/ReviewCard'
import { ActivityFeed } from '../components/ActivityFeed'
import { Badge, Button, Modal, useToast, Spinner } from '../components/UI'
import {
  SquaresFour, Star, PaperPlaneTilt, ChartLineUp,
  SignOut, PaperPlaneTilt as Send, DownloadSimple,
  Buildings,
} from '@phosphor-icons/react'

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ onSignOut, onJump, active, clientName, ownerName }) {
  const items = [
    { icon: SquaresFour, label: 'Dashboard', key: 'top' },
    { icon: Star,         label: 'Reviews',   key: 'reviews' },
    { icon: PaperPlaneTilt, label: 'Requests', key: 'requests' },
    { icon: ChartLineUp,  label: 'Reports',   key: 'reports' },
  ]

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: t.sidebar,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh',
      borderRight: `1px solid ${t.sidebarBorder}`,
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 16px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoMark />
          <span style={{ fontFamily: t.font, fontSize: t.textXl, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
            Upranked
          </span>
        </div>
        <span style={{ fontSize: t.textXs, color: t.sidebarText, letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 500, paddingLeft: 34, display: 'block', marginTop: 3 }}>
          Client Portal
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(({ icon: Icon, label, key }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onJump(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: t.radiusMd,
                border: 'none',
                background: isActive ? t.sidebarActiveBg : 'transparent',
                color: isActive ? t.sidebarActive : t.sidebarText,
                fontSize: t.textBase, fontFamily: t.font,
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: `all ${t.transNormal}`,
                letterSpacing: '-0.005em',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = t.sidebarHoverBg; e.currentTarget.style.color = t.sidebarTextHover } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.sidebarText } }}
            >
              <Icon size={16} weight={isActive ? 'bold' : 'regular'} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px 14px', borderTop: `1px solid ${t.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', marginBottom: 2 }}>
          <div style={{ width: 28, height: 28, borderRadius: t.radiusFull, background: t.accentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: t.textBase, flexShrink: 0 }}>
            {(ownerName || 'C').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: t.textBase, fontWeight: 500, color: '#F4F4F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
              {ownerName || 'Client'}
            </div>
            {clientName && (
              <div style={{ fontSize: t.textXs, color: t.sidebarText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                {clientName}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: t.radiusMd, border: 'none', background: 'none', color: t.sidebarText, fontSize: t.textBase, cursor: 'pointer', fontFamily: t.font, width: '100%', transition: `all ${t.transFast}`, letterSpacing: '-0.005em' }}
          onMouseEnter={e => { e.currentTarget.style.background = t.sidebarHoverBg; e.currentTarget.style.color = t.sidebarTextHover }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = t.sidebarText }}
        >
          <SignOut size={15} style={{ flexShrink: 0, opacity: 0.65 }} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="6" fill="#4F46E5"/>
      <path d="M5 15L9 10L12 13L17 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="17" cy="7" r="1.5" fill="#818CF8"/>
    </svg>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const [client, setClient]       = useState(null)
  const [ratings, setRatings]     = useState([])
  const [reviews, setReviews]     = useState([])
  const [requests, setRequests]   = useState([])
  const [activity, setActivity]   = useState([])
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [reqName, setReqName]     = useState('')
  const [reqEmail, setReqEmail]   = useState('')
  const [sending, setSending]     = useState(false)
  const [activeNav, setActiveNav] = useState('top')
  const reviewsRef  = useRef(null)
  const requestsRef = useRef(null)
  const reportsRef  = useRef(null)
  const toast = useToast()

  function jump(key) {
    if (key === 'reviews')  reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else if (key === 'requests') requestsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else if (key === 'reports')  reportsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveNav(key)
  }

  const [cutoffs] = useState(() => ({
    cutoff30: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    cutoff60: new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10),
  }))
  const { cutoff30, cutoff60 } = cutoffs

  useEffect(() => {
    async function load() {
      if (!isConfigured) {
        const clientId = profile?.client_id || 'client-1'
        const c = MOCK_CLIENTS.find(c => c.id === clientId) || MOCK_CLIENTS[0]
        setClient(c)
        setRatings(MOCK_RATINGS[c.id] || [])
        setReviews(MOCK_REVIEWS[c.id] || [])
        setRequests(MOCK_REQUESTS[c.id] || [])
        setActivity(MOCK_ACTIVITY[c.id] || [])
        setReports(MOCK_REPORTS[c.id] || [])
        setLoading(false)
        return
      }
      const { data: clientData } = await supabase.from('clients').select('*').eq('profile_id', profile.id).single()
      if (!clientData) { setClient(null); setLoading(false); return }
      setClient(clientData)
      const [rev, req, act, rep] = await Promise.all([
        supabase.from('reviews').select('*').eq('client_id', clientData.id).order('review_date', { ascending: false }),
        supabase.from('review_requests').select('*').eq('client_id', clientData.id).order('sent_at', { ascending: false }).limit(20),
        supabase.from('activity_log').select('*').eq('client_id', clientData.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('reports').select('*').eq('client_id', clientData.id).order('period_start', { ascending: false }),
      ])
      setReviews(rev.data || [])
      setRequests(req.data || [])
      setActivity(act.data || [])
      setReports(rep.data || [])
      let trend = (rep.data || []).slice().reverse().map(r => ({ month: r.period_label || (r.period_start || '').slice(0, 7), rating: Number(r.avg_rating) || 0 }))
      if (trend.length === 0 && (rev.data || []).length > 0) {
        const buckets = {}
        for (const r of rev.data) {
          const key = (r.review_date || '').slice(0, 7)
          if (!key) continue
          if (!buckets[key]) buckets[key] = { sum: 0, n: 0 }
          buckets[key].sum += r.star_rating
          buckets[key].n   += 1
        }
        trend = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b)).map(([month, { sum, n }]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          rating: Number((sum / n).toFixed(1)),
        }))
      }
      setRatings(trend)
      setLoading(false)
    }
    load()
  }, [profile])

  useEffect(() => {
    if (!isConfigured || !client?.id) return
    const channel = supabase.channel(`client-${client.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `client_id=eq.${client.id}` }, async () => {
        const { data } = await supabase.from('reviews').select('*').eq('client_id', client.id).order('review_date', { ascending: false })
        setReviews(data || [])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_requests', filter: `client_id=eq.${client.id}` }, async () => {
        const { data } = await supabase.from('review_requests').select('*').eq('client_id', client.id).order('sent_at', { ascending: false }).limit(20)
        setRequests(data || [])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `client_id=eq.${client.id}` }, async () => {
        const { data } = await supabase.from('activity_log').select('*').eq('client_id', client.id).order('created_at', { ascending: false }).limit(20)
        setActivity(data || [])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [client?.id])

  async function sendRequest(e) {
    e.preventDefault()
    setSending(true)
    try {
      if (!isConfigured || !client) {
        toast('Demo: review request would be sent', 'success')
        setShowRequest(false); setReqName(''); setReqEmail(''); return
      }
      const { data, error } = await supabase.functions.invoke('send-review-request', {
        body: { client_id: client.id, customer_name: reqName, customer_email: reqEmail || null, channel: 'email' },
      })
      if (error) throw new Error(error.message || 'Failed to send')
      if (data?.error && !data?.ok) toast(`Saved, but delivery failed: ${data.error}`, 'warning')
      else toast('Review request sent!', 'success')
      setShowRequest(false); setReqName(''); setReqEmail('')
      const { data: req } = await supabase.from('review_requests').select('*').eq('client_id', client.id).order('sent_at', { ascending: false }).limit(20)
      setRequests(req || [])
    } catch (err) {
      toast(err.message || 'Failed to send', 'danger')
    } finally {
      setSending(false)
    }
  }

  async function downloadReport(rep) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(20); doc.text('Monthly Reputation Report', 20, 30)
    doc.setFontSize(12)
    doc.text(`Business: ${client?.business_name || ''}`, 20, 50)
    doc.text(`Period: ${rep.period_label || rep.period_start?.slice(0, 7) || ''}`, 20, 62)
    doc.text(`Average Rating: ${rep.avg_rating || '—'}`, 20, 74)
    doc.text(`New Reviews: ${rep.new_reviews || 0}`, 20, 86)
    doc.text(`Requests Sent: ${rep.requests_sent || 0}`, 20, 98)
    doc.text(`Response Rate: ${rep.response_rate || 0}%`, 20, 110)
    doc.save(`report-${rep.period_label || 'monthly'}.pdf`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}>
      <Spinner size={28} />
    </div>
  )

  if (!client) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg, fontFamily: t.font }}>
      <div style={{ textAlign: 'center', padding: 32, maxWidth: 420 }}>
        {/* SVG illustration */}
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ marginBottom: 20 }}>
          <rect width="72" height="72" rx="16" fill={t.accentSoft}/>
          <rect x="18" y="28" width="36" height="24" rx="4" stroke={t.accent} strokeWidth="2" fill="none"/>
          <path d="M24 28V24a12 12 0 0 1 24 0v4" stroke={t.accent} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="36" cy="40" r="3" fill={t.accent}/>
          <rect x="35" y="43" width="2" height="4" rx="1" fill={t.accent}/>
        </svg>
        <h2 style={{ fontFamily: t.font, fontSize: t.text2xl, color: t.text, marginBottom: 10, letterSpacing: '-0.02em', fontWeight: 700 }}>
          Account not set up yet
        </h2>
        <p style={{ color: t.textMuted, fontSize: t.textMd, lineHeight: 1.6, marginBottom: 24, fontFamily: t.font }}>
          Your client account is being configured. Contact your Upranked admin to link your profile.
        </p>
        <button
          onClick={signOut}
          style={{ fontSize: t.textBase, color: t.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: t.font, fontWeight: 500 }}
        >
          Sign out
        </button>
      </div>
    </div>
  )

  const avgRating    = reviews.length ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1) : (client?.current_rating ?? '—')
  const newThisMonth = reviews.filter(r => r.review_date >= cutoff30).length
  const newPriorMonth = reviews.filter(r => r.review_date >= cutoff60 && r.review_date < cutoff30).length
  const replied      = reviews.filter(r => r.reply_text).length
  const responseRate = reviews.length ? Math.round((replied / reviews.length) * 100) : 0
  const monthDelta   = newThisMonth - newPriorMonth
  const fmt = n => n > 0 ? `+${n}` : n < 0 ? `${n}` : null

  const stats = [
    { label: 'Avg Rating',    value: avgRating === '—' ? '—' : `${avgRating}`, icon: Star },
    { label: 'Total Reviews', value: reviews.length, delta: fmt(newThisMonth), positive: newThisMonth >= 0, icon: Star },
    { label: 'Response Rate', value: `${responseRate}%`, icon: ChartLineUp },
    { label: 'New This Month',value: newThisMonth, delta: fmt(monthDelta), positive: monthDelta >= 0, icon: PaperPlaneTilt },
  ]

  const inputSx = {
    width: '100%', padding: '8px 12px', border: `1px solid ${t.border}`,
    borderRadius: t.radiusMd, fontFamily: t.font, fontSize: t.textMd,
    color: t.text, background: t.card, outline: 'none', boxSizing: 'border-box',
    boxShadow: t.shadowInset,
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusMd, padding: '10px 14px', boxShadow: t.shadowMd, fontFamily: t.font }}>
        <div style={{ fontSize: t.textBase, fontWeight: 600, color: t.text, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: t.textSm, color: t.textMuted }}>{payload[0]?.value} avg</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: t.font }}>
      <Sidebar
        onSignOut={signOut}
        onJump={jump}
        active={activeNav}
        clientName={client?.business_name}
        ownerName={client?.owner_name || profile?.full_name}
      />

      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{
          background: t.card, borderBottom: `1px solid ${t.border}`,
          padding: '0 28px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: t.radiusSm, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent }}>
              <Buildings size={14} weight="bold" />
            </div>
            <span style={{ fontSize: t.textLg, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>
              {client?.business_name || 'Dashboard'}
            </span>
          </div>
          <Button onClick={() => setShowRequest(true)} size="sm">
            <Send size={13} weight="bold" />
            Send Review Request
          </Button>
        </div>

        <div style={{ padding: '28px', maxWidth: 1200 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Chart + Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 20, marginBottom: 28 }}>
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, padding: '18px 22px', boxShadow: t.shadow }}>
              <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, marginBottom: 18, letterSpacing: '-0.01em' }}>
                Rating Trend
              </h3>
              {ratings.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={ratings} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={t.accent} stopOpacity={0.12}/>
                        <stop offset="95%" stopColor={t.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="none" stroke={t.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.textMuted, fontFamily: t.font }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: t.textMuted, fontFamily: t.font }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="rating" stroke={t.accent} strokeWidth={2} fill="url(#clientGrad)" dot={false} activeDot={{ r: 4, fill: t.accent, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
                      <rect x="0" y="20" width="7" height="12" rx="2" fill={t.border}/>
                      <rect x="9" y="13" width="7" height="19" rx="2" fill={t.border}/>
                      <rect x="18" y="16" width="7" height="16" rx="2" fill={t.border}/>
                      <rect x="27" y="8" width="7" height="24" rx="2" fill={t.accentSubtle}/>
                      <rect x="35" y="2" width="7" height="30" rx="2" fill={t.accent} opacity="0.35"/>
                    </svg>
                    <span style={{ fontSize: t.textBase, color: t.textMuted, fontFamily: t.font }}>Not enough data yet</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, padding: '18px 22px', boxShadow: t.shadow, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, marginBottom: 14, letterSpacing: '-0.01em' }}>
                Recent Activity
              </h3>
              <ActivityFeed items={activity.slice(0, 6)} />
            </div>
          </div>

          {/* Reviews */}
          <div
            ref={reviewsRef}
            style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, padding: '18px 22px', marginBottom: 20, boxShadow: t.shadow, scrollMarginTop: 70 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, margin: 0, letterSpacing: '-0.01em' }}>
                Recent Reviews
              </h3>
              <span style={{ fontSize: t.textBase, color: t.textMuted, fontFamily: t.font }}>
                {reviews.length} total
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: t.textMuted, fontSize: t.textMd, fontFamily: t.font }}>
                  No reviews yet. Send your first review request to get started.
                </div>
              ) : reviews.slice(0, 5).map((r, i) => <ReviewCard key={r.id || i} review={r} />)}
            </div>
          </div>

          {/* Requests */}
          <div
            ref={requestsRef}
            style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, overflow: 'hidden', marginBottom: 20, boxShadow: t.shadow, scrollMarginTop: 70 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 22px', borderBottom: requests.length > 0 ? `1px solid ${t.border}` : 'none',
            }}>
              <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, margin: 0, letterSpacing: '-0.01em' }}>
                Review Requests
              </h3>
              <Button size="sm" onClick={() => setShowRequest(true)}>
                <Send size={12} weight="bold" />
                Send Request
              </Button>
            </div>
            {requests.length === 0 ? (
              <div style={{ padding: '36px 22px', textAlign: 'center', color: t.textMuted, fontSize: t.textMd, fontFamily: t.font }}>
                No requests sent yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    {['Customer', 'Email', 'Status', 'Sent'].map(h => (
                      <th key={h} style={{ padding: '9px 22px', fontSize: t.textXs, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', background: t.bgSubtle }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 8).map((r, i) => {
                    const { bg, color, border, label } = statusBadge(r.status || 'sent')
                    return (
                      <tr key={r.id || i} style={{ borderBottom: i < Math.min(requests.length, 8) - 1 ? `1px solid ${t.border}` : 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle }}
                        onMouseLeave={e => { e.currentTarget.style.background = '' }}
                      >
                        <td style={{ padding: '11px 22px', fontSize: t.textMd, color: t.text, fontWeight: 500 }}>{r.customer_name}</td>
                        <td style={{ padding: '11px 22px', fontSize: t.textMd, color: t.textMuted }}>{r.customer_email || r.customer_phone || '—'}</td>
                        <td style={{ padding: '11px 22px' }}><Badge bg={bg} color={color} border={border}>{label}</Badge></td>
                        <td style={{ padding: '11px 22px', fontSize: t.textSm, color: t.textMuted }}>{timeAgo(r.sent_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Reports */}
          {reports.length > 0 && (
            <div
              ref={reportsRef}
              style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusXl, overflow: 'hidden', boxShadow: t.shadow, scrollMarginTop: 70 }}
            >
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${t.border}` }}>
                <h3 style={{ fontFamily: t.font, fontSize: t.textMd, fontWeight: 600, color: t.text, margin: 0, letterSpacing: '-0.01em' }}>
                  Monthly Reports
                </h3>
              </div>
              <div style={{ padding: '6px 0' }}>
                {reports.map((rep, i) => (
                  <div
                    key={rep.id || i}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 22px',
                      borderBottom: i < reports.length - 1 ? `1px solid ${t.border}` : 'none',
                      transition: `background ${t.transFast}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                  >
                    <div>
                      <div style={{ fontSize: t.textMd, fontWeight: 500, color: t.text, fontFamily: t.font }}>
                        {rep.period_label || rep.period_start?.slice(0, 7)}
                      </div>
                      <div style={{ fontSize: t.textBase, color: t.textMuted, marginTop: 2, fontFamily: t.font }}>
                        {rep.new_reviews} new reviews · {rep.avg_rating} avg · {rep.response_rate}% response
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => downloadReport(rep)}>
                      <DownloadSimple size={12} weight="bold" />
                      Download PDF
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Request Modal */}
      <Modal
        open={showRequest}
        onClose={() => setShowRequest(false)}
        title="Send Review Request"
        description="We'll email your customer a direct link to leave a review."
        width={420}
      >
        <form onSubmit={sendRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: t.textBase, fontWeight: 500, color: t.textSecond, marginBottom: 5, fontFamily: t.font }}>
              Customer Name <span style={{ color: t.danger }}>*</span>
            </label>
            <input
              value={reqName} onChange={e => setReqName(e.target.value)} required
              placeholder="Full name"
              onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
              onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              style={inputSx}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: t.textBase, fontWeight: 500, color: t.textSecond, marginBottom: 5, fontFamily: t.font }}>
              Email Address <span style={{ color: t.danger }}>*</span>
            </label>
            <input
              type="email" value={reqEmail} onChange={e => setReqEmail(e.target.value)} required
              placeholder="customer@example.com"
              onFocus={e => { e.currentTarget.style.borderColor = t.borderFocus; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.accentSubtle}` }}
              onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadowInset }}
              style={inputSx}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={sending}>
              <Send size={13} weight="bold" />
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
