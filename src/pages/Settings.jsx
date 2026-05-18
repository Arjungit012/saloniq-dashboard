import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  User, Phone, MapPin, Building2,
  Shield, CheckCircle, Save, AlertCircle,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function formatDate(str) {
  try { return format(parseISO(str), 'dd MMM yyyy') } catch { return '—' }
}

const TIER_COLORS = {
  starter: '#22d3a0',
  growth:  '#7c5cfc',
  pro:     '#f5c842',
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={infoStyles.row}>
      <div style={infoStyles.iconWrap}>
        <Icon size={15} color="var(--text-muted)" strokeWidth={1.8} />
      </div>
      <div style={infoStyles.content}>
        <div style={infoStyles.label}>{label}</div>
        <div style={infoStyles.value}>{value || '—'}</div>
      </div>
    </div>
  )
}

function InputField({ label, icon: Icon, value, onChange, placeholder, disabled, type = 'text' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={fieldStyles.group}>
      <label style={fieldStyles.label}>{label}</label>
      <div style={{
        ...fieldStyles.wrap,
        ...(focused ? fieldStyles.wrapFocused : {}),
        ...(disabled ? fieldStyles.wrapDisabled : {}),
      }}>
        <Icon size={15} color={focused ? '#7c5cfc' : '#55558a'} strokeWidth={1.8} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...fieldStyles.input,
            ...(disabled ? fieldStyles.inputDisabled : {}),
          }}
        />
        {disabled && (
          <Shield size={13} color="var(--text-muted)" />
        )}
      </div>
      {disabled && (
        <p style={fieldStyles.hint}>This field cannot be changed. Contact support.</p>
      )}
    </div>
  )
}

