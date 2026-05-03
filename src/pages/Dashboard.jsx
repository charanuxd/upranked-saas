import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t } from '../lib/theme'
import { useAuth } from '../App'
import { supabase, isConfigured } from '../lib/supabase'
import { MOCK_CLIENTS, MOCK_RATINGS, MOCK_REVIEWS, MOCK_REQUESTS, MOCK_ACTIVITY, MOCK_REPORTS, timeAgo } from '../lib/mock'
import { StatCard } from '../components/StatCard'
import { ReviewCard } from '../components/ReviewCard'
import { ActivityFeed } from '../components/ActivityFeed'
import { Badge, Button, Modal, useToast, Spinner } from '../components/UI'
import { statusBadge } from '../lib/theme'

function Sidebar({ onSignOut }) {
  const nav = useNavigate()
  return (
    <div style={{ width: 220, minHeight: '100vh', background: t.card, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontFamily: t.fontHeading, fontSize: 20, fontWeight: 700, color: t.text }}>Upranked</div>
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Client Portal</div>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[
          ['📊', 'Dashboard', () => {}],
          ['⭐', 'Reviews', () => {}],
          ['📤', 'Requests', () => {}],
          ['📈', 'Reports', () => {}],
        ].map(([icon, label, fn]) => (
          <button key={label} onClick={fn} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: t.radiusSm, border: 'none', background: label === 'Dashboard' ? t.accentSoft : 'none', color: label === 'Dashboard' ? t.accent : t.textMuted, fontSize: 14, fontWeight: label === 'Dashboard' ? 600 : 400, cursor: 'pointer', fontFamily: t.fontBody, textAlign: 'left', width: '100%' }}>
            <span>{icon}</span>{label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px', borderTop: `1px solid ${t.border}` }}>
        <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: t.radiusSm, border: 'none', background: 'none', color: t.textMuted, fontSize: 14, cursor: 'pointer', fontFamily: t.fontBody, width: '100%' }}>
          <span>👋</span> Sign Out
        </button>
      </div>
    </div>
  )
}

function RequestRow({ req }) {
  const src = statusBadge(req.channel || 'sms')
  const st  = statusBadge(req.status || 'sent')
  return (
    <tr>
      <td style={{ padding: '10px 16px', fontSize: 14, color: t.text }}>{req.customer_name}</td>
      <td style={{ padding: '10px 16px', fontSize: 13, color: t.textMuted }}>{req.customer_phone || req.customer_email || '—'}</td>
      <td style={{ padding: '10px 16px' }}><Badge bg={src.bg} color={src.color}>{src.label}</Badge></td>
      <td style={{ padding: '10px 16px' }}><Badge bg={st.bg} color={st.color}>{st.label}</Badge></td>
      <td style={{ padding: '10px 16px', fontSize: 12, color: t.textMuted }}>{timeAgo(req.sent_at)}</td>
    </tr>
  )
}

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
  const [reqPhone, setReqPhone]   = useState('')
  const [reqEmail, setReqEmail]   = useState('')
  const [reqChannel, setReqChannel] = useState('sms')
  const [sending, setSending]     = useState(false)
  const toast = useToast()

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
      if (!clientData) { setLoading(false); return }
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
      setLoading(false)
    }
    load()
  }, [profile])

  async function sendRequest(e) {
    e.preventDefault()
    setSending(true)
    try {
      if (isConfigured && client) {
        await supabase.from('review_requests').insert({
          client_id: client.id,
          customer_name: reqName,
          customer_phone: reqPhone || null,
          customer_email: reqEmail || null,
          channel: reqChannel,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
      }
      toast('Review request sent!', 'success')
      setShowRequest(false)
      setReqName(''); setReqPhone(''); setReqEmail('')
    } catch (err) {
      toast(err.message || 'Failed to send', 'danger')
    } finally {
      setSending(false)
    }
  }

  async function downloadReport(rep) {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Monthly Reputation Report', 20, 30)
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
      <Spinner />
    </div>
  )

  const avgRating   = reviews.length ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1) : client?.current_rating || '—'
  const newThisMonth = reviews.filter(r => r.review_date >= new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)).length
  const replied      = reviews.filter(r => r.reply_text).length
  const responseRate = reviews.length ? Math.round((replied / reviews.length) * 100) : 94

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: t.fontBody }}>
      <Sidebar onSignOut={signOut} />

      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{client?.business_name || 'Dashboard'}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button onClick={() => setShowRequest(true)} size="sm">+ Send Review Request</Button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 13 }}>
              {(client?.owner_name || profile?.full_name || 'U').charAt(0)}
            </div>
          </div>
        </div>

        <div style={{ padding: '32px', maxWidth: 1200 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Average Rating" value={`${avgRating} ★`} delta="+0.3" positive />
            <StatCard label="Total Reviews" value={reviews.length || 127} delta="+12" positive />
            <StatCard label="Response Rate" value={`${responseRate}%`} delta="+2%" positive />
            <StatCard label="New This Month" value={newThisMonth || 12} delta="+4" positive />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 32 }}>
            {/* Rating trend chart */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 20 }}>Rating Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={ratings}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: t.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3, 5]} tick={{ fontSize: 12, fill: t.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radiusSm, fontSize: 13, fontFamily: t.fontBody }} />
                  <Line type="monotone" dataKey="rating" stroke={t.accent} strokeWidth={2.5} dot={{ fill: t.accent, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Activity feed */}
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16 }}>Recent Activity</h3>
              <ActivityFeed items={activity.slice(0, 6)} />
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Recent Reviews</h3>
              <span style={{ fontSize: 12, color: t.textMuted }}>{reviews.length} total</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.slice(0, 5).map((r, i) => <ReviewCard key={r.id || i} review={r} />)}
            </div>
          </div>

          {/* Requests table */}
          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Review Requests</h3>
              <Button size="sm" onClick={() => setShowRequest(true)}>+ Send Request</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    {['Customer', 'Contact', 'Channel', 'Status', 'Sent'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 8).map((r, i) => <RequestRow key={r.id || i} req={r} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly reports */}
          {reports.length > 0 && (
            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16 }}>Monthly Reports</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.map((rep, i) => (
                  <div key={rep.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < reports.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{rep.period_label || rep.period_start?.slice(0, 7)}</div>
                      <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{rep.new_reviews} new reviews · {rep.avg_rating} avg · {rep.response_rate}% response rate</div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => downloadReport(rep)}>Download PDF</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Request Modal */}
      <Modal open={showRequest} onClose={() => setShowRequest(false)} title="Send Review Request">
        <form onSubmit={sendRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }}>Customer Name *</label>
            <input value={reqName} onChange={e => setReqName(e.target.value)} required placeholder="Full name" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }}>Channel</label>
            <select value={reqChannel} onChange={e => setReqChannel(e.target.value)} style={inputStyle}>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="both">SMS + Email</option>
            </select>
          </div>
          {(reqChannel === 'sms' || reqChannel === 'both') && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }}>Phone Number</label>
              <input value={reqPhone} onChange={e => setReqPhone(e.target.value)} placeholder="(512) 555-0000" type="tel" style={inputStyle} />
            </div>
          )}
          {(reqChannel === 'email' || reqChannel === 'both') && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }}>Email Address</label>
              <input value={reqEmail} onChange={e => setReqEmail(e.target.value)} placeholder="customer@email.com" type="email" style={inputStyle} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button type="submit" fullWidth disabled={sending}>{sending ? 'Sending…' : 'Send Request'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

const inputStyle = {
  width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm,
  padding: '9px 12px', fontSize: 14, fontFamily: t.fontBody,
  color: t.text, background: t.bg, outline: 'none', boxSizing: 'border-box',
}
