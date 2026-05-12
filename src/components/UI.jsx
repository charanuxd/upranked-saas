import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { t } from '../lib/theme'

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = (message, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 4500)
  }

  const colorMap = {
    success: t.success,
    danger:  t.danger,
    warning: t.warning,
    info:    t.accent,
  }

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            borderLeft: `3px solid ${colorMap[toast.type] || t.accent}`,
            borderRadius: t.radiusMd,
            padding: '11px 14px',
            boxShadow: t.shadowLg,
            fontSize: t.textMd,
            fontFamily: t.font,
            fontWeight: 500,
            color: t.text,
            maxWidth: 340,
            lineHeight: 1.45,
            pointerEvents: 'auto',
            animation: 'toastIn 0.18s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateY(6px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </ToastCtx.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastCtx)

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children, variant = 'primary', onClick, disabled,
  type = 'button', fullWidth, size = 'md', style: sx, loading,
}) {
  const sizes = {
    xs: { padding: '4px 10px',  fontSize: t.textSm,  height: '26px' },
    sm: { padding: '5px 12px',  fontSize: t.textBase, height: '30px' },
    md: { padding: '7px 14px',  fontSize: t.textBase, height: '34px' },
    lg: { padding: '9px 18px',  fontSize: t.textMd,  height: '40px' },
    xl: { padding: '11px 22px', fontSize: t.textLg,  height: '46px' },
  }
  const sz = sizes[size] || sizes.md

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    border: 'none', borderRadius: t.radiusFull, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: t.font, fontWeight: 500, letterSpacing: '-0.01em',
    transition: `all ${t.transFast}`,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.5 : 1,
    outline: 'none',
    position: 'relative',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...sz,
  }

  const variants = {
    primary: {
      background: t.accent,
      color: '#fff',
      boxShadow: `0 1px 2px rgba(79,70,229,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`,
    },
    secondary: {
      background: t.card,
      color: t.text,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowXs,
    },
    ghost: {
      background: 'transparent',
      color: t.textMuted,
      border: `1px solid transparent`,
    },
    danger: {
      background: t.dangerSoft,
      color: t.danger,
      border: `1px solid ${t.dangerBorder}`,
    },
    success: {
      background: t.successSoft,
      color: t.success,
      border: `1px solid ${t.successBorder}`,
    },
  }

  const [hovered, setHovered] = useState(false)

  const hoverStyles = () => {
    if (disabled || loading) return {}
    if (variant === 'primary') return { background: t.accentHover, transform: 'translateY(-1px)', boxShadow: `0 4px 12px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.1)` }
    if (variant === 'secondary') return { borderColor: t.borderHover, background: t.bgSubtle }
    if (variant === 'ghost') return { background: t.bgSubtle, color: t.textSecond }
    if (variant === 'danger') return { background: '#FEE2E2' }
    return {}
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...(hovered ? hoverStyles() : {}), ...sx }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? <Spinner size={13} color="currentColor" /> : null}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  label, type = 'text', value, onChange, placeholder,
  required, disabled, hint, error, prefix, suffix, style: sx,
}) {
  const [focused, setFocused] = useState(false)

  const inputStyles = {
    width: '100%',
    padding: prefix ? '8px 12px 8px 36px' : suffix ? '8px 36px 8px 12px' : '8px 12px',
    border: `1px solid ${error ? t.danger : focused ? t.borderFocus : t.border}`,
    borderRadius: t.radiusMd,
    fontFamily: t.font,
    fontSize: t.textMd,
    fontWeight: 400,
    color: disabled ? t.textMuted : t.text,
    background: disabled ? t.bgSubtle : t.card,
    outline: 'none',
    transition: `border-color ${t.transFast}, box-shadow ${t.transFast}`,
    boxShadow: focused ? `0 0 0 3px ${error ? '#FEE2E2' : t.accentSubtle}` : t.shadowInset,
    boxSizing: 'border-box',
    ...sx,
  }

  const wrapStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  }

  const iconStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: focused ? t.accent : t.textMuted,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    transition: `color ${t.transFast}`,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{
          fontSize: t.textBase, fontWeight: 500, color: t.textSecond,
          userSelect: 'none',
        }}>
          {label}
          {required && <span style={{ color: t.danger, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={wrapStyles}>
        {prefix && <span style={{ ...iconStyles, left: 10 }}>{prefix}</span>}
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ ...inputStyles, resize: 'vertical', lineHeight: 1.5 }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={inputStyles}
          />
        )}
        {suffix && <span style={{ ...iconStyles, right: 10 }}>{suffix}</span>}
      </div>
      {hint && !error && (
        <span style={{ fontSize: t.textSm, color: t.textMuted, lineHeight: 1.4 }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: t.textSm, color: t.danger, lineHeight: 1.4 }}>{error}</span>
      )}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, children, disabled, style: sx }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{ fontSize: t.textBase, fontWeight: 500, color: t.textSecond }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: `1px solid ${focused ? t.borderFocus : t.border}`,
          borderRadius: t.radiusMd,
          fontFamily: t.font,
          fontSize: t.textMd,
          color: t.text,
          background: t.card,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: focused ? `0 0 0 3px ${t.accentSubtle}` : t.shadowInset,
          transition: `border-color ${t.transFast}`,
          ...sx,
        }}
      >
        {children}
      </select>
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, bg, color, border, size = 'sm' }) {
  const sizes = {
    xs: { fontSize: t.textXs, padding: '2px 7px' },
    sm: { fontSize: t.textBase, padding: '2px 8px' },
    md: { fontSize: t.textSm, padding: '3px 10px' },
  }
  const sz = sizes[size] || sizes.sm
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: t.radiusFull,
      fontFamily: t.font,
      fontWeight: 500,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      background: bg || t.accentSoft,
      color: color || t.accent,
      border: `1px solid ${border || 'transparent'}`,
      ...sz,
    }}>
      {children}
    </span>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480, description }) {
  const backdropRef = useRef()
  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: t.overlay,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'backdropIn 0.15s ease',
      }}
    >
      <div style={{
        background: t.card,
        borderRadius: t.radiusXl,
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: t.shadowXl,
        border: `1px solid ${t.border}`,
        animation: 'modalIn 0.18s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: `1px solid ${t.border}`,
        }}>
          <div>
            <h2 style={{
              fontFamily: t.font, fontSize: t.textXl, fontWeight: 600,
              color: t.text, margin: 0, letterSpacing: '-0.01em',
            }}>
              {title}
            </h2>
            {description && (
              <p style={{ fontSize: t.textBase, color: t.textMuted, margin: '4px 0 0', lineHeight: 1.4 }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'transparent',
              border: `1px solid ${t.border}`, borderRadius: t.radiusSm,
              cursor: 'pointer', color: t.textMuted, flexShrink: 0,
              marginLeft: 12, marginTop: 1,
              transition: `all ${t.transFast}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.bgSubtle; e.currentTarget.style.color = t.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
      <style>{`
        @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px) } to { opacity:1; transform:none } }
      `}</style>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style: sx, onClick, padding }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHovered(true)}
      onMouseLeave={() => onClick && setHovered(false)}
      style={{
        background: t.card,
        border: `1px solid ${hovered && onClick ? t.borderHover : t.border}`,
        borderRadius: t.radiusXl,
        boxShadow: hovered && onClick ? t.shadowMd : t.shadow,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${t.transNormal}`,
        padding: padding !== undefined ? padding : undefined,
        ...sx,
      }}
    >
      {children}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color }) {
  return (
    <>
      <style>{`@keyframes spinR { to { transform: rotate(360deg); } }`}</style>
      <svg
        width={size} height={size} viewBox="0 0 20 20" fill="none"
        style={{ animation: 'spinR 0.65s linear infinite', flexShrink: 0 }}
      >
        <circle cx="10" cy="10" r="8" stroke={color || t.border} strokeWidth="2.5" />
        <path d="M10 2a8 8 0 0 1 8 8" stroke={color || t.accent} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 14, style: sx, round }) {
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:-400% 0} 100%{background-position:400% 0} }`}</style>
      <div style={{
        width, height,
        borderRadius: round ? t.radiusFull : t.radiusSm,
        background: `linear-gradient(90deg, ${t.bgSubtle} 25%, ${t.border} 50%, ${t.bgSubtle} 75%)`,
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.5s ease infinite',
        ...sx,
      }} />
    </>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '56px 24px', textAlign: 'center', gap: 10,
    }}>
      {icon && (
        <div style={{
          width: 48, height: 48, borderRadius: t.radiusXl,
          background: t.bgSubtle, border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.textMuted, marginBottom: 4,
        }}>
          {icon}
        </div>
      )}
      <div style={{
        fontFamily: t.font, fontSize: t.textLg, fontWeight: 600,
        color: t.text, letterSpacing: '-0.01em',
      }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: t.textMd, color: t.textMuted, maxWidth: 320, lineHeight: 1.5 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────────────
export function Table({ columns, rows, onRowClick, emptyTitle, emptyDesc, emptyIcon }) {
  if (rows.length === 0) return (
    <EmptyState
      icon={emptyIcon}
      title={emptyTitle || 'No data yet'}
      description={emptyDesc}
    />
  )
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: t.font }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${t.border}` }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '9px 14px',
                textAlign: 'left',
                fontSize: t.textXs,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: t.textMuted,
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: i < rows.length - 1 ? `1px solid ${t.border}` : 'none',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: `background ${t.transFast}`,
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = t.bgSubtle }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '11px 14px',
                  color: col.muted ? t.textMuted : t.text,
                  verticalAlign: 'middle',
                  fontSize: t.textMd,
                }}>
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

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ label, style: sx }) {
  if (label) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...sx }}>
      <div style={{ flex: 1, height: 1, background: t.border }} />
      <span style={{ fontSize: t.textXs, fontWeight: 500, color: t.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  )
  return <div style={{ height: 1, background: t.border, ...sx }} />
}

