import api from './api'

const noteService = {
  getAll: async () => {
    const response = await api.get('/notes/')
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/notes/', data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/notes/${id}`)
  },
}

export default noteService