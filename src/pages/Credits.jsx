import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Zap, TrendingUp, CreditCard,
  CheckCircle, AlertCircle, Clock,
  IndianRupee, ShoppingBag,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { format, parseISO } from 'date-fns'

// ─── Plan config ─────────────────────────────────────────
const PLANS = [
  {
    key: 'starter',
    label: 'Starter',
    price: 999,
    credits: 50,
    color: '#22d3a0',
    glow: 'rgba(34,211,160,0.15)',
    border: 'rgba(34,211,160,0.3)',
  },
  {
    key: 'growth',
    label: 'Growth',
    price: 1999,
    credits: 150,
    color: '#7c5cfc',
    glow: 'rgba(124,92,252,0.15)',
    border: 'rgba(124,92,252,0.3)',
    popular: true,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: 2999,
    credits: 300,
    color: '#f5c842',
    glow: 'rgba(245,200,66,0.15)',
    border: 'rgba(245,200,66,0.3)',
  },
]

// ─── Extra credit packs ───────────────────────────────────
const CREDIT_PACKS = [
  { pack: '50', images: 50, amount: 450, label: '50 Credits', sub: '₹9/image' },
  { pack: '100', images: 100, amount: 800, label: '100 Credits', sub: '₹8/image' },
  { pack: '200', images: 200, amount: 1400, label: '200 Credits', sub: '₹7/image' },
]

// ─── Helpers ─────────────────────────────────────────────
function formatDate(str) {
  try { return format(parseISO(str), 'dd MMM yyyy') } catch { return str }
}

function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

const paymentStatusStyle = {
  succeeded: { color: '#22d3a0', label: 'Paid' },
  captured:  { color: '#22d3a0', label: 'Paid' },
  pending:   { color: '#f5c842', label: 'Pending' },
  failed:    { color: '#f87171', label: 'Failed' },
}

