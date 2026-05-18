import { create } from 'zustand'

const useAuthStore = create((set) => ({
  salon: null,
  token: localStorage.getItem('saloniq_token') || null,
  isAuthenticated: !!localStorage.getItem('saloniq_token'),

  login: (salon, token) => {
    localStorage.setItem('saloniq_token', token)
    localStorage.setItem('saloniq_salon', JSON.stringify(salon))
    set({ salon, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('saloniq_token')
    localStorage.removeItem('saloniq_salon')
    set({ salon: null, token: null, isAuthenticated: false })
  },

  hydrate: () => {
    const token = localStorage.getItem('saloniq_token')
    const raw = localStorage.getItem('saloniq_salon')
    if (token && raw) {
      try {
        const salon = JSON.parse(raw)
        set({ salon, token, isAuthenticated: true })
      } catch {
        set({ salon: null, token: null, isAuthenticated: false })
      }
    }
  },
}))

export default useAuthStore