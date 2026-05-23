import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
//import { Scissors, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import logo from '../assets/stylzap-logo.png'
import { Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import logo from '../assets/stylzap-logo.png'


export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { phone: phone.trim(), password: password.trim() })
      login(data.salon, data.token)
      toast.success(`Welcome back, ${data.salon.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Animated background grid */}
      <div style={styles.grid} aria-hidden="true" />

      {/* Glow orbs */}
      <div style={styles.orb1} aria-hidden="true" />
      <div style={styles.orb2} aria-hidden="true" />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
        <img src={logo} alt="StylZap" style={{ height: '44px', objectFit: 'contain', marginBottom: '16px' }} />
         <p style={styles.subtitle}>Sign in to your salon dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Phone field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number</label>
            <div style={{
              ...styles.inputWrap,
              ...(focused === 'phone' ? styles.inputWrapFocused : {}),
            }}>
              <Phone size={16} color={focused === 'phone' ? '#7c5cfc' : '#55558a'} strokeWidth={1.8} />
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                style={styles.input}
                maxLength={15}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={{
              ...styles.inputWrap,
              ...(focused === 'password' ? styles.inputWrapFocused : {}),
            }}>
              <Lock size={16} color={focused === 'password' ? '#7c5cfc' : '#55558a'} strokeWidth={1.8} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={styles.input}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff size={15} color="#55558a" />
                  : <Eye size={15} color="#55558a" />}
              </button>
            </div>
          </div>

          {/* Default password hint */}
          <p style={styles.hint}>
            Default password is your registered phone number
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnLoading : {}),
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Sign In</span>
                <ArrowRight size={16} strokeWidth={2} />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          Need help?{' '}
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            style={styles.footerLink}
          >
            Contact StylZap support
          </a>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
        @keyframes pulse1 {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(124,92,252,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,92,252,0.04) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    animation: 'gridMove 8s linear infinite',
    pointerEvents: 'none',
  },
  orb1: {
    position: 'absolute',
    top: '-120px',
    right: '-80px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%)',
    animation: 'pulse1 6s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-60px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)',
    animation: 'pulse2 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '420px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,252,0.08)',
    animation: 'fadeUp 0.5s ease forwards',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  iconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: 'var(--accent-glow)',
    border: '1px solid rgba(124,92,252,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--bg-card)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  inputWrapFocused: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 3px var(--accent-glow)',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    minWidth: 0,
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '-8px',
    paddingLeft: '2px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #7c5cfc, #9d82ff)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    boxShadow: '0 4px 20px rgba(124,92,252,0.4)',
  },
  submitBtnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '28px',
  },
  footerLink: {
    color: 'var(--accent-light)',
    fontWeight: 500,
  },
}
