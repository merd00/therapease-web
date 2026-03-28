import { useState, useEffect } from 'react'
import appointmentService from '../../services/appointmentService'
import patientService from '../../services/patientService'

const filters = ['Tümü', 'Onaylı', 'Beklemede', 'İptal']

const statusStyle = {
  'Onaylı':    'bg-emerald-50 text-emerald-700',
  'Beklemede': 'bg-amber-50 text-amber-700',
  'İptal':     'bg-red-50 text-red-600',
}

function AppointmentCard({ appointment, onDelete, onStatusChange }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-3">
      <div className="w-16 text-center">
        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
        <p className="text-xs text-gray-400">{appointment.duration} dk</p>
      </div>
      <div className="w-0.5 h-10 bg-gray-100 rounded-full" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {appointment.patient_name || 'Hasta'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{appointment.type}</p>
      </div>
      <p className="text-xs text-gray-400">{appointment.date}</p>
      <select
        value={appointment.status}
        onChange={(e) => onStatusChange(appointment.id, e.target.value)}
        className={`text-xs px-3 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${statusStyle[appointment.status] || 'bg-gray-100 text-gray-500'}`}
      >
        <option>Beklemede</option>
        <option>Onaylı</option>
        <option>İptal</option>
      </select>
      <button
        onClick={() => onDelete(appointment.id)}
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        Sil
      </button>
    </div>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients]         = useState([])
  const [activeFilter, setActiveFilter] = useState('Tümü')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [showForm, setShowForm]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [newAppt, setNewAppt]           = useState({
    patient_id: '',
    date: '',
    time: '',
    type: 'Bireysel terapi',
    duration: 50,
    status: 'Beklemede',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appts, pats] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
      ])
      setAppointments(appts)
      setPatients(pats)
    } catch (err) {
      setError('Veriler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newAppt.patient_id || !newAppt.date || !newAppt.time) {
      setError('Hasta, tarih ve saat zorunludur.')
      return
    }
    try {
      setSaving(true)
      const created = await appointmentService.create({
        ...newAppt,
        patient_id: parseInt(newAppt.patient_id),
        duration: parseInt(newAppt.duration),
      })
      // Hasta adını ekle
      const patient = patients.find(p => p.id === created.patient_id)
      setAppointments([...appointments, { ...created, patient_name: patient?.name }])
      setNewAppt({ patient_id: '', date: '', time: '', type: 'Bireysel terapi', duration: 50, status: 'Beklemede' })
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError('Randevu eklenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return
    try {
      await appointmentService.delete(id)
      setAppointments(appointments.filter(a => a.id !== id))
    } catch (err) {
      setError('Randevu silinemedi.')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.update(id, { status })
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
    } catch (err) {
      setError('Durum güncellenemedi.')
    }
  }

  const filtered = appointments.filter(a =>
    activeFilter === 'Tümü' ? true : a.status === activeFilter
  )

  if (loading) return (
    <div className="p-8 text-gray-400 text-sm">Yükleniyor...</div>
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Randevular</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} randevu</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {showForm ? 'İptal' : '+ Yeni randevu'}
        </button>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Yeni randevu formu */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-medium text-gray-900">Yeni randevu ekle</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hasta *</label>
              <select
                value={newAppt.patient_id}
                onChange={(e) => setNewAppt({ ...newAppt, patient_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white"
              >
                <option value="">Hasta seçin...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tür *</label>
              <select
                value={newAppt.type}
                onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white"
              >
                <option>Bireysel terapi</option>
                <option>Çift terapisi</option>
                <option>İlk görüşme</option>
                <option>Aile terapisi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tarih *</label>
              <input
                type="date"
                value={newAppt.date}
                onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Saat *</label>
              <input
                type="time"
                value={newAppt.time}
                onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Süre (dk)</label>
              <input
                type="number"
                value={newAppt.duration}
                onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Durum</label>
              <select
                value={newAppt.status}
                onChange={(e) => setNewAppt({ ...newAppt, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white"
              >
                <option>Beklemede</option>
                <option>Onaylı</option>
                <option>İptal</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex gap-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === filter
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        {filtered.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">
            {appointments.length === 0 ? 'Henüz randevu eklenmemiş.' : 'Bu filtrede randevu yok.'}
          </p>
        ) : (
          filtered.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

    </div>
  )
}