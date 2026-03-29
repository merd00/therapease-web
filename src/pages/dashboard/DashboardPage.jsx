import { useState, useEffect } from 'react'
import statsService from '../../services/statsService'
import useAuthStore from '../../store/authStore'

const statusStyle = {
  'Onaylı':    'bg-emerald-50 text-emerald-700',
  'Beklemede': 'bg-amber-50 text-amber-700',
  'İptal':     'bg-red-50 text-red-600',
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await statsService.getStats()
        setStats(data)
      } catch (err) {
        setError('Veriler yüklenemedi.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="p-8 text-gray-400 text-sm">Yükleniyor...</div>
  )

  if (error) return (
    <div className="p-8 text-red-500 text-sm">{error}</div>
  )

  const metrics = [
    { label: 'Aktif hasta',        value: stats?.active_patients     ?? 0 },
    { label: 'Toplam hasta',       value: stats?.total_patients       ?? 0 },
    { label: 'Toplam randevu',     value: stats?.total_appointments   ?? 0 },
    { label: 'Toplam not',         value: stats?.total_notes          ?? 0 },
  ]

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Hoş geldin, {user?.name || 'Danışman'}
        </p>
      </div>

      {/* Metrik kartlar */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {metric.label}
            </p>
            <p className="text-2xl font-medium text-gray-900 mt-1">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {/* Randevular */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">
          Randevular
          <span className="text-gray-400 font-normal text-sm ml-2">
            ({stats?.today_appointments?.length || 0} kayıt)
          </span>
        </h2>

        {stats?.today_appointments?.length === 0 ? (
          <p className="text-gray-400 text-sm">Henüz randevu eklenmemiş.</p>
        ) : (
          <div className="space-y-3">
            {stats?.today_appointments?.map(appt => (
              <div
                key={appt.id}
                className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="w-16 text-center">
                  <p className="text-sm font-medium text-gray-900">{appt.time}</p>
                  <p className="text-xs text-gray-400">{appt.date}</p>
                </div>
                <div className="w-0.5 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{appt.type}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[appt.status] || 'bg-gray-100 text-gray-500'}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}