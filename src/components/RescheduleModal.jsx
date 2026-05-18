import { useState } from 'react'
import { X, Calendar, Clock } from 'lucide-react'

export default function RescheduleModal({ booking, onConfirm, onClose, loading }) {
  const [date, setDate] = useState(booking.appointment_date?.slice(0, 10) || '')
  const [time, setTime] = useState(booking.appointment_time?.slice(0, 5) || '')

  const handleSubmit = () => {
    if (!date || !time) return
    onConfirm(date, time)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.header}>
          <div>
            <h3 style={modalStyles.title}>Reschedule Booking</h3>
            <p style={modalStyles.sub}>
              {booking.customer_name || booking.customer_phone} — {booking.selected_style}
            </p>
          </div>
          <button style={modalStyles.closeBtn} onClick={onClose}>
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Fields */}
        <div style={modalStyles.fields}>
          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>
              <Calendar size={13} color="var(--text-muted)" />
              New Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              style={modalStyles.input}
            />
          </div>
          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>
              <Clock size={13} color="var(--text-muted)" />
              New Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={modalStyles.input}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={modalStyles.actions}>
          <button style={modalStyles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            style={{
              ...modalStyles.confirmBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSubmit}
            disabled={loading || !date || !time}
          >
            {loading ? 'Saving...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
  padding: '24px',
}

const modal = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  padding: '28px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
  animation: 'modalIn 0.2s ease forwards',
}

const modalStyles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  sub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    colorScheme: 'dark',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  confirmBtn: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, #7c5cfc, #9d82ff)',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 16px rgba(124,92,252,0.35)',
  },
}