import { Clock, User, Scissors } from 'lucide-react'

const statusStyles = {
  pending: { bg: 'rgba(245,200,66,0.12)', color: '#f5c842', label: 'Pending' },
  confirmed: { bg: 'rgba(34,211,160,0.12)', color: '#22d3a0', label: 'Confirmed' },
  cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Cancelled' },
  completed: { bg: 'rgba(124,92,252,0.12)', color: '#9d82ff', label: 'Completed' },
}

export default function BookingRow({ booking, index }) {
  const s = statusStyles[booking.status] || statusStyles.pending
  const time = booking.appointment_time?.slice(0, 5) || '—'
  const name = booking.customer_name || booking.customer_phone || 'Unknown'

  return (
    <div
      className="fade-up"
      style={{ ...styles.row, animationDelay: `${index * 60}ms` }}
    >
      {/* Time */}
      <div style={styles.timeCol}>
        <Clock size={13} color="var(--text-muted)" strokeWidth={1.8} />
        <span style={styles.time}>{time}</span>
      </div>

      {/* Customer */}
      <div style={styles.customerCol}>
        <div style={styles.avatar}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.name}>{name}</div>
          <div style={styles.phone}>{booking.customer_phone}</div>
        </div>
      </div>

      {/* Style */}
      <div style={styles.styleCol}>
        <Scissors size={13} color="var(--text-muted)" strokeWidth={1.8} />
        <span style={styles.styleName}>{booking.selected_style || 'Not specified'}</span>
      </div>

      {/* Status */}
      <div style={{ ...styles.badge, background: s.bg, color: s.color }}>
        {s.label}
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    opacity: 0,
    transition: 'background 0.15s ease',
  },
  timeCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '60px',
    flexShrink: 0,
  },
  time: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  customerCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--accent), var(--gold))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '13px',
    color: '#fff',
    flexShrink: 0,
  },
  name: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phone: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  styleCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '120px',
    flexShrink: 0,
  },
  styleName: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '99px',
    flexShrink: 0,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
}