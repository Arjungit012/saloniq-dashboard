import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarCheck, Clock, User, Search,
  CheckCircle, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Filter,
  Check, Scissors,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import RescheduleModal from '../components/RescheduleModal'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

// ─── Status config ────────────────────────────────────────
const STATUS = {
  pending:   { bg: 'rgba(245,200,66,0.12)',  color: '#f5c842', label: 'Pending' },
  confirmed: { bg: 'rgba(34,211,160,0.12)',  color: '#22d3a0', label: 'Confirmed' },
  cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Cancelled' },
  completed: { bg: 'rgba(124,92,252,0.12)',  color: '#9d82ff', label: 'Completed' },
}

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

// ─── Helpers ──────────────────────────────────────────────
function formatDate(str) {
  try { return format(parseISO(str), 'dd MMM yyyy') } catch { return str }
}
function formatTime(str) {
  return str?.slice(0, 5) || '—'
}

// ─── Sub-components ───────────────────────────────────────
function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...tabStyles.tab,
        ...(active ? tabStyles.tabActive : {}),
      }}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  )
}

function BookingCard({ booking, onConfirm, onCancel, onReschedule, onComplete, mutating }) {
  const s = STATUS[booking.status] || STATUS.pending
  const name = booking.customer_name || booking.customer_phone
  const isPending   = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const isClosed    = booking.status === 'cancelled' || booking.status === 'completed'

  return (
    <div style={cardStyles.card} className="fade-up">
      {/* Top row */}
      <div style={cardStyles.top}>
        <div style={cardStyles.avatar}>
          {name?.charAt(0)?.toUpperCase()}
        </div>
        <div style={cardStyles.info}>
          <div style={cardStyles.name}>{name}</div>
          <div style={cardStyles.phone}>{booking.customer_phone}</div>
        </div>
        <div style={{ ...cardStyles.badge, background: s.bg, color: s.color }}>
          {s.label}
        </div>
      </div>

      {/* Details row */}
      <div style={cardStyles.details}>
        <div style={cardStyles.detailItem}>
          <CalendarCheck size={13} color="var(--text-muted)" strokeWidth={1.8} />
          <span>{formatDate(booking.appointment_date)}</span>
        </div>
        <div style={cardStyles.detailItem}>
          <Clock size={13} color="var(--text-muted)" strokeWidth={1.8} />
          <span>{formatTime(booking.appointment_time)}</span>
        </div>
        <div style={cardStyles.detailItem}>
          <Scissors size={13} color="var(--text-muted)" strokeWidth={1.8} />
          <span>{booking.selected_style || 'Not specified'}</span>
        </div>
        {booking.face_shape && (
          <div style={cardStyles.detailItem}>
            <User size={13} color="var(--text-muted)" strokeWidth={1.8} />
            <span style={{ textTransform: 'capitalize' }}>{booking.face_shape} face</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isClosed && (
        <div style={cardStyles.actions}>
          {isPending && (
            <ActionBtn
              icon={CheckCircle}
              label="Confirm"
              color="#22d3a0"
              bg="rgba(34,211,160,0.12)"
              onClick={() => onConfirm(booking.id)}
              disabled={mutating}
            />
          )}
          {isConfirmed && (
            <ActionBtn
              icon={Check}
              label="Complete"
              color="#9d82ff"
              bg="rgba(124,92,252,0.12)"
              onClick={() => onComplete(booking.id)}
              disabled={mutating}
            />
          )}
          <ActionBtn
            icon={RefreshCw}
            label="Reschedule"
            color="#f5c842"
            bg="rgba(245,200,66,0.12)"
            onClick={() => onReschedule(booking)}
            disabled={mutating}
          />
          <ActionBtn
            icon={XCircle}
            label="Cancel"
            color="#f87171"
            bg="rgba(248,113,113,0.12)"
            onClick={() => onCancel(booking.id)}
            disabled={mutating}
          />
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, label, color, bg, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 12px',
        borderRadius: 'var(--radius-sm)',
        background: bg,
        border: `1px solid ${color}30`,
        color,
        fontSize: '12px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontFamily: "'DM Sans', sans-serif",
        transition: 'opacity 0.15s ease',
      }}
    >
      <Icon size={13} strokeWidth={2} />
      {label}
    </button>
  )
}

function SkeletonCard() {
  return (
    <div style={{ ...cardStyles.card, gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '25%', height: 12, borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 4 }} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────
export default function Bookings() {
  const salon = useAuthStore((s) => s.salon)
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)

  const limit = 12

  const { data, isLoading, isError, error } = useQuery({
  queryKey: ['bookings', salon?.id, statusFilter, dateFilter, page],
  queryFn: async () => {
    const params = { page, limit }
    if (statusFilter !== 'all') params.status = statusFilter
    if (dateFilter) params.date = dateFilter
    console.log('Calling:', `/booking/${salon.id}`, params)
    const { data } = await api.get(`/booking/${salon.id}`, { params })
    console.log('Got:', data)
    return data
    },
  enabled: !!salon?.id,
  keepPreviousData: true,
})

    console.log('Error detail:', error?.response?.status, error?.response?.data, error?.message)
    //console.log('Render state:', { isLoading, isError, data, salonId: salon?.id })

  const invalidate = () =>
    queryClient.invalidateQueries(['bookings', salon?.id])

  const confirmMut = useMutation({
    mutationFn: (id) => api.put(`/booking/${id}/confirm`),
    onSuccess: () => { toast.success('Booking confirmed'); invalidate() },
    onError: () => toast.error('Failed to confirm'),
  })

  const cancelMut = useMutation({
    mutationFn: (id) => api.put(`/booking/${id}/cancel`),
    onSuccess: () => { toast.success('Booking cancelled'); invalidate() },
    onError: () => toast.error('Failed to cancel'),
  })

  const completeMut = useMutation({
    mutationFn: (id) => api.put(`/booking/${id}/complete`),
    onSuccess: () => { toast.success('Marked as completed'); invalidate() },
    onError: () => toast.error('Failed to complete'),
  })

  const rescheduleMut = useMutation({
    mutationFn: ({ id, date, time }) =>
      api.put(`/booking/${id}/reschedule`, {
        appointment_date: date,
        appointment_time: time,
      }),
    onSuccess: () => {
      toast.success('Booking rescheduled')
      setRescheduleTarget(null)
      invalidate()
    },
    onError: () => toast.error('Failed to reschedule'),
  })

  const mutating =
    confirmMut.isLoading ||
    cancelMut.isLoading ||
    completeMut.isLoading ||
    rescheduleMut.isLoading

  // Client-side search filter
  const bookings = (data?.bookings || []).filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.customer_phone?.includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.selected_style?.toLowerCase().includes(q)
    )
  })

  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div className="fade-up" style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Bookings</h1>
          <p style={styles.pageSub}>
            {total} total booking{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="fade-up" style={{ ...styles.filtersBar, animationDelay: '60ms', opacity: 0 }}>
        {/* Status tabs */}
        <div style={styles.tabs}>
          {FILTERS.map((f) => (
            <FilterTab
              key={f}
              label={f}
              active={statusFilter === f}
              onClick={() => { setStatusFilter(f); setPage(1) }}
            />
          ))}
        </div>

        {/* Right side: date + search */}
        <div style={styles.rightFilters}>
          <div style={styles.dateWrap}>
            <Filter size={13} color="var(--text-muted)" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
              style={styles.dateInput}
            />
            {dateFilter && (
              <button
                style={styles.clearDate}
                onClick={() => setDateFilter('')}
              >
                ×
              </button>
            )}
          </div>
          <div style={styles.searchWrap}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search name, phone, style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Booking grid */}
      {isLoading ? (
        <div style={styles.grid}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : bookings.length === 0 ? (
        <div style={styles.empty}>
          <CalendarCheck size={40} color="var(--text-muted)" strokeWidth={1.4} />
          <p style={styles.emptyText}>No bookings found</p>
          <p style={styles.emptyHint}>
            Try changing the filter or date selection
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {bookings.map((b, i) => (
            <BookingCard
              key={b.id}
              booking={b}
              mutating={mutating}
              onConfirm={(id) => confirmMut.mutate(id)}
              onCancel={(id) => cancelMut.mutate(id)}
              onComplete={(id) => completeMut.mutate(id)}
              onReschedule={(booking) => setRescheduleTarget(booking)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            style={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <RescheduleModal
          booking={rescheduleTarget}
          loading={rescheduleMut.isLoading}
          onClose={() => setRescheduleTarget(null)}
          onConfirm={(date, time) =>
            rescheduleMut.mutate({ id: rescheduleTarget.id, date, time })
          }
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '40px',
  },
  pageHeader: {
    opacity: 0,
  },
  pageTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  pageSub: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '4px',
  },
  rightFilters: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  dateWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
  },
  dateInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    colorScheme: 'dark',
    cursor: 'pointer',
  },
  clearDate: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '16px',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 2px',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 14px',
    width: '240px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    flex: 1,
    minWidth: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px 24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  },
  emptyText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  emptyHint: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    paddingTop: '8px',
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.15s',
  },
  pageInfo: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
}

const tabStyles = {
  tab: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    background: 'none',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s ease',
  },
  tabActive: {
    background: 'var(--accent-glow)',
    color: 'var(--accent-light)',
  },
}

const cardStyles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    opacity: 0,
    boxShadow: 'var(--shadow-card)',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--accent), var(--gold))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    color: '#fff',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phone: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
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
  details: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    paddingTop: '4px',
    borderTop: '1px solid var(--border)',
  },
}