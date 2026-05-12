import { useState } from 'react'
import { t } from '../lib/theme'
import { Badge } from './UI'
import { statusBadge } from '../lib/theme'
import { Star } from '@phosphor-icons/react'

function StarRow({ rating }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={12}
          weight={n <= rating ? 'fill' : 'regular'}
          color={n <= rating ? '#F59E0B' : t.border}
        />
      ))}
      <span style={{
        fontSize: t.textXs, fontWeight: 600, color: t.textMuted,
        marginLeft: 5, fontFamily: t.font,
      }}>
        {rating}.0
      </span>
    </div>
  )
}

export function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  const long = review.review_text?.length > 160
  const shown = expanded || !long ? review.review_text : review.review_text?.slice(0, 160) + '…'
  const isPositive = review.star_rating >= 4
  const src = statusBadge(review.source || 'google')

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: t.radiusXl,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: t.shadow,
      transition: `box-shadow ${t.transNormal}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          {/* Avatar initial */}
          <div style={{
            width: 34, height: 34, borderRadius: t.radiusFull,
            background: isPositive ? t.successSoft : t.dangerSoft,
            border: `1px solid ${isPositive ? t.successBorder : t.dangerBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: t.textMd, fontWeight: 600,
            color: isPositive ? t.success : t.danger,
            fontFamily: t.font,
          }}>
            {(review.reviewer_name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{
              fontWeight: 600, fontSize: t.textMd, color: t.text,
              fontFamily: t.font, lineHeight: 1.3,
            }}>
              {review.reviewer_name || 'Anonymous'}
            </div>
            <StarRow rating={review.star_rating || 5} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Badge bg={src.bg} color={src.color} border={src.border} size="xs">
            {src.label}
          </Badge>
          <span style={{ fontSize: t.textXs, color: t.textMuted, fontFamily: t.font }}>
            {review.review_date || ''}
          </span>
        </div>
      </div>

      {shown && (
        <p style={{
          fontSize: t.textMd, color: t.textSecond, margin: 0,
          lineHeight: 1.55, fontFamily: t.font,
        }}>
          {shown}
        </p>
      )}

      {long && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: t.textSm, color: t.accent, padding: 0,
            textAlign: 'left', fontFamily: t.font, fontWeight: 500,
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {review.reply_text && (
        <div style={{
          background: t.bgSubtle,
          border: `1px solid ${t.border}`,
          borderRadius: t.radiusMd,
          padding: '10px 12px',
          borderLeft: `3px solid ${t.accent}`,
        }}>
          <div style={{ fontSize: t.textXs, fontWeight: 600, color: t.accent, marginBottom: 4, letterSpacing: '0.03em', fontFamily: t.font }}>
            OWNER REPLY
          </div>
          <p style={{ fontSize: t.textBase, color: t.textSecond, margin: 0, lineHeight: 1.5, fontFamily: t.font }}>
            {review.reply_text}
          </p>
        </div>
      )}
    </div>
  )
}
