import { useState } from 'react'

const initialNotes = [
  {
    id: 1,
    patient: 'Ayşe Kaya',
    date: '28 Mart 2026',
    content: 'Kaygı yönetimi egzersizleri çalışıldı. Nefes tekniğinde ilerleme var.',
  },
  {
    id: 2,
    patient: 'Mehmet Demir',
    date: '27 Mart 2026',
    content: 'Çift terapisinde iletişim sorunları ele alındı. Ev ödevi verildi.',
  },
  {
    id: 3,
    patient: 'Can Yıldız',
    date: '26 Mart 2026',
    content: 'Depresif belirtilerde hafif azalma gözlemlendi. İlaç takibi yapıldı.',
  },
]

const patients = ['Ayşe Kaya', 'Mehmet Demir', 'Zeynep Arslan', 'Can Yıldız', 'Selin Çelik', 'Burak Şahin']

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
  const [notes, setNotes] = useState(initialNotes)
  const [showForm, setShowForm] = useState(false)
  const [patient, setPatient] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)

  const handleAdd = () => {
    // Doğrulama
    if (!patient || !content.trim()) {
      setError('Hasta ve not alanları zorunludur.')
      return
    }

    // Yeni notu listeye ekle
    const newNote = {
      id: notes.length + 1,
      patient,
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      content: content.trim(),
    }

    setNotes([newNote, ...notes])

    // Formu sıfırla
    setPatient('')
    setContent('')
    setError(null)
    setShowForm(false)
  }

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

      {/* Not ekleme formu */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-medium text-gray-900">Yeni seans notu</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Hasta seçimi */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <select
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors bg-white"
            >
              <option value="">Hasta seçin...</option>
              {patients.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Not içeriği */}
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
            onClick={handleAdd}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Kaydet
          </button>
        </div>
      )}

      {/* Not listesi */}
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div key={note.id} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${avatarColors[index % avatarColors.length]}`}>
                {getInitials(note.patient)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{note.patient}</p>
                <p className="text-xs text-gray-400">{note.date}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>

    </div>
  )
}