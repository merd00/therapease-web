import { useState, useEffect } from 'react'
import noteService from '../../services/noteService'
import patientService from '../../services/patientService'

const avatarColors = [
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-amber-100 text-amber-700',
]

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('')
}

export default function NotesPage() {
  const [notes, setNotes]         = useState([])
  const [patients, setPatients]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [patientId, setPatientId] = useState('')
  const [content, setContent]     = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [notesData, patientsData] = await Promise.all([
        noteService.getAll(),
        patientService.getAll(),
      ])
      setNotes(notesData)
      setPatients(patientsData)
    } catch (err) {
      setError('Veriler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!patientId || !content.trim()) {
      setError('Hasta ve not alanları zorunludur.')
      return
    }
    try {
      setSaving(true)
      const created = await noteService.create({
        patient_id: parseInt(patientId),
        content: content.trim(),
      })
      setNotes([created, ...notes])
      setPatientId('')
      setContent('')
      setShowForm(false)
      setError(null)
    } catch (err) {
      setError('Not eklenemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return
    try {
      await noteService.delete(id)
      setNotes(notes.filter(n => n.id !== id))
    } catch (err) {
      setError('Not silinemedi.')
    }
  }

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId)
    return patient?.name || 'Bilinmeyen hasta'
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) return (
    <div className="p-8 text-gray-400 text-sm">Yükleniyor...</div>
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Notlar</h1>
          <p className="text-gray-500 text-sm mt-1">{notes.length} seans notu</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {showForm ? 'İptal' : '+ Yeni not'}
        </button>
      </div>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Not ekleme formu */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-medium text-gray-900">Yeni seans notu</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white"
            >
              <option value="">Hasta seçin...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Not</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Seans notunu buraya yazın..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors resize-none"
            />
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

      {/* Not listesi */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
            Henüz not eklenmemiş.
          </div>
        ) : (
          notes.map((note, index) => {
            const patientName = getPatientName(note.patient_id)
            return (
              <div key={note.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${avatarColors[index % avatarColors.length]}`}>
                      {getInitials(patientName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patientName}</p>
                      <p className="text-xs text-gray-400">{formatDate(note.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Sil
                  </button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
              </div>
            )
          })
        )}
      </div>

    </div>
  )
}