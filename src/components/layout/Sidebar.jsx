import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  Zap,
  Settings,
  LogOut,
  Scissors,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/credits', icon: Zap, label: 'Credits' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const salon = useAuthStore((s) => s.salon)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Scissors size={18} color="#7c5cfc" />
        </div>
        <div>
          <div style={styles.logoName}>StylZap</div>
          <div style={styles.logoSub}>Dashboard</div>
        </div>
      </div>

      {/* Salon info pill */}
      {salon && (
        <div style={styles.salonPill}>
          <div style={styles.salonAvatar}>
            {salon.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div style={styles.salonInfo}>
            <div style={styles.salonName}>{salon.name}</div>
            <div style={styles.salonCity}>{salon.city}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button style={styles.logout} onClick={handleLogout}>
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </aside>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 'var(--sidebar-width)',
    height: '100vh',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border)',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    color: 'var(--text-primary)',
  },
  logoSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  salonPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    marginBottom: '24px',
  },
  salonAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--accent), var(--gold))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    color: '#fff',
    flexShrink: 0,
  },
  salonInfo: {
    minWidth: 0,
  },
  salonName: {
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  salonCity: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'var(--accent-glow)',
    color: 'var(--accent-light)',
    borderLeft: '2px solid var(--accent)',
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    transition: 'all 0.15s ease',
    marginTop: 'auto',
  },
}