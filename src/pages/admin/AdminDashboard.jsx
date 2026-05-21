import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users, CreditCard, Zap, TrendingUp,
  Plus, CheckCircle, XCircle, Eye,
  Building2, RefreshCw, LogOut
} from 'lucide-react'
import adminApi from '../../api/adminApi'
import useAdminStore from '../../store/adminStore'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

function formatDate(str) {
  try { return format(parseISO(str), 'dd MMM yyyy') } catch { return str || '—' }
}

function formatAmount(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#7c5cfc' }) {
  return (
    <div style={cardStyles.wrap}>
      <div style={{ ...cardStyles.icon, background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon size={18} color={color} />
      </div>
      <div style={cardStyles.value}>{value}</div>
      <div style={cardStyles.label}>{label}</div>
      {sub && <div style={cardStyles.sub}>{sub}</div>}
    </div>
  )
}

// ─── Onboard Modal ────────────────────────────────────────
function OnboardModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', phone: '', ownerName: '', city: '',
    metaPhoneNumberId: '', metaWabaId: '', metaAccessToken: '',
    subscriptionTier: 'starter'
  })
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.ownerName) {
      toast.error('Name, phone and owner name are required')
      return
    }
    setLoading(true)
    try {
      await adminApi.post('/admin/salons', form)
      toast.success(`✅ ${form.name} onboarded successfully!`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to onboard salon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.box}>
        <h2 style={modalStyles.title}>Onboard New Salon</h2>

        <div style={modalStyles.grid}>
          {[
            { key: 'name', label: 'Salon Name *', placeholder: 'e.g. Royal Cuts' },
            { key: 'phone', label: 'WhatsApp Phone *', placeholder: 'e.g. 919876543210' },
            { key: 'ownerName', label: 'Owner Name *', placeholder: 'e.g. Ramesh Kumar' },
            { key: 'city', label: 'City', placeholder: 'e.g. Bengaluru' },
            { key: 'metaPhoneNumberId', label: 'Meta Phone Number ID', placeholder: 'From Meta Dashboard' },
            { key: 'metaWabaId', label: 'Meta WABA ID', placeholder: 'WhatsApp Business Account ID' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} style={modalStyles.field}>
              <label style={modalStyles.label}>{label}</label>
              <input
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                style={modalStyles.input}
              />
            </div>
          ))}

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Subscription Tier</label>
            <select
              value={form.subscriptionTier}
              onChange={e => set('subscriptionTier', e.target.value)}
              style={modalStyles.input}
            >
              <option value="starter">Starter — ₹999/mo (50 credits)</option>
              <option value="growth">Growth — ₹1,999/mo (150 credits)</option>
              <option value="pro">Pro — ₹2,999/mo (300 credits)</option>
            </select>
          </div>

          <div style={{ ...modalStyles.field, gridColumn: '1/-1' }}>
            <label style={modalStyles.label}>Meta Access Token</label>
            <input
              value={form.metaAccessToken}
              onChange={e => set('metaAccessToken', e.target.value)}
              placeholder="Permanent Meta access token"
              style={modalStyles.input}
            />
          </div>
        </div>

        <div style={modalStyles.actions}>
          <button onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={modalStyles.submitBtn}>
            {loading ? 'Onboarding...' : 'Onboard Salon'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Dashboard ─────────────────────────────────
export default function AdminDashboard() {
  const logout = useAdminStore((s) => s.logout)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('salons')
  const [showOnboard, setShowOnboard] = useState(false)
  const [selectedSalon, setSelectedSalon] = useState(null)

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/stats')
      return data
    }
  })

  const { data: salonsData, isLoading: salonsLoading } = useQuery({
    queryKey: ['admin-salons'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/salons')
      return data
    },
    enabled: tab === 'salons'
  })

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/payments')
      return data
    },
    enabled: tab === 'payments'
  })

  const { data: generationsData, isLoading: generationsLoading } = useQuery({
    queryKey: ['admin-generations'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/generations')
      return data
    },
    enabled: tab === 'generations'
  })

  const handleStatusToggle = async (salon) => {
    const newStatus = salon.subscription_status === 'active' ? 'suspended' : 'active'
    try {
      await adminApi.put(`/admin/salons/${salon.id}/status`, { status: newStatus })
      toast.success(`Salon ${newStatus}`)
      queryClient.invalidateQueries(['admin-salons'])
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/admin'
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>StylZap Admin</h1>
          <p style={styles.sub}>Manage all salons and payments</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <StatCard icon={Building2} label="Total Salons" value={stats.salons.total} sub={`${stats.salons.new_this_month} new this month`} color="#22d3a0" />
          <StatCard icon={CheckCircle} label="Active Salons" value={stats.salons.active} color="#22d3a0" />
          <StatCard icon={CreditCard} label="Total Revenue" value={formatAmount(stats.revenue.total_revenue)} sub={`${formatAmount(stats.revenue.monthly_revenue)} this month`} color="#7c5cfc" />
          <StatCard icon={Zap} label="Total Generations" value={stats.generations.total} sub={`${stats.generations.this_month} this month`} color="#f5c842" />
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {['salons', 'payments', 'generations'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}

        {tab === 'salons' && (
          <button onClick={() => setShowOnboard(true)} style={styles.onboardBtn}>
            <Plus size={14} /> Onboard Salon
          </button>
        )}
      </div>

      {/* Salons Tab */}
      {tab === 'salons' && (
        <div style={styles.tableWrap}>
          {salonsLoading ? (
            <div style={styles.loading}>Loading salons...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Salon', 'Owner', 'Phone', 'Plan', 'Credits', 'Customers', 'Generations', 'Status', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salonsData?.salons?.map(salon => (
                  <tr key={salon.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.salonName}>{salon.name}</div>
                      <div style={styles.salonCity}>{salon.city || '—'}</div>
                    </td>
                    <td style={styles.td}>{salon.owner_name}</td>
                    <td style={styles.td}>{salon.phone}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: 'rgba(124,92,252,0.15)', color: '#7c5cfc' }}>
                        {salon.subscription_tier}
                      </span>
                    </td>
                    <td style={styles.td}>{salon.ai_credits_remaining}/{salon.ai_credits_total}</td>
                    <td style={styles.td}>{salon.total_customers}</td>
                    <td style={styles.td}>{salon.total_generations}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: salon.subscription_status === 'active' ? 'rgba(34,211,160,0.15)' : 'rgba(248,113,113,0.15)',
                        color: salon.subscription_status === 'active' ? '#22d3a0' : '#f87171',
                      }}>
                        {salon.subscription_status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleStatusToggle(salon)}
                          style={styles.actionBtn}
                          title={salon.subscription_status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {salon.subscription_status === 'active'
                            ? <XCircle size={14} color="#f87171" />
                            : <CheckCircle size={14} color="#22d3a0" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div style={styles.tableWrap}>
          {paymentsLoading ? (
            <div style={styles.loading}>Loading payments...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Salon', 'Owner', 'Type', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentsData?.payments?.map(p => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>{p.salon_name}</td>
                    <td style={styles.td}>{p.owner_name}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{p.type?.replace(/_/g, ' ')}</span>
                    </td>
                    <td style={styles.td}>{formatAmount(p.amount)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: p.status === 'succeeded' ? 'rgba(34,211,160,0.15)' : 'rgba(245,200,66,0.15)',
                        color: p.status === 'succeeded' ? '#22d3a0' : '#f5c842',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Generations Tab */}
      {tab === 'generations' && (
        <div style={styles.tableWrap}>
          {generationsLoading ? (
            <div style={styles.loading}>Loading generations...</div>
          ) : (
            <>
              {generationsData?.stats && (
                <div style={styles.genStats}>
                  <span>Total: <strong>{generationsData.stats.total}</strong></span>
                  <span>Succeeded: <strong style={{ color: '#22d3a0' }}>{generationsData.stats.succeeded}</strong></span>
                  <span>Failed: <strong style={{ color: '#f87171' }}>{generationsData.stats.failed}</strong></span>
                  <span>Total Cost: <strong>{formatAmount(generationsData.stats.total_cost)}</strong></span>
                </div>
              )}
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Salon', 'Customer', 'Face Shape', 'Hairstyle', 'Status', 'Cost', 'Date'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generationsData?.generations?.map(g => (
                    <tr key={g.id} style={styles.tr}>
                      <td style={styles.td}>{g.salon_name}</td>
                      <td style={styles.td}>{g.customer_phone}</td>
                      <td style={styles.td}>{g.face_shape}</td>
                      <td style={styles.td}>{g.hairstyle_name}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: g.status === 'succeeded' ? 'rgba(34,211,160,0.15)' : 'rgba(248,113,113,0.15)',
                          color: g.status === 'succeeded' ? '#22d3a0' : '#f87171',
                        }}>
                          {g.status}
                        </span>
                      </td>
                      <td style={styles.td}>₹{g.cost_incurred}</td>
                      <td style={styles.td}>{formatDate(g.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Onboard Modal */}
      {showOnboard && (
        <OnboardModal
          onClose={() => setShowOnboard(false)}
          onSuccess={() => queryClient.invalidateQueries(['admin-salons'])}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '0',
  },
  tab: {
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: '-1px',
  },
  tabActive: {
    color: '#7c5cfc',
    borderBottom: '2px solid #7c5cfc',
  },
  onboardBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(124,92,252,0.15)',
    border: '1px solid rgba(124,92,252,0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#7c5cfc',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginLeft: 'auto',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    color: 'var(--text-muted)',
    fontWeight: 600,
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    background: 'var(--bg-surface)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '12px 16px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  salonName: {
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  salonCity: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 600,
    background: 'var(--bg-hover)',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  genStats: {
    display: 'flex',
    gap: '24px',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
}

const cardStyles = {
  wrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  value: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  sub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  box: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '10px 12px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    padding: '10px 24px',
    background: '#7c5cfc',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
}