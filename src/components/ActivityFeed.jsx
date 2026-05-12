import { t } from '../lib/theme'
import { timeAgo } from '../lib/mock'
import { Skeleton } from './UI'
import {
  Star, PaperPlaneTilt, ChartLineUp, Note, UserPlus, ClockCounterClockwise,
} from '@phosphor-icons/react'

// Phosphor icon + color per activity type
const typeConfig = {
  review_received:  { icon: Star,                    bg: '#FFF7ED',    color: '#C2410C' },
  request_sent:     { icon: PaperPlaneTilt,          bg: '#EEF2FF',    color: '#4F46E5' },
  report_generated: { icon: ChartLineUp,             bg: '#F0FDF4',    color: '#15803D' },
  note:             { icon: Note,                    bg: '#F5F3FF',    color: '#7C3AED' },
  client_added:     { icon: UserPlus,                bg: '#F0FDF4',    color: '#15803D' },
}

const FallbackIcon = ClockCounterClockwise

export function ActivityFeed({ items = [], loading }) {
  if (loading) return <SkeletonFeed />

  if (!items.length) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '36px 24px', gap: 8, textAlign: 'center',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: t.radiusMd,
        background: t.bgSubtle, border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted,
      }}>
        <FallbackIcon size={16} />
      </div>
      <p style={{ fontSize: t.textMd, color: t.textMuted, margin: 0, fontFamily: t.font }}>
        No activity yet
      </p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => {
        const cfg = typeConfig[item.type] || { icon: FallbackIcon, bg: t.bgSubtle, color: t.textMuted }
        const IconComp = cfg.icon
        return (
          <div key={item.id || i} style={{
            display: 'flex', gap: 12,
            padding: '11px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : 'none',
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: t.radiusMd,
              background: cfg.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: cfg.color, flexShrink: 0, marginTop: 1,
            }}>
              <IconComp size={14} weight="bold" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: t.textMd, color: t.text, margin: 0,
                lineHeight: 1.45, fontFamily: t.font,
              }}>
                {item.description}
              </p>
              <span style={{ fontSize: t.textSm, color: t.textMuted, fontFamily: t.font }}>
                {timeAgo(item.created_at)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SkeletonFeed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
      {[70, 55, 80].map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton width={30} height={30} style={{ borderRadius: t.radiusMd, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Skeleton width={`${w}%`} height={12} />
            <Skeleton width="25%" height={10} />
          </div>
        </div>
      ))}
    </div>
  )
}
