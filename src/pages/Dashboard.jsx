import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  IndianRupee,
  Zap,
  Users,
  CalendarCheck,
  ImageIcon,
  AlertCircle,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import BookingRow from '../components/BookingRow'

function SectionHeader({ title, sub }) {
  return (
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {sub && <span style={styles.sectionSub}>{sub}</span>}
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div style={styles.empty}>
      <Icon size={32} color="var(--text-muted)" strokeWidth={1.4} />
      <p style={styles.emptyText}>{message}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={styles.skeletonCard}>
      <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ width: '80px', height: '12px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

function CreditBar({ remaining, total }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0
  const color = pct > 40 ? '#22d3a0' : pct > 15 ? '#f5c842' : '#f87171'

  return (
    <div style={styles.creditBar}>
      <div style={styles.creditBarRow}>
        <span style={styles.creditBarLabel}>AI Credits</span>
        <span style={{ ...styles.creditBarPct, color }}>
          {remaining} / {total} remaining
        </span>
      </div>
      <div style={styles.creditTrack}>
        <div
          style={{
            ...styles.creditFill,
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      {pct <= 15 && (
        <div style={styles.creditWarn}>
          <AlertCircle size={13} color="#f87171" />
          <span>Credits low — top up to keep generating hairstyles</span>
        </div>
      )}
    </div>
  )
}

// ─── CHIME (defined outside component, no hooks needed) ───────────────────
function playChime() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch (e) {
    console.warn('🔇 Chime failed:', e)
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function Dashboard() {
  const salon = useAuthStore((s) => s.salon)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', salon?.id],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/${salon.id}`)
      return data
    },
    enabled: !!salon?.id,
    refetchInterval: 60000,
  })

  // ─── WEBSOCKET for new booking sound ────────────────────────────────────
  useEffect(() => {
    if (!salon?.id) return

    const wsUrl = import.meta.env.VITE_API_URL
      .replace('https://', 'wss://')
      .replace('/api', '')

    let ws
    let reconnectTimer

    function connect() {
      ws = new WebSocket(`${wsUrl}?salonId=${salon.id}`)

      ws.onopen = () => console.log('🔌 WS connected')

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.event === 'new_booking') {
            playChime()
            refetch() // refresh today's bookings count
          }
        } catch (err) {
          console.warn('WS parse error', err)
        }
      }

      ws.onclose = () => {
        console.log('🔌 WS closed — reconnecting in 5s')
        reconnectTimer = setTimeout(connect, 5000) // auto-reconnect
      }

      ws.onerror = (err) => {
        console.warn('🔌 WS error', err)
        ws.close()
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [salon?.id])

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.statsGrid}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={styles.page}>
        <EmptyState icon={AlertCircle} message="Failed to load dashboard. Check your connection." />
      </div>
    )
  }

  const { stats, todays_bookings, recent_generations } = data
  const monthName = new Date().toLocaleString('en-IN', { month: 'long' })

  return (
    <div style={styles.page}>
      {/* Greeting */}
      <div className="fade-up" style={styles.greeting}>
        <h1 style={styles.greetingTitle}>
          Good {getTimeOfDay()}, {salon?.owner_name?.split(' ')[0]} 👋
        </h1>
        <p style={styles.greetingSub}>
          Here's what's happening at <strong>{salon?.name}</strong> today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Revenue this month"
          value={`₹${stats.revenue_this_month.toLocaleString('en-IN')}`}
          sub={monthName}
          icon={IndianRupee}
          color="green"
          delay={0}
        />
        <StatCard
          label="AI Generations"
          value={stats.generations_this_month}
          sub={`${monthName} · ₹${stats.generations_this_month * 7} cost`}
          icon={ImageIcon}
          color="purple"
          delay={80}
        />
        <StatCard
          label="Total Customers"
          value={stats.total_customers}
          sub="All time"
          icon={Users}
          color="gold"
          delay={160}
        />
        <StatCard
          label="Bookings"
          value={stats.bookings_this_month}
          sub={monthName}
          icon={CalendarCheck}
          color="red"
          delay={240}
        />
      </div>

      {/* Credit Bar */}
      <div className="fade-up" style={{ animationDelay: '300ms', opacity: 0 }}>
        <CreditBar
          remaining={stats.credits_remaining}
          total={stats.credits_total}
        />
      </div>

      {/* Two column layout */}
      <div style={styles.columns}>
        {/* Today's Bookings */}
        <div style={styles.panel}>
          <SectionHeader
            title="Today's Bookings"
            sub={`${todays_bookings.length} appointment${todays_bookings.length !== 1 ? 's' : ''}`}
          />
          <div style={styles.list}>
            {todays_bookings.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                message="No bookings scheduled for today"
              />
            ) : (
              todays_bookings.map((b, i) => (
                <BookingRow key={b.id} booking={b} index={i} />
              ))
            )}
          </div>
        </div>

        {/* Recent Generations */}
        <div style={styles.panel}>
          <SectionHeader
            title="Recent Generations"
            sub="Last 5 AI hairstyles"
          />
          <div style={styles.list}>
            {recent_generations.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                message="No hairstyle generations yet"
              />
            ) : (
              recent_generations.map((g, i) => (
                <GenerationRow key={g.id} gen={g} index={i} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function GenerationRow({ gen, index }) {
  return (
    <div
      className="fade-up"
      style={{ ...genStyles.row, animationDelay: `${index * 60}ms` }}
    >
      <div style={genStyles.thumb}>
        {gen.output_image_url ? (
          <img
            src={gen.output_image_url}
            alt={gen.hairstyle_name}
            style={genStyles.img}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <ImageIcon size={16} color="var(--text-muted)" />
        )}
      </div>
      <div style={genStyles.info}>
        <div style={genStyles.styleName}>{gen.hairstyle_name || 'Hairstyle'}</div>
        <div style={genStyles.meta}>
          {gen.customer_name || gen.customer_phone} · {gen.face_shape}
        </div>
      </div>
      <div style={genStyles.time}>
        {timeAgo(gen.created_at)}
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' },
  greeting: { opacity: 0 },
  greetingTitle: { fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' },
  greetingSub: { fontSize: '14px', color: 'var(--text-muted)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  skeletonCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' },
  creditBar: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' },
  creditBarRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  creditBarLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  creditBarPct: { fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700 },
  creditTrack: { height: '6px', borderRadius: '99px', background: 'var(--bg-hover)', overflow: 'hidden' },
  creditFill: { height: '100%', borderRadius: '99px', transition: 'width 0.6s ease' },
  creditWarn: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#f87171' },
  columns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  panel: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionHeader: { display: 'flex', alignItems: 'baseline', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' },
  sectionSub: { fontSize: '12px', color: 'var(--text-muted)' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '32px 16px', color: 'var(--text-muted)' },
  emptyText: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' },
}

const genStyles = {
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0 },
  thumb: { width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { flex: 1, minWidth: 0 },
  styleName: { fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'capitalize' },
  time: { fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 },
}
