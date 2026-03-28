import api from './api'

const patientService = {
  getAll: async () => {
    const response = await api.get('/patients/')
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/patients/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/patients/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/patients/${id}`)
  },
}

export default patientService