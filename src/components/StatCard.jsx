import { t } from '../lib/theme'
import { Card } from './UI'

export function StatCard({ label, value, delta, deltaSuffix = '', sub, icon }) {
  const positive = delta >= 0
  return (
    <Card style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted }}>{label}</span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, fontFamily: t.fontHeading, color: t.text, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {delta !== undefined && (
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
            background: positive ? t.successSoft : t.dangerSoft,
            color: positive ? t.success : t.danger,
          }}>
            {positive ? '↑' : '↓'} {Math.abs(delta)}{deltaSuffix}
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 12, color: t.textMuted }}>{sub}</span>}
    </Card>
  )
}
