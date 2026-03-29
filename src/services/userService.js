import api from './api'

const userService = {
  // Profil bilgilerini getir
  getMe: async () => {
    const response = await api.get('/users/me')
    return response.data
  },

  // Profil bilgilerini güncelle
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data)
    return response.data
  },

  // Şifre değiştir
  changePassword: async (data) => {
    const response = await api.put('/users/me/password', data)
    return response.data
  },

  // Avatar yükle
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

export default userService