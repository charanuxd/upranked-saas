import { t } from '../lib/theme'
import { timeAgo } from '../lib/mock'
import { EmptyState } from './UI'

const icons = {
  review_received:  '⭐',
  request_sent:     '📤',
  report_generated: '📊',
  note:             '📝',
  client_added:     '👤',
}

export function ActivityFeed({ items = [], loading }) {
  if (loading) return <div style={{ padding: 20 }}><SkeletonFeed /></div>
  if (!items.length) return <EmptyState icon="📭" title="No activity yet" description="Actions will appear here as your campaigns run." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => (
        <div key={item.id || i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.bg, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
            {icons[item.type] || '•'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, color: t.text, margin: 0, lineHeight: 1.5 }}>{item.description}</p>
            <span style={{ fontSize: 11, color: t.textMuted }}>{timeAgo(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonFeed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE8E3' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 12, width: '70%', background: '#EDE8E3', borderRadius: 4 }} />
            <div style={{ height: 10, width: '30%', background: '#EDE8E3', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
