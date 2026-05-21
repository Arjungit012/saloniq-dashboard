import { create } from 'zustand'

const useAdminStore = create((set) => ({
  admin: null,
  token: localStorage.getItem('stylzap_admin_token') || null,
  isAuthenticated: !!localStorage.getItem('stylzap_admin_token'),

  login: (email, token) => {
    localStorage.setItem('stylzap_admin_token', token)
    localStorage.setItem('stylzap_admin_email', email)
    set({ admin: { email }, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('stylzap_admin_token')
    localStorage.removeItem('stylzap_admin_email')
    set({ admin: null, token: null, isAuthenticated: false })
  },

  hydrate: () => {
    const token = localStorage.getItem('stylzap_admin_token')
    const email = localStorage.getItem('stylzap_admin_email')
    if (token && email) {
      set({ admin: { email }, token, isAuthenticated: true })
    }
  }
}))

export default useAdminStore