export default function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  const colors = {
    purple: {
      bg: 'rgba(124,92,252,0.1)',
      border: 'rgba(124,92,252,0.25)',
      icon: '#7c5cfc',
    },
    gold: {
      bg: 'rgba(245,200,66,0.1)',
      border: 'rgba(245,200,66,0.25)',
      icon: '#f5c842',
    },
    green: {
      bg: 'rgba(34,211,160,0.1)',
      border: 'rgba(34,211,160,0.25)',
      icon: '#22d3a0',
    },
    red: {
      bg: 'rgba(248,113,113,0.1)',
      border: 'rgba(248,113,113,0.25)',
      icon: '#f87171',
    },
  }

  const c = colors[color] || colors.purple

  return (
    <div style={{ ...styles.card, animationDelay: `${delay}ms` }} className="fade-up">
      <div style={{ ...styles.iconBox, background: c.bg, border: `1px solid ${c.border}` }}>
        <Icon size={20} color={c.icon} strokeWidth={1.8} />
      </div>
      <div style={styles.body}>
        <div style={styles.label}>{label}</div>
        <div style={styles.value}>{value}</div>
        {sub && <div style={styles.sub}>{sub}</div>}
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    boxShadow: 'var(--shadow-card)',
    opacity: 0,
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
  },
  value: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1,
    marginBottom: '4px',
  },
  sub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
}