export default function Settings() {
  const salon = useAuthStore((s) => s.salon)
  const loginStore = useAuthStore((s) => s.login)
  const token = useAuthStore((s) => s.token)

  const [name, setName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [city, setCity] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings', salon?.id],
    queryFn: async () => {
      const { data } = await api.get(`/settings/${salon.id}`)
      return data
    },
    enabled: !!salon?.id,
  })

  // Populate form when data loads
  useEffect(() => {
    if (data?.salon) {
      setName(data.salon.name || '')
      setOwnerName(data.salon.owner_name || '')
      setCity(data.salon.city || '')
      setIsDirty(false)
    }
  }, [data])

  const handleChange = (setter) => (e) => {
    setter(e.target.value)
    setIsDirty(true)
  }

  const updateMut = useMutation({
    mutationFn: () =>
      api.put(`/settings/${salon.id}`, {
        name: name.trim(),
        owner_name: ownerName.trim(),
        city: city.trim(),
      }),
    onSuccess: ({ data: res }) => {
      // Update the auth store so sidebar/topbar reflect new name
      loginStore(res.salon, token)
      toast.success('Settings saved!')
      setIsDirty(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    if (!name.trim() || !ownerName.trim() || !city.trim()) {
      toast.error('All fields are required')
      return
    }
    updateMut.mutate()
  }

  if (isLoading) {
    return (
      <div style={styles.page}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div style={styles.errorWrap}>
        <AlertCircle size={32} color="#f87171" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Failed to load settings</p>
      </div>
    )
  }

  const s = data.salon
  const tierColor = TIER_COLORS[s.subscription_tier] || '#7c5cfc'

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div className="fade-up" style={{ opacity: 0 }}>
        <h1 style={styles.pageTitle}>Settings</h1>
        <p style={styles.pageSub}>Manage your salon profile and account details</p>
      </div>

      <div style={styles.columns}>
        {/* Left — Edit form */}
        <div style={styles.leftCol}>
          {/* Edit profile */}
          <div className="fade-up" style={{ ...styles.panel, opacity: 0, animationDelay: '60ms' }}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Salon Profile</h2>
              {isDirty && (
                <span style={styles.dirtyBadge}>Unsaved changes</span>
              )}
            </div>

            <div style={styles.form}>
              <InputField
                label="Salon Name"
                icon={Building2}
                value={name}
                onChange={handleChange(setName)}
                placeholder="Your salon name"
              />
              <InputField
                label="Owner Name"
                icon={User}
                value={ownerName}
                onChange={handleChange(setOwnerName)}
                placeholder="Your full name"
              />
              <InputField
                label="City"
                icon={MapPin}
                value={city}
                onChange={handleChange(setCity)}
                placeholder="Your city"
              />
              <InputField
                label="Phone Number"
                icon={Phone}
                value={s.phone}
                onChange={() => {}}
                placeholder=""
                disabled={true}
                type="tel"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!isDirty || updateMut.isLoading}
              style={{
                ...styles.saveBtn,
                opacity: (!isDirty || updateMut.isLoading) ? 0.5 : 1,
                cursor: (!isDirty || updateMut.isLoading) ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={15} />
              {updateMut.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right — Account info */}
        <div style={styles.rightCol}>
          {/* Subscription card */}
          <div className="fade-up" style={{ ...styles.panel, opacity: 0, animationDelay: '120ms' }}>
            <h2 style={styles.panelTitle}>Subscription</h2>
            <div style={{
              ...styles.tierBadge,
              background: `${tierColor}15`,
              border: `1px solid ${tierColor}40`,
              color: tierColor,
            }}>
              <CheckCircle size={16} />
              {s.subscription_tier?.charAt(0).toUpperCase() + s.subscription_tier?.slice(1)} Plan
              {' · '}{s.subscription_status}
            </div>
            <div style={styles.infoList}>
              <InfoRow
                icon={Shield}
                label="Setup fee"
                value={s.setup_fee_paid ? '✅ Paid' : '❌ Not paid'}
              />
              <InfoRow
                icon={CheckCircle}
                label="Setup status"
                value={s.setup_completed ? '✅ Complete' : '⏳ Pending'}
              />
              <InfoRow
                icon={Building2}
                label="Member since"
                value={formatDate(s.created_at)}
              />
            </div>
          </div>

          {/* Credits summary card */}
          <div className="fade-up" style={{ ...styles.panel, opacity: 0, animationDelay: '180ms' }}>
            <h2 style={styles.panelTitle}>Credits Summary</h2>
            <div style={styles.creditsRow}>
              <div style={styles.creditStat}>
                <div style={styles.creditStatVal}>{s.ai_credits_remaining}</div>
                <div style={styles.creditStatLabel}>Remaining</div>
              </div>
              <div style={styles.creditDivider} />
              <div style={styles.creditStat}>
                <div style={styles.creditStatVal}>{s.ai_credits_total}</div>
                <div style={styles.creditStatLabel}>Total</div>
              </div>
              <div style={styles.creditDivider} />
              <div style={styles.creditStat}>
                <div style={styles.creditStatVal}>
                  {s.ai_credits_total - s.ai_credits_remaining}
                </div>
                <div style={styles.creditStatLabel}>Used</div>
              </div>
            </div>
            <div style={styles.creditTrack}>
              <div style={{
                ...styles.creditFill,
                width: `${s.ai_credits_total > 0
                  ? Math.round((s.ai_credits_remaining / s.ai_credits_total) * 100)
                  : 0}%`,
              }} />
            </div>
          </div>

          {/* Support card */}
          <div className="fade-up" style={{ ...styles.panel, opacity: 0, animationDelay: '240ms' }}>
            <h2 style={styles.panelTitle}>Support</h2>
            <p style={styles.supportText}>
              Need help with your account, WhatsApp setup, or billing?
            </p>
            
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              style={styles.supportBtn}
             <a>
              Contact SalonIQ Support on WhatsApp
            </a>
          </div>
        </div>
      </div>
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
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  panel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  dirtyBadge: {
    fontSize: '11px',
    color: '#f5c842',
    background: 'rgba(245,200,66,0.1)',
    border: '1px solid rgba(245,200,66,0.3)',
    borderRadius: '99px',
    padding: '3px 10px',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #7c5cfc, #9d82ff)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 16px rgba(124,92,252,0.35)',
    transition: 'opacity 0.15s ease',
    marginTop: '4px',
  },
  tierBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  creditsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
  },
  creditStat: {
    flex: 1,
    textAlign: 'center',
  },
  creditStatVal: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  creditStatLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '4px',
  },
  creditDivider: {
    width: '1px',
    height: '40px',
    background: 'var(--border)',
  },
  creditTrack: {
    height: '6px',
    borderRadius: '99px',
    background: 'var(--bg-hover)',
    overflow: 'hidden',
  },
  creditFill: {
    height: '100%',
    borderRadius: '99px',
    background: 'var(--accent)',
    boxShadow: '0 0 8px rgba(124,92,252,0.5)',
    transition: 'width 0.6s ease',
  },
  supportText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  supportBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '11px',
    background: 'rgba(34,211,160,0.1)',
    border: '1px solid rgba(34,211,160,0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#22d3a0',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  errorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px',
  },
}

const infoStyles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  iconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '2px',
  },
  value: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
}

const fieldStyles = {
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-base)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  wrapFocused: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 3px var(--accent-glow)',
  },
  wrapDisabled: {
    opacity: 0.6,
    background: 'var(--bg-hover)',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    minWidth: 0,
  },
  inputDisabled: {
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  },
  hint: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    paddingLeft: '2px',
  },
}