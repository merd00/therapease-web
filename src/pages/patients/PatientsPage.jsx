import { useState, useEffect } from 'react'
import patientService from '../../services/patientService'

const statusStyle = {
  'Aktif': 'bg-emerald-50 text-emerald-700',
  'Yeni':  'bg-blue-50 text-blue-700',
  'Pasif': 'bg-gray-100 text-gray-500',
}

const avatarColors = [
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
]

export default function PatientsPage() {
  const [patients, setPatients]   = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', age: '', phone: '', status: 'Aktif' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await patientService.getAll()
      setPatients(data)
    } catch (err) {
      setError('Hastalar yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newPatient.name.trim()) return
    try {
      setSaving(true)
      const created = await patientService.create({
        ...newPatient,
        age: newPatient.age ? parseInt(newPatient.age) : null,
      })
      setPatients([...patients, created])
      setNewPatient({ name: '', age: '', phone: '', status: 'Aktif' })
      setShowForm(false)
    } catch (err) {
      setError('Hasta eklenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu hastayı silmek istediğinize emin misiniz?')) return
    try {
      await patientService.delete(id)
      setPatients(patients.filter(p => p.id !== id))
    } catch (err) {
      setError('Hasta silinemedi.')
    }
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="p-8 text-gray-400 text-sm">Yükleniyor...</div>
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Hastalar</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} kayıtlı hasta</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {showForm ? 'İptal' : '+ Yeni hasta'}
        </button>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Yeni hasta formu */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-medium text-gray-900">Yeni hasta ekle</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Ayşe Kaya"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Yaş</label>
              <input
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                placeholder="28"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefon</label>
              <input
                type="text"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                placeholder="0532 111 22 33"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Durum</label>
              <select
                value={newPatient.status}
                onChange={(e) => setNewPatient({ ...newPatient, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors bg-white"
              >
                <option>Aktif</option>
                <option>Yeni</option>
                <option>Pasif</option>
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

      {/* Arama */}
      <input
        type="text"
        placeholder="Hasta ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
      />

      {/* Hasta listesi */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Hasta</th>
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Yaş</th>
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Telefon</th>
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Durum</th>
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                  {patients.length === 0 ? 'Henüz hasta eklenmemiş.' : 'Sonuç bulunamadı.'}
                </td>
              </tr>
            ) : (
              filtered.map((patient, index) => (
                <tr key={patient.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${avatarColors[index % avatarColors.length]}`}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{patient.age || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{patient.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[patient.status] || 'bg-gray-100 text-gray-500'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}