// ─── Load Razorpay script ─────────────────────────────────
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ─── Open Razorpay Checkout ───────────────────────────────
async function openRazorpay({ orderId, amount, salonName, description, onSuccess, onFailure }) {
  const loaded = await loadRazorpay()
  if (!loaded) {
    toast.error('Failed to load payment gateway. Please try again.')
    return
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'StylZap',
    description,
    order_id: orderId,
    handler: async (response) => {
      try {
        // Verify payment on backend
        await api.post('/payment/verify', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
        onSuccess()
      } catch {
        toast.error('Payment verification failed. Contact support.')
        onFailure?.()
      }
    },
    prefill: {
      name: salonName,
    },
    theme: {
      color: '#7c5cfc',
    },
    modal: {
      ondismiss: () => {
        toast('Payment cancelled', { icon: '⚠️' })
        onFailure?.()
      }
    }
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}

// ─── Sub-components ───────────────────────────────────────
function CreditMeter({ remaining, total }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0
  const color = pct > 40 ? '#22d3a0' : pct > 15 ? '#f5c842' : '#f87171'
  const used = total - remaining

  return (
    <div style={meterStyles.wrap} className="fade-up">
      <div style={meterStyles.top}>
        <div>
          <div style={meterStyles.label}>AI Credits Remaining</div>
          <div style={{ ...meterStyles.value, color }}>
            {remaining}
            <span style={meterStyles.total}> / {total}</span>
          </div>
        </div>
        <div style={meterStyles.pctBadge}>
          <span style={{ color }}>{pct}%</span>
          <span style={meterStyles.pctSub}>left</span>
        </div>
      </div>

      <div style={meterStyles.track}>
        <div style={{
          ...meterStyles.fill,
          width: `${pct}%`,
          background: color,
          boxShadow: `0 0 12px ${color}60`,
        }} />
      </div>

      <div style={meterStyles.statsRow}>
        <div style={meterStyles.stat}>
          <Zap size={13} color={color} />
          <span>{remaining} remaining</span>
        </div>
        <div style={meterStyles.stat}>
          <TrendingUp size={13} color="var(--text-muted)" />
          <span>{used} used</span>
        </div>
        <div style={meterStyles.stat}>
          <IndianRupee size={13} color="var(--text-muted)" />
          <span>₹{used * 7} spent on AI</span>
        </div>
      </div>

      {pct <= 15 && (
        <div style={meterStyles.warn}>
          <AlertCircle size={14} color="#f87171" />
          <span>Credits critically low — upgrade your plan or buy extra credits</span>
        </div>
      )}
    </div>
  )
}

function PlanCard({ plan, currentTier, onUpgrade, loading }) {
  const isCurrent = currentTier === plan.key

  return (
    <div style={{
      ...planStyles.card,
      border: isCurrent
        ? `1.5px solid ${plan.color}`
        : '1px solid var(--border)',
      boxShadow: isCurrent ? `0 0 24px ${plan.glow}` : 'var(--shadow-card)',
    }}>
      {plan.popular && !isCurrent && (
        <div style={planStyles.popularBadge}>Most Popular</div>
      )}
      {isCurrent && (
        <div style={{ ...planStyles.popularBadge, background: plan.glow, color: plan.color, border: `1px solid ${plan.border}` }}>
          Current Plan
        </div>
      )}

      <div style={planStyles.name}>{plan.label}</div>
      <div style={planStyles.price}>
        ₹{plan.price.toLocaleString('en-IN')}
        <span style={planStyles.mo}>/mo</span>
      </div>
      <div style={planStyles.credits}>
        <Zap size={14} color={plan.color} />
        <span>{plan.credits} AI credits</span>
      </div>
      <div style={planStyles.perImg}>
        ₹{(plan.price / plan.credits).toFixed(0)} per image
      </div>

      <button
        onClick={() => !isCurrent && !loading && onUpgrade(plan)}
        disabled={isCurrent || loading}
        style={{
          ...planStyles.btn,
          background: isCurrent ? 'var(--bg-hover)' : plan.glow,
          color: isCurrent ? 'var(--text-muted)' : plan.color,
          border: `1px solid ${isCurrent ? 'var(--border)' : plan.border}`,
          cursor: isCurrent || loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {isCurrent ? (
          <><CheckCircle size={14} /> Active</>
        ) : loading ? (
          <>Processing...</>
        ) : (
          <>Upgrade to {plan.label}</>
        )}
      </button>
    </div>
  )
}

function CreditPackCard({ pack, onBuy, loading }) {
  return (
    <div style={packStyles.card}>
      <div style={packStyles.label}>{pack.label}</div>
      <div style={packStyles.amount}>₹{pack.amount.toLocaleString('en-IN')}</div>
      <div style={packStyles.sub}>{pack.sub}</div>
      <button
        onClick={() => !loading && onBuy(pack)}
        disabled={loading}
        style={{
          ...packStyles.btn,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        <ShoppingBag size={13} />
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  )
}

function PaymentRow({ payment }) {
  const s = paymentStatusStyle[payment.status] || paymentStatusStyle.pending
  return (
    <div style={payStyles.row}>
      <div style={payStyles.icon}>
        <CreditCard size={15} color="var(--text-muted)" />
      </div>
      <div style={payStyles.info}>
        <div style={payStyles.type}>
          {payment.type?.replace(/_/g, ' ') || 'Payment'}
        </div>
        <div style={payStyles.date}>
          <Clock size={11} color="var(--text-muted)" />
          {formatDate(payment.created_at)}
        </div>
      </div>
      <div style={payStyles.right}>
        <div style={payStyles.amount}>{formatAmount(payment.amount)}</div>
        <div style={{ ...payStyles.status, color: s.color }}>{s.label}</div>
      </div>
    </div>
  )
}

function UsageChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.empty}>
        <TrendingUp size={28} color="var(--text-muted)" strokeWidth={1.4} />
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          No generation data in the last 30 days
        </p>
      </div>
    )
  }

  const max = Math.max(...data.map((d) => Number(d.count)), 1)

  return (
    <div style={chartStyles.wrap}>
      {data.map((d, i) => {
        const pct = (Number(d.count) / max) * 100
        return (
          <div key={i} style={chartStyles.barCol} title={`${formatDate(d.date)}: ${d.count} generations`}>
            <div style={chartStyles.barWrap}>
              <div style={{
                ...chartStyles.bar,
                height: `${Math.max(pct, 4)}%`,
              }} />
            </div>
            <div style={chartStyles.barLabel}>
              {new Date(d.date).getDate()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────
export default function Credits() {
  const salon = useAuthStore((s) => s.salon)
  const queryClient = useQueryClient()
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [packLoading, setPackLoading] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['credits', salon?.id],
    queryFn: async () => {
      const { data } = await api.get(`/credits/${salon.id}`)
      return data
    },
    enabled: !!salon?.id,
  })

  // ── Upgrade subscription ──────────────────────────────────
  const handleUpgrade = async (plan) => {
    setUpgradeLoading(true)
    try {
      const { data } = await api.post('/payment/subscription', {
        salonId: salon.id,
        tier: plan.key,
      })

      await openRazorpay({
        orderId: data.orderId,
        amount: data.amount,
        salonName: salon.name,
        description: `StylZap ${plan.label} Plan — ${plan.credits} AI credits/month`,
        onSuccess: () => {
          toast.success(`🎉 Upgraded to ${plan.label}! Credits added.`)
          queryClient.invalidateQueries(['credits', salon.id])
          setUpgradeLoading(false)
        },
        onFailure: () => setUpgradeLoading(false),
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order')
      setUpgradeLoading(false)
    }
  }

  // ── Buy extra credit pack ─────────────────────────────────
  const handleBuyPack = async (pack) => {
    setPackLoading(pack.pack)
    try {
      const { data } = await api.post('/payment/credits', {
        salonId: salon.id,
        pack: pack.pack,
      })

      await openRazorpay({
        orderId: data.orderId,
        amount: data.amount,
        salonName: salon.name,
        description: `StylZap ${pack.images} Extra AI Credits`,
        onSuccess: () => {
          toast.success(`✅ ${pack.images} credits added to your account!`)
          queryClient.invalidateQueries(['credits', salon.id])
          setPackLoading(null)
        },
        onFailure: () => setPackLoading(null),
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order')
      setPackLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div className="skeleton" style={{ height: 140, borderRadius: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={styles.errorWrap}>
        <AlertCircle size={32} color="#f87171" />
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Failed to load credits data
        </p>
      </div>
    )
  }

  const { credits, subscription, usage_last_30_days, recent_payments, total_generations } = data

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div className="fade-up" style={{ opacity: 0 }}>
        <h1 style={styles.pageTitle}>Credits & Billing</h1>
        <p style={styles.pageSub}>
          Manage your AI credits and subscription plan
        </p>
      </div>

      {/* Credit meter */}
      <CreditMeter
        remaining={credits.remaining}
        total={credits.total}
      />

      {/* Plans */}
      <div className="fade-up" style={{ opacity: 0, animationDelay: '100ms' }}>
        <h2 style={styles.sectionTitle}>Subscription Plans</h2>
        <div style={styles.plansGrid}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              currentTier={subscription.tier}
              onUpgrade={handleUpgrade}
              loading={upgradeLoading}
            />
          ))}
        </div>
      </div>

      {/* Extra credits */}
      <div className="fade-up" style={{ opacity: 0, animationDelay: '160ms' }}>
        <h2 style={styles.sectionTitle}>Buy Extra Credits</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '-8px' }}>
          Top up anytime — credits never expire
        </p>
        <div style={styles.packsGrid}>
          {CREDIT_PACKS.map((pack) => (
            <CreditPackCard
              key={pack.pack}
              pack={pack}
              onBuy={handleBuyPack}
              loading={packLoading === pack.pack}
            />
          ))}
        </div>
      </div>

      {/* Usage chart + payments */}
      <div style={styles.columns}>
        {/* Usage chart */}
        <div style={styles.panel} className="fade-up">
          <div style={styles.panelHeader}>
            <h2 style={styles.sectionTitle}>Usage — Last 30 Days</h2>
            <span style={styles.totalBadge}>
              {total_generations} total generations
            </span>
          </div>
          <UsageChart data={usage_last_30_days} />
        </div>

        {/* Payment history */}
        <div style={styles.panel} className="fade-up">
          <div style={styles.panelHeader}>
            <h2 style={styles.sectionTitle}>Payment History</h2>
          </div>
          {recent_payments.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No payments yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recent_payments.map((p) => (
                <PaymentRow key={p.id} payment={p} />
              ))}
            </div>
          )}
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
    gap: '28px',
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
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '16px',
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  packsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  panel: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  totalBadge: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '99px',
    padding: '4px 12px',
  },
  errorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '80px',
  },
}

const meterStyles = {
  wrap: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    opacity: 0,
    animationDelay: '60ms',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  value: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '40px',
    fontWeight: 800,
    lineHeight: 1,
  },
  total: {
    fontSize: '20px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  pctBadge: {
    textAlign: 'right',
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1,
  },
  pctSub: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 400,
    marginTop: '4px',
  },
  track: {
    height: '8px',
    borderRadius: '99px',
    background: 'var(--bg-hover)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.8s ease',
  },
  statsRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  warn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#f87171',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
  },
}

const planStyles = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '99px',
    background: 'var(--accent-glow)',
    color: 'var(--accent-light)',
    border: '1px solid var(--accent)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  price: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1,
    marginTop: '4px',
  },
  mo: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--text-muted)',
  },
  credits: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  perImg: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.15s ease',
    marginTop: 'auto',
  },
}

const packStyles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  amount: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--accent-light)',
    lineHeight: 1,
  },
  sub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    background: 'var(--accent-glow)',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--accent-light)',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.15s ease',
    marginTop: 'auto',
  },
}

const payStyles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
  },
  icon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  type: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    textTransform: 'capitalize',
    marginBottom: '3px',
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  right: { textAlign: 'right' },
  amount: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  status: {
    fontSize: '11px',
    fontWeight: 600,
    marginTop: '2px',
  },
}

const chartStyles = {
  wrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '120px',
    padding: '8px 0',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    height: '100%',
    cursor: 'default',
  },
  barWrap: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: '3px 3px 0 0',
    background: 'var(--accent)',
    opacity: 0.7,
    transition: 'opacity 0.15s',
    minHeight: '4px',
  },
  barLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
  },
}