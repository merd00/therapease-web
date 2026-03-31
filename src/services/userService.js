import api from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const userService = {

  getMe: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/me', data)
    return response.data
  },

  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data)
    return response.data
  },

  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/users/stats')
    return response.data
  },

  getAvatarUrl: (avatarPath) => {
    if (!avatarPath) return null
    if (avatarPath.startsWith('http')) return avatarPath
    return `${BASE_URL}${avatarPath}`
  },
}

export default userService