import api from './api'

const noteService = {

  getAll: async () => {
    const response = await api.get('/notes/')
    return response.data
  },

  getByPatient: async (patientId) => {
    const response = await api.get('/notes/', {
      params: { patient_id: patientId }
    })
    return response.data
  },

  getPatientSummaries: async () => {
    const response = await api.get('/notes/by-patient')
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/notes/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/notes/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    await api.delete(`/notes/${id}`)
  },
}

export default noteService