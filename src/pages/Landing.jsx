import { Link } from 'react-router-dom'
import { t } from '../lib/theme'

const features = [
  { icon: '⭐', title: 'Review Generation', body: 'Send automated SMS and email requests after every job. Turn happy customers into 5-star reviews on autopilot.' },
  { icon: '📊', title: 'Real-Time Dashboard', body: 'Monitor ratings, track trends, and see every review as it comes in. All your reputation data in one place.' },
  { icon: '📤', title: 'Smart Request Campaigns', body: 'Personalized outreach timed to when customers are most likely to respond. Higher open rates, more reviews.' },
  { icon: '📈', title: 'Monthly Reports', body: 'Detailed PDF reports showing rating growth, review velocity, and campaign performance — ready to share with clients.' },
  { icon: '🛡️', title: 'Reputation Protection', body: 'Get alerted to new reviews instantly. Respond to negative feedback before it impacts your business.' },
  { icon: '🔗', title: 'Google Integration', body: 'Direct links to your Google Business Profile. Make it frictionless for customers to leave a review.' },
]

const testimonials = [
  { name: 'James Mitchell', biz: 'Metro HVAC & Plumbing', rating: 4.8, quote: 'We went from 42 Google reviews to over 180 in 5 months. The automated requests do all the work — we just do great jobs.' },
  { name: 'Sarah Chen', biz: 'Sunrise Comfort Systems', rating: 4.7, quote: 'Our average rating jumped from 3.9 to 4.7 stars. Upranked completely changed how customers find us online.' },
  { name: 'Robert Davis', biz: 'Davis Plumbing & Heating', rating: 4.9, quote: 'Best ROI of anything we spend on marketing. The monthly reports show exactly what\'s working.' },
]

function Stars({ n = 5 }) {
  return <span style={{ color: '#F59E0B', letterSpacing: 1 }}>{'★'.repeat(n)}</span>
}

export default function Landing() {
  return (
    <div style={{ fontFamily: t.fontBody, background: t.bg, color: t.text }}>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${t.border}`, background: t.card, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: t.fontHeading, fontSize: 22, fontWeight: 700, color: t.text }}>Upranked</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login">
              <button style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: t.radiusSm, padding: '8px 18px', fontSize: 14, color: t.text, cursor: 'pointer' }}>
                Sign In
              </button>
            </Link>
            <a href="#contact">
              <button style={{ background: t.accent, border: 'none', borderRadius: t.radiusSm, padding: '8px 18px', fontSize: 14, color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                Get Started
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: t.accentSoft, border: `1px solid ${t.accent}33`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: t.accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
          Reputation Management for HVAC &amp; Home Services
        </div>
        <h1 style={{ fontFamily: t.fontHeading, fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, maxWidth: 820, margin: '0 auto 24px' }}>
          More 5-Star Reviews.<br />Less Manual Work.
        </h1>
        <p style={{ fontSize: 18, color: t.textMuted, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Upranked automates your Google review campaigns so your HVAC business dominates local search — while you focus on the work.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#contact">
            <button style={{ background: t.accent, border: 'none', borderRadius: t.radius, padding: '14px 32px', fontSize: 16, color: '#fff', cursor: 'pointer', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Book a Free Demo
            </button>
          </a>
          <Link to="/login">
            <button style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '14px 32px', fontSize: 16, color: t.text, cursor: 'pointer', fontWeight: 500 }}>
              Sign In →
            </button>
          </Link>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: t.textMuted }}>No setup fees · Cancel anytime · Results in 30 days</p>

        {/* Social proof numbers */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
          {[['200+', 'Reviews generated monthly'], ['4.8★', 'Average client rating'], ['94%', 'Request open rate'], ['30 days', 'To first results']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: t.fontHeading, fontSize: 32, fontWeight: 700, color: t.text, letterSpacing: '-0.03em' }}>{num}</div>
              <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: t.card, borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: t.fontHeading, fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Everything you need to dominate local search</h2>
            <p style={{ color: t.textMuted, fontSize: 16, maxWidth: 480, margin: '0 auto' }}>Built specifically for HVAC and home service businesses. No generic tools.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '28px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: t.text }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: t.fontHeading, fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>What our clients say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map(tm => (
              <div key={tm.name} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '28px 24px' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  <Stars n={5} />
                </div>
                <p style={{ fontSize: 15, color: t.text, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{tm.quote}"</p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{tm.name}</div>
                  <div style={{ fontSize: 13, color: t.textMuted }}>{tm.biz} · {tm.rating} avg rating</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" style={{ background: t.text, padding: '80px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: t.fontHeading, fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>Ready to grow your reputation?</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>Join HVAC businesses that trust Upranked to manage their Google reputation. Book a 20-minute demo and see your first campaign live.</p>
          <a href="mailto:charanuxd@gmail.com?subject=Upranked Demo Request&body=Hi Charan, I'd like to book a demo for Upranked.">
            <button style={{ background: t.accent, border: 'none', borderRadius: t.radius, padding: '16px 40px', fontSize: 16, color: '#fff', cursor: 'pointer', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Email Us to Book a Demo
            </button>
          </a>
          <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>charanuxd@gmail.com</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${t.border}`, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: t.fontHeading, fontSize: 18, fontWeight: 700 }}>Upranked</div>
          <div style={{ fontSize: 13, color: t.textMuted }}>© 2025 Upranked. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: t.textMuted }}>
            <Link to="/login" style={{ color: t.textMuted }}>Sign In</Link>
            <a href="mailto:charanuxd@gmail.com" style={{ color: t.textMuted }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
