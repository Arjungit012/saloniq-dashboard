import { useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const pageTitles = {
  '/dashboard': 'Overview',
  '/bookings': 'Bookings',
  '/credits': 'Credits',
  '/settings': 'Settings',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const salon = useAuthStore((s) => s.salon)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header style={styles.topbar}>
      <div>
        <h2 style={styles.title}>{pageTitles[pathname] || ''}</h2>
        <p style={styles.date}>{today}</p>
      </div>
      <div style={styles.right}>
        <div style={styles.creditsBadge}>
          <span style={styles.creditsLabel}>Credits left</span>
          <span style={styles.creditsVal}>
            {salon?.ai_credits_remaining ?? '—'}
          </span>
        </div>
      </div>
    </header>
  )
}

const styles = {
  topbar: {
    position: 'fixed',
    top: 0,
    left: 'var(--sidebar-width)',
    right: 0,
    height: 'var(--topbar-height)',
    background: 'rgba(13, 13, 26, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    zIndex: 90,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  date: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  creditsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '99px',
    padding: '6px 16px',
  },
  creditsLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  creditsVal: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--gold)',
    fontFamily: "'Syne', sans-serif",
  },
}