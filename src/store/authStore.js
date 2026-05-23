import { create } from 'zustand'

const useAuthStore = create((set) => ({
  salon: null,
  token: localStorage.getItem('stylzap_token') || null,
  isAuthenticated: !!localStorage.getItem('stylzap_token'),

  login: (salon, token) => {
    localStorage.setItem('stylzap_token', token)
    localStorage.setItem('stylzap_salon', JSON.stringify(salon))
    set({ salon, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('stylzap_token')
    localStorage.removeItem('stylzap_salon')
    set({ salon: null, token: null, isAuthenticated: false })
  },

  hydrate: () => {
    const token = localStorage.getItem('stylzap_token')
    const raw = localStorage.getItem('stylzap_salon')
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
