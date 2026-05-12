import { NavLink, Outlet } from 'react-router-dom'
import { t } from '../../lib/theme'
import { useAuth } from '../../App'
import {
  SquaresFour, Users, ClockCounterClockwise, ChartLineUp,
  GearSix, SignOut,
} from '@phosphor-icons/react'

const navItems = [
  { to: '/admin',          label: 'Overview', icon: SquaresFour,            end: true },
  { to: '/admin/clients',  label: 'Clients',  icon: Users },
  { to: '/admin/activity', label: 'Activity', icon: ClockCounterClockwise },
  { to: '/admin/reports',  label: 'Reports',  icon: ChartLineUp },
  { to: '/admin/settings', label: 'Settings', icon: GearSix },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: t.bg, fontFamily: t.font,
    }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        minHeight: '100vh',
        background: t.sidebar,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        borderRight: `1px solid ${t.sidebarBorder}`,
      }}>
        {/* Logo */}
        <div style={{
          padding: '18px 16px 16px',
          borderBottom: `1px solid ${t.sidebarBorder}`,
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          {/* Wordmark SVG */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogoMark />
            <span style={{
              fontFamily: t.font,
              fontSize: t.textXl,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
            }}>
              Upranked
            </span>
          </div>
          <span style={{
            fontSize: t.textXs,
            color: t.sidebarText,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            fontWeight: 500,
            paddingLeft: 34,
          }}>
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1, padding: '10px 8px',
          display: 'flex', flexDirection: 'column', gap: 1,
        }}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px',
                borderRadius: t.radiusMd,
                fontSize: t.textBase,
                fontFamily: t.font,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? t.sidebarActive : t.sidebarText,
                background: isActive ? t.sidebarActiveBg : 'transparent',
                textDecoration: 'none',
                transition: `all ${t.transNormal}`,
                letterSpacing: '-0.005em',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active'))
                  e.currentTarget.style.background = t.sidebarHoverBg
                e.currentTarget.style.color = t.sidebarTextHover
              }}
              onMouseLeave={e => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
                e.currentTarget.style.background = isActive ? t.sidebarActiveBg : 'transparent'
                e.currentTarget.style.color = isActive ? t.sidebarActive : t.sidebarText
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    weight={isActive ? 'bold' : 'regular'}
                    style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user + sign out */}
        <div style={{
          padding: '10px 8px 14px',
          borderTop: `1px solid ${t.sidebarBorder}`,
        }}>
          {/* User chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: t.radiusMd,
            marginBottom: 2,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: t.radiusFull,
              background: t.accentGrad,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: t.textBase,
              flexShrink: 0,
              letterSpacing: '-0.01em',
            }}>
              {(profile?.full_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: t.textBase, fontWeight: 500, color: '#F4F4F5',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}>
                {profile?.full_name || 'Admin'}
              </div>
              <div style={{
                fontSize: t.textXs, color: t.sidebarText,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}>
                {profile?.email || ''}
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px',
              borderRadius: t.radiusMd,
              border: 'none', background: 'none',
              color: t.sidebarText,
              fontSize: t.textBase,
              cursor: 'pointer', fontFamily: t.font,
              width: '100%',
              transition: `all ${t.transFast}`,
              letterSpacing: '-0.005em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = t.sidebarHoverBg
              e.currentTarget.style.color = t.sidebarTextHover
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = t.sidebarText
            }}
          >
            <SignOut size={15} style={{ flexShrink: 0, opacity: 0.65 }} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}

// Small SVG logomark — a simple upward-trending shape
function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="6" fill="#4F46E5"/>
      <path
        d="M5 15L9 10L12 13L17 7"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="7" r="1.5" fill="#818CF8"/>
    </svg>
  )
}
