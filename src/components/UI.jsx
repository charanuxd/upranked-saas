import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { t } from '../lib/theme'

// ── Toast ────────────────────────────────────────────────────────────
const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const add = (message, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 4500)
  }
  const colors = { success: t.success, danger: t.danger, warning: t.warning, info: t.accent }
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: t.card, border: `1px solid ${t.border}`, borderLeft: `4px solid ${colors[toast.type] || t.accent}`,
            borderRadius: t.radiusSm, padding: '12px 16px', boxShadow: t.shadowMd,
            fontSize: 14, color: t.text, maxWidth: 320, animation: 'slideIn 0.2s ease',
          }}>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// ── Button ────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', onClick, disabled, type = 'button', fullWidth, size = 'md', style: sx }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: 'none', borderRadius: 99, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: t.fontBody, fontWeight: 600, transition: 'all 0.15s ease',
    width: fullWidth ? '100%' : 'auto', opacity: disabled ? 0.55 : 1,
    padding: size === 'sm' ? '6px 14px' : size === 'lg' ? '14px 28px' : '10px 20px',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
  }
  const variants = {
    primary:   { background: t.accent, color: '#fff' },
    secondary: { background: t.card, color: t.text, border: `1px solid ${t.border}` },
    ghost:     { background: 'transparent', color: t.textMuted, border: `1px solid ${t.border}` },
    danger:    { background: t.dangerSoft, color: t.danger, border: `1px solid ${t.danger}22` },
    success:   { background: t.successSoft, color: t.success },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...sx }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────
export function Input({ label, type = 'text', value, onChange, placeholder, required, disabled, hint, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{label}{required && <span style={{ color: t.danger }}> *</span>}</label>}
      {type === 'textarea'
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} rows={3}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ padding: '10px 14px', border: `1px solid ${error ? t.danger : focused ? t.accent : t.border}`, borderRadius: t.radiusSm, fontFamily: t.fontBody, fontSize: 14, color: t.text, background: t.card, resize: 'vertical', outline: 'none', transition: 'border 0.15s' }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ padding: '10px 14px', border: `1px solid ${error ? t.danger : focused ? t.accent : t.border}`, borderRadius: t.radiusSm, fontFamily: t.fontBody, fontSize: 14, color: t.text, background: t.card, outline: 'none', transition: 'border 0.15s' }} />
      }
      {hint && !error && <span style={{ fontSize: 12, color: t.textMuted }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: t.danger }}>{error}</span>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────
export function Badge({ children, bg, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: bg || t.accentSoft, color: color || t.accent, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])
  if (!open) return null
  return (
    <div onClick={e => { if (e.target === ref.current) onClose() }} ref={ref}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: t.card, borderRadius: t.radius, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: t.shadowMd }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontFamily: t.fontHeading, fontSize: 18, color: t.text, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: t.textMuted, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────
export function Card({ children, style: sx, onClick }) {
  return (
    <div onClick={onClick} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: t.radius, boxShadow: t.shadow, cursor: onClick ? 'pointer' : 'default', ...sx }}>
      {children}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 24, color }) {
  return (
    <div style={{ display: 'inline-block', width: size, height: size }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      <div style={{ width: size, height: size, border: `2px solid ${t.border}`, borderTopColor: color || t.accent, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 16, style: sx }) {
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      <div style={{ width, height, borderRadius: 6, background: 'linear-gradient(90deg,#f0ede8 25%,#e8e4df 50%,#f0ede8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease infinite', ...sx }} />
    </>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 12 }}>
      <div style={{ fontSize: 40, opacity: 0.4 }}>{icon || '📭'}</div>
      <div style={{ fontFamily: t.fontHeading, fontSize: 16, color: t.text, fontWeight: 600 }}>{title}</div>
      {description && <div style={{ fontSize: 14, color: t.textMuted, maxWidth: 300 }}>{description}</div>}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────
export function Table({ columns, rows, onRowClick, emptyTitle, emptyDesc }) {
  if (rows.length === 0) return <EmptyState icon="📋" title={emptyTitle || 'No data yet'} description={emptyDesc} />
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${t.border}` }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted, whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)}
              style={{ borderBottom: `1px solid ${t.border}`, cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = t.bg }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 14px', color: col.muted ? t.textMuted : t.text, verticalAlign: 'middle' }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: t.border, margin: '8px 0' }} />
}
