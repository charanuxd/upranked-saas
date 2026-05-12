import { useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { t } from '../lib/theme'

export function RatingStars({ rating, size = 14, showNumber = false }) {
  const filled = Math.floor(rating || 0)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={size}
          weight={n <= filled ? 'fill' : 'regular'}
          color={n <= filled ? '#F59E0B' : t.border}
        />
      ))}
      {showNumber && (
        <span style={{
          fontSize: size * 0.85, color: t.textMuted,
          fontWeight: 500, marginLeft: 5, fontFamily: t.font,
        }}>
          {rating}
        </span>
      )}
    </span>
  )
}

export function StarPicker({ value, onChange, size = 32 }) {
  const [hover, setHover] = useState(null)
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => {
        const active = n <= (hover ?? value)
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 2, lineHeight: 1, display: 'flex', alignItems: 'center',
              transition: `transform ${t.transNormal}`,
              transform: active ? 'scale(1.15)' : 'scale(1)',
              color: active ? '#F59E0B' : t.border,
            }}
          >
            <Star size={size} weight={active ? 'fill' : 'regular'} />
          </button>
        )
      })}
    </div>
  )
}
