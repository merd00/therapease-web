const stats = [
  { label: 'Bugünkü randevu', value: '6' },
  { label: 'Aktif hasta',     value: '34' },
  { label: 'Tamamlanan seans', value: '128' },
  { label: 'Aylık gelir',     value: '₺42K' },
]

const appointments = [
  { time: '09:00', name: 'Ayşe Kaya',    type: 'Bireysel terapi', status: 'Onaylı' },
  { time: '10:30', name: 'Mehmet Demir', type: 'Çift terapisi',   status: 'Onaylı' },
  { time: '13:00', name: 'Zeynep Arslan', type: 'İlk görüşme',   status: 'Beklemede' },
  { time: '15:00', name: 'Can Yıldız',   type: 'Bireysel terapi', status: 'Bekliyor' },
]

const statusStyle = {
  'Onaylı':    'bg-emerald-50 text-emerald-700',
  'Beklemede': 'bg-amber-50 text-amber-700',
  'Bekliyor':  'bg-gray-100 text-gray-500',
}

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Hoş geldin, Dr. Mert</p>
      </div>

      {/* Metrik kartlar */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-medium text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bugünkü randevular */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">Bugünkü program</h2>
        <div className="space-y-3">
          {appointments.map(appt => (
            <div key={appt.time} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-400 w-12">{appt.time}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{appt.name}</p>
                <p className="text-xs text-gray-400">{appt.type}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[appt.status]}`}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}