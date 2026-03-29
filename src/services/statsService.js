import api from './api'

const statsService = {
  getStats: async (weekOffset = 0) => {
    const response = await api.get(`/stats/?week_offset=${weekOffset}`)
    return response.data
  },
}

export default statsService