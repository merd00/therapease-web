import { useState } from 'react'

const appointments = [
  { id: 1, name: 'Ayşe Kaya',     date: '28 Mart 2026', time: '09:00', type: 'Bireysel terapi', duration: 50,  status: 'Onaylı'    },
  { id: 2, name: 'Mehmet Demir',  date: '28 Mart 2026', time: '10:30', type: 'Çift terapisi',   duration: 80,  status: 'Onaylı'    },
  { id: 3, name: 'Zeynep Arslan', date: '28 Mart 2026', time: '13:00', type: 'İlk görüşme',     duration: 60,  status: 'Beklemede' },
  { id: 4, name: 'Can Yıldız',    date: '29 Mart 2026', time: '10:00', type: 'Bireysel terapi', duration: 50,  status: 'Onaylı'    },
  { id: 5, name: 'Selin Çelik',   date: '29 Mart 2026', time: '14:00', type: 'Bireysel terapi', duration: 50,  status: 'İptal'     },
  { id: 6, name: 'Burak Şahin',   date: '30 Mart 2026', time: '11:00', type: 'İlk görüşme',     duration: 60,  status: 'Beklemede' },
]

const filters = ['Tümü', 'Onaylı', 'Beklemede', 'İptal']

const statusStyle = {
  'Onaylı':    'bg-emerald-50 text-emerald-700',
  'Beklemede': 'bg-amber-50 text-amber-700',
  'İptal':     'bg-red-50 text-red-600',
}

// Tek bir randevu kartı — ayrı component
function AppointmentCard({ appointment }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-3">
      
      {/* Saat */}
      <div className="w-16 text-center">
        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
        <p className="text-xs text-gray-400">{appointment.duration} dk</p>
      </div>

      {/* Dikey çizgi */}
      <div className="w-0.5 h-10 bg-gray-100 rounded-full" />

      {/* Bilgiler */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{appointment.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{appointment.type}</p>
      </div>

      {/* Tarih */}
      <p className="text-xs text-gray-400 hidden sm:block">{appointment.date}</p>

      {/* Durum */}
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[appointment.status] || 'bg-gray-100 text-gray-500'}`}>
        {appointment.status}
      </span>

    </div>
  )
}

export default function AppointmentsPage() {
  const [activeFilter, setActiveFilter] = useState('Tümü')

  const filtered = appointments.filter(a =>
    activeFilter === 'Tümü' ? true : a.status === activeFilter
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Randevular</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} randevu</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          + Yeni randevu
        </button>
      </div>

      {/* Filtre butonları */}
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

      {/* Randevu listesi */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        {filtered.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">
            Bu filtrede randevu bulunamadı
          </p>
        ) : (
          filtered.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>

    </div>
  )
}