// ── PageHeader ────────────────────────────────────────────────────────────────
// Standard 56px topbar used on every admin/dashboard page
export function PageHeader({ title, subtitle, left, right, style: sx }) {
  return (
    <div style={{
      background: t.card,
      borderBottom: `1px solid ${t.border}`,
      padding: '0 28px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      ...sx,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {left}
        <div>
          <h1 style={{
            fontFamily: t.font, fontSize: t.textLg, fontWeight: 600,
            color: t.text, margin: 0, letterSpacing: '-0.01em',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: t.textSm, color: t.textMuted, margin: '1px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {right && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {right}
        </div>
      )}
    </div>
  )
}

// ── SearchInput ───────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…', style: sx }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', ...sx }}>
      <svg
        style={{
          position: 'absolute', left: 10,
          color: focused ? t.accent : t.textMuted,
          transition: `color ${t.transFast}`,
          pointerEvents: 'none', flexShrink: 0,
        }}
        width="14" height="14" viewBox="0 0 24 24" fill="none"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          paddingLeft: 32,
          paddingRight: 12,
          paddingTop: 7,
          paddingBottom: 7,
          border: `1px solid ${focused ? t.borderFocus : t.border}`,
          borderRadius: t.radiusMd,
          fontFamily: t.font,
          fontSize: t.textMd,
          color: t.text,
          background: t.card,
          outline: 'none',
          boxShadow: focused ? `0 0 0 3px ${t.accentSubtle}` : t.shadowInset,
          transition: `border-color ${t.transFast}, box-shadow ${t.transFast}`,
        }}
      />
    </div>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange, style: sx }) {
  return (
    <div style={{
      display: 'flex', gap: 0,
      borderBottom: `1px solid ${t.border}`,
      ...sx,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.key || active === tab.label?.toLowerCase()
        return (
          <button
            key={tab.key || tab.label}
            onClick={() => onChange(tab.key || tab.label?.toLowerCase())}
            style={{
              background: 'none', border: 'none',
              borderBottom: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
              padding: `10px 16px`,
              fontSize: t.textMd, fontFamily: t.font,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? t.accent : t.textMuted,
              cursor: 'pointer',
              transition: `all ${t.transFast}`,
              marginBottom: -1,
              whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab.icon && <span style={{ opacity: isActive ? 1 : 0.6 }}>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: t.textXs, fontWeight: 500,
                background: isActive ? t.accentSoft : t.bgSubtle,
                color: isActive ? t.accent : t.textMuted,
                borderRadius: t.radiusFull,
                padding: '1px 6px',
                minWidth: 18, textAlign: 'center',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
