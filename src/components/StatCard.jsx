import { t } from '../lib/theme'

export function StatCard({ label, value, delta, positive, deltaSuffix = '', sub, icon: Icon }) {
  const hasDelta = delta !== undefined && delta !== null && delta !== ''
  const isPos = positive !== undefined ? positive : (hasDelta && Number(String(delta).replace(/[^\d.-]/g, '')) >= 0)
  const num = hasDelta ? String(delta).replace(/^[+-]/, '') : null

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${t.border}`,
      borderRadius: t.radiusXl,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: t.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: t.textXs,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: t.textMuted,
          fontFamily: t.font,
        }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 30, height: 30,
            borderRadius: t.radiusMd,
            background: t.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.accent, flexShrink: 0,
          }}>
            <Icon size={15} weight="bold" />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: t.font,
          color: t.text,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {value}
        </span>
        {hasDelta && (
          <span style={{
            fontSize: t.textXs,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: t.radiusFull,
            background: isPos ? t.successSoft : t.dangerSoft,
            color: isPos ? t.success : t.danger,
            border: `1px solid ${isPos ? t.successBorder : t.dangerBorder}`,
            marginBottom: 2,
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontFamily: t.font,
          }}>
            {isPos
              ? <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 6V2M2 4l2-2 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 2v4M6 4L4 6 2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
            {num}{deltaSuffix}
          </span>
        )}
      </div>

      {sub && (
        <span style={{ fontSize: t.textSm, color: t.textMuted, fontFamily: t.font }}>
          {sub}
        </span>
      )}
    </div>
  )
}
