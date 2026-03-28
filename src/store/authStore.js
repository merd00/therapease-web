import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // State
  user: null,
  token: localStorage.getItem('token') || null,

  // Actions
  login: (userData, token) => {
    localStorage.setItem('token', token)
    set({ user: userData, token })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore