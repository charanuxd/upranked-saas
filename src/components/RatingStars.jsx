import { t } from '../lib/theme'

export function RatingStars({ rating, size = 16, showNumber = false }) {
  const full  = Math.floor(rating)
  const empty = 5 - full
  const color = rating >= 4 ? t.success : rating >= 3 ? t.warning : t.danger
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color, fontSize: size, letterSpacing: 1 }}>
        {'★'.repeat(full)}{'☆'.repeat(empty)}
      </span>
      {showNumber && <span style={{ fontSize: size * 0.875, color: t.textMuted, fontWeight: 500 }}>{rating}</span>}
    </span>
  )
}

export function StarPicker({ value, onChange, size = 40 }) {
  const [hover, setHover] = useState(null)
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: size, lineHeight: 1, padding: 2, color: n <= (hover ?? value) ? t.warning : '#D1D5DB', transition: 'color 0.1s, transform 0.1s', transform: n <= (hover ?? value) ? 'scale(1.15)' : 'scale(1)' }}
        >★</button>
      ))}
    </div>
  )
}

// Need useState for StarPicker
import { useState } from 'react'
