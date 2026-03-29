import { create } from 'zustand'

const useThemeStore = create((set, get) => ({
  isDark: localStorage.getItem('theme') === 'dark',

  toggleTheme: () => {
    const newDark = !get().isDark   // ← get() ile anlık state'i oku
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ isDark: newDark })
  },
}))

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark')
}

export default useThemeStore