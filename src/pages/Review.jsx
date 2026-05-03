import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { t } from '../lib/theme'
import { Button, useToast } from '../components/UI'
import { StarPicker } from '../components/RatingStars'
import { supabase, isConfigured } from '../lib/supabase'
import { MOCK_CLIENTS } from '../lib/mock'

export default function Review() {
  const { slug } = useParams()
  const [client, setClient]     = useState(null)
  const [step, setStep]         = useState('rating') // rating | low | high | done
  const [rating, setRating]     = useState(0)
  const [feedback, setFeedback] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (!isConfigured) {
      const c = MOCK_CLIENTS.find(c => c.review_slug === slug)
      setClient(c || null)
      return
    }
    supabase.from('clients').select('id, business_name, google_profile_url').eq('review_slug', slug).single()
      .then(({ data }) => setClient(data))
  }, [slug])

  function handleRating(r) {
    setRating(r)
    if (r >= 4) setStep('high')
    else setStep('low')
  }

  async function handleLowSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isConfigured && client) {
        await supabase.from('reviews').insert({
          client_id: client.id,
          reviewer_name: name || 'Anonymous',
          star_rating: rating,
          review_text: feedback,
          source: 'direct',
          review_date: new Date().toISOString().slice(0, 10),
        })
      }
      setStep('done')
    } catch {
      toast('Something went wrong. Please try again.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  if (!client) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: t.textMuted, fontFamily: t.fontBody }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: t.fontBody }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: t.fontHeading, fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 4 }}>{client.business_name}</div>
          <p style={{ fontSize: 14, color: t.textMuted }}>We'd love your feedback</p>
        </div>

        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '36px 32px', boxShadow: t.shadowMd }}>

          {step === 'rating' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🙏</div>
              <h2 style={{ fontFamily: t.fontHeading, fontSize: 22, color: t.text, marginBottom: 8 }}>How was your experience?</h2>
              <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 32 }}>Tap the stars to rate your visit</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StarPicker value={rating} onChange={handleRating} size={44} />
              </div>
            </div>
          )}

          {step === 'high' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 48 }}>🌟</div>
              <h2 style={{ fontFamily: t.fontHeading, fontSize: 22, color: t.text }}>Glad you had a great experience!</h2>
              <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>
                Would you mind sharing that on Google? It only takes 30 seconds and helps other customers find us.
              </p>
              <a href={client.google_profile_url || '#'} target="_blank" rel="noreferrer" onClick={() => setStep('done')}>
                <Button fullWidth size="lg" style={{ background: '#4285F4' }}>
                  Leave a Google Review ↗
                </Button>
              </a>
              <button onClick={() => setStep('done')} style={{ background: 'none', border: 'none', fontSize: 13, color: t.textMuted, cursor: 'pointer' }}>
                Maybe later
              </button>
            </div>
          )}

          {step === 'low' && (
            <form onSubmit={handleLowSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
                <h2 style={{ fontFamily: t.fontHeading, fontSize: 22, color: t.text, marginBottom: 8 }}>We're sorry to hear that</h2>
                <p style={{ fontSize: 14, color: t.textMuted }}>Please tell us what went wrong so we can make it right.</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }}>Your name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="First name"
                  style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '10px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }}>What could we have done better?</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Tell us what happened…"
                  rows={4}
                  required
                  style={{ width: '100%', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '10px 12px', fontSize: 14, fontFamily: t.fontBody, color: t.text, background: t.bg, outline: 'none', resize: 'vertical' }}
                />
              </div>
              <Button type="submit" fullWidth disabled={loading} size="lg">
                {loading ? 'Sending…' : 'Send Feedback'}
              </Button>
            </form>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <h2 style={{ fontFamily: t.fontHeading, fontSize: 22, color: t.text }}>Thank you!</h2>
              <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>
                Your feedback means everything to us. We appreciate you taking the time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
