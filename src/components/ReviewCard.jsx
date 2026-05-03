import { useState } from 'react'
import { t } from '../lib/theme'
import { RatingStars } from './RatingStars'
import { Badge } from './UI'
import { statusBadge } from '../lib/theme'

export function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const long = review.review_text?.length > 120
  const shown = expanded || !long ? review.review_text : review.review_text?.slice(0, 120) + '…'
  const borderColor = review.star_rating >= 4 ? t.success : t.danger
  const src = statusBadge(review.source || 'google')

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderLeft: `3px solid ${borderColor}`, borderRadius: t.radiusSm, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{review.reviewer_name}</span>
          <RatingStars rating={review.star_rating} size={13} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge bg={src.bg} color={src.color}>{src.label}</Badge>
          <span style={{ fontSize: 12, color: t.textMuted }}>{review.review_date}</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: t.textMuted, margin: 0, lineHeight: 1.6 }}>{shown}</p>
      {long && (
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: t.accent, padding: 0, textAlign: 'left', fontFamily: t.fontBody }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
