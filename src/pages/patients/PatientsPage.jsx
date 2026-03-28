import { useState } from 'react'

const patients = [
  { id: 1, name: 'Ayşe Kaya',     age: 28, phone: '0532 111 22 33', sessions: 12, status: 'Aktif' },
  { id: 2, name: 'Mehmet Demir',  age: 35, phone: '0541 222 33 44', sessions: 5,  status: 'Aktif' },
  { id: 3, name: 'Zeynep Arslan', age: 22, phone: '0555 333 44 55', sessions: 1,  status: 'Yeni'  },
  { id: 4, name: 'Can Yıldız',    age: 41, phone: '0506 444 55 66', sessions: 8,  status: 'Aktif' },
  { id: 5, name: 'Selin Çelik',   age: 31, phone: '0533 555 66 77', sessions: 20, status: 'Pasif' },
  { id: 6, name: 'Burak Şahin',   age: 26, phone: '0544 666 77 88', sessions: 3,  status: 'Aktif' },
]

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
  const [search, setSearch] = useState('')

  // Arama filtresi — kullanıcı yazdıkça liste güncellenir
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık ve arama */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Hastalar</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} kayıtlı hasta</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          + Yeni hasta
        </button>
      </div>

      {/* Arama kutusu */}
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
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Seans</th>
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wide">Durum</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                  Sonuç bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((patient, index) => (
                <tr key={patient.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${avatarColors[index % avatarColors.length]}`}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{patient.age}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{patient.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{patient.sessions} seans</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[patient.status]}`}>
                      {patient.status}
                    </span>
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