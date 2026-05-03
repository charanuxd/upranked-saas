import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { t } from '../../lib/theme'
import { useAuth } from '../../App'

const navItems = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/clients', label: 'Clients', icon: '👥' },
  { to: '/admin/activity', label: 'Activity', icon: '📋' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: t.fontBody }}>
      {/* Sidebar */}
      <div style={{ width: 220, minHeight: '100vh', background: t.card, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${t.border}` }}>
          <div style={{ fontFamily: t.fontHeading, fontSize: 20, fontWeight: 700, color: t.text }}>Upranked</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Admin</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: t.radiusSm,
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              color: isActive ? t.accent : t.textMuted,
              background: isActive ? t.accentSoft : 'none',
              textDecoration: 'none',
            })}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '12px', borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
              {(profile?.full_name || 'A').charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Admin'}</div>
              <div style={{ fontSize: 11, color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email || ''}</div>
            </div>
          </div>
          <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: t.radiusSm, border: 'none', background: 'none', color: t.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: t.fontBody, width: '100%' }}>
            <span>👋</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}
