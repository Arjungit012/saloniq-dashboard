import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck,
  Zap,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import logo from '../../assets/stylzap-logo.png'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/credits', icon: Zap, label: 'Credits' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

// isOpen + onClose are passed from AppLayout on mobile
export default function Sidebar({ isOpen, onClose }) {
  const salon = useAuthStore((s) => s.salon)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const handleNavClick = () => {
    // close drawer on mobile after navigation
    if (onClose) onClose()
  }

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            display: 'none',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`sidebar-shell${isOpen ? ' sidebar-open' : ''}`}
        style={styles.sidebar}
      >
        {/* Close btn — mobile only */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          style={styles.closeBtn}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div style={styles.logo}>
          <img src={logo} alt="StylZap" style={{ height: '28px', objectFit: 'contain' }} />
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
              onClick={handleNavClick}
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

      {/* Inline responsive styles */}
      <style>{`
        .sidebar-shell {
          position: fixed;
          top: 0; left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          z-index: 100;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-close-btn { display: none; }

        @media (max-width: 768px) {
          .sidebar-shell {
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.4);
          }
          .sidebar-shell.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-backdrop { display: block !important; }
          .sidebar-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 16px; right: 16px;
            width: 32px; height: 32px;
            border-radius: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-muted);
            cursor: pointer;
          }
        }
      `}</style>
    </>
  )
}

const styles = {
  sidebar: {},
  closeBtn: {},
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border)',
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
  salonInfo: { minWidth: 0 },
  salonName: {
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  salonCity: { fontSize: '11px', color: 'var(--text-muted)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
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
