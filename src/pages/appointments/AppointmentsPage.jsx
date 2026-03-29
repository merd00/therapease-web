import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import appointmentService from '../../services/appointmentService'
import patientService from '../../services/patientService'
import { toast } from 'sonner'

const filters = ['Tümü', 'Onaylı', 'Beklemede', 'İptal']

const statusStyle = {
  'Onaylı':    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  'Beklemede': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  'İptal':     'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
}

function AppointmentCard({ appointment, onDelete, onStatusChange, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-xl px-3"
    >
      <div className="w-16 text-center shrink-0">
        <p className="text-base font-bold text-gray-900 dark:text-white">{appointment.time}</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{appointment.duration} dk</p>
      </div>
      <div className="w-0.5 h-10 bg-gray-100 dark:bg-gray-700 rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
          {appointment.patient_name || 'Danışan'}
        </p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-0.5">{appointment.type}</p>
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-300 shrink-0">{appointment.date}</p>
      <select
        value={appointment.status}
        onChange={(e) => onStatusChange(appointment.id, e.target.value)}
        className={`text-xs px-3 py-1.5 rounded-full font-bold border-0 outline-none cursor-pointer shrink-0 ${statusStyle[appointment.status] || 'bg-gray-100 text-gray-500'}`}
      >
        <option>Beklemede</option>
        <option>Onaylı</option>
        <option>İptal</option>
      </select>
      <button
        onClick={() => onDelete(appointment.id)}
        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all shrink-0"
      >
        <Trash2 size={13} />
        Sil
      </button>
    </motion.div>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients]         = useState([])
  const [activeFilter, setActiveFilter] = useState('Tümü')
  const [loading, setLoading]           = useState(true)
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

  useEffect(() => { fetchData() }, [])

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
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newAppt.patient_id || !newAppt.date || !newAppt.time) {
      toast.warning('Danışan, tarih ve saat zorunludur')
      return
    }
    try {
      setSaving(true)
      const created = await appointmentService.create({
        ...newAppt,
        patient_id: parseInt(newAppt.patient_id),
        duration: parseInt(newAppt.duration),
      })
      const patient = patients.find(p => p.id === created.patient_id)
      setAppointments([...appointments, { ...created, patient_name: patient?.name }])
      setNewAppt({ patient_id: '', date: '', time: '', type: 'Bireysel terapi', duration: 50, status: 'Beklemede' })
      setShowForm(false)
      toast.success('Randevu başarıyla eklendi')
    } catch (err) {
      toast.error('Randevu eklenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) return
    try {
      await appointmentService.delete(id)
      setAppointments(appointments.filter(a => a.id !== id))
      toast.success('Randevu silindi')
    } catch (err) {
      toast.error('Randevu silinemedi')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.update(id, { status })
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))
      toast.success('Durum güncellendi')
    } catch (err) {
      toast.error('Durum güncellenemedi')
    }
  }

  const filtered = appointments.filter(a =>
    activeFilter === 'Tümü' ? true : a.status === activeFilter
  )

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"

  if (loading) return (
    <div className="p-8 space-y-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 items-center bg-white dark:bg-gray-900 rounded-2xl p-5">
          <div className="w-16 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="flex-1 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          <div className="w-24 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Randevular</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">
            {appointments.length} randevu
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showForm ? 'İptal' : 'Yeni randevu'}
        </button>
      </motion.div>

      {/* Yeni randevu formu */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yeni randevu ekle</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Danışan *</label>
              <select value={newAppt.patient_id} onChange={(e) => setNewAppt({ ...newAppt, patient_id: e.target.value })} className={inputClass}>
                <option value="">Danışan seçin...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Tür *</label>
              <select value={newAppt.type} onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })} className={inputClass}>
                <option>Bireysel terapi</option>
                <option>Çift terapisi</option>
                <option>İlk görüşme</option>
                <option>Aile terapisi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Tarih *</label>
              <input type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Saat *</label>
              <input type="time" value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Süre (dk)</label>
              <input type="number" value={newAppt.duration} onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Durum</label>
              <select value={newAppt.status} onChange={(e) => setNewAppt({ ...newAppt, status: e.target.value })} className={inputClass}>
                <option>Beklemede</option>
                <option>Onaylı</option>
                <option>İptal</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Plus size={15} />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </motion.div>
      )}

      {/* Filtreler */}
      <div className="flex gap-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeFilter === filter
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Liste */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
              <Calendar size={24} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">
              {appointments.length === 0 ? 'Henüz randevu eklenmemiş' : 'Bu filtrede randevu yok'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {appointments.length === 0 ? 'Yeni randevu ekle butonuna tıklayın' : 'Farklı bir filtre deneyin'}
            </p>
          </div>
        ) : (
          filtered.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              index={index}
            />
          ))
        )}
      </motion.div>

    </div>
  )
}