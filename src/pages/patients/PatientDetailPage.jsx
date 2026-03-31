import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, FileText, Hash, Phone, User, Clock, CheckCircle, XCircle } from 'lucide-react'
import patientService from '../../services/patientService'
import appointmentService from '../../services/appointmentService'
import noteService from '../../services/noteService'
import { toast } from 'sonner'

const statusStyle = {
  'Onaylı':    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Beklemede': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'İptal':     'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

const avatarColors = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
]

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatDateTR(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function parseTags(tagsStr) {
  if (!tagsStr) return []
  return tagsStr.split(',').map(t => t.trim()).filter(Boolean)
}

export default function PatientDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [patient, setPatient]         = useState(null)
  const [summary, setSummary]         = useState(null)
  const [appointments, setAppointments] = useState([])
  const [notes, setNotes]             = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [p, s, allAppts, allNotes] = await Promise.all([
        patientService.getById(id),
        patientService.getSummary(id),
        appointmentService.getAll(),
        noteService.getByPatient(parseInt(id)),
      ])
      setPatient(p)
      setSummary(s)
      // Sadece bu danışanın randevularını filtrele
      setAppointments(allAppts.filter(a => a.patient_id === parseInt(id)))
      setNotes(allNotes)
    } catch {
      toast.error('Danışan bilgileri yüklenemedi')
      navigate('/danisanlar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="animate-pulse h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  )

  if (!patient) return null

  const tags = parseTags(patient.tags)

  // Randevuları tarihe göre sırala
  const sortedAppts = [...appointments].sort((a, b) =>
    `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
  )

  return (
    <div className="p-8 space-y-6">

      {/* Geri butonu */}
      <button
        onClick={() => navigate('/danisanlar')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft size={16} />
        Danışanlara Dön
      </button>

      {/* Profil kartı */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
      >
        <div className="flex items-start gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${avatarColors[0]}`}>
            {getInitials(patient.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                patient.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                patient.status === 'Yeni'  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>{patient.status}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
              {patient.age   && <span className="flex items-center gap-1"><User size={13} />{patient.age} yaş</span>}
              {patient.phone && <span className="flex items-center gap-1"><Phone size={13} />{patient.phone}</span>}
              <span className="flex items-center gap-1"><Calendar size={13} />Kayıt: {formatDateTR(patient.created_at)}</span>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {tags.map(tag => (
                  <span key={tag} className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* İstatistik kartları */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Toplam Seans',    value: summary.total_sessions,     icon: <Hash size={16} />,        color: 'text-blue-500' },
            { label: 'Tamamlanan',      value: summary.completed_sessions,  icon: <CheckCircle size={16} />, color: 'text-emerald-500' },
            { label: 'İptal',           value: summary.cancelled_sessions,  icon: <XCircle size={16} />,    color: 'text-red-400' },
            { label: 'Toplam Not',      value: notes.length,                icon: <FileText size={16} />,   color: 'text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
              <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Son + sonraki randevu */}
      {summary && (summary.next_appointment || summary.last_appointment) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-4"
        >
          {summary.next_appointment && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-4">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                <Clock size={12} /> Sonraki Randevu
              </p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {formatDateTR(summary.next_appointment_date)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {summary.next_appointment?.split(' ')[1]}
              </p>
            </div>
          )}
          {summary.last_appointment && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1.5">
                <Clock size={12} /> Son Randevu
              </p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {formatDateTR(summary.last_appointment_date)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {summary.last_appointment?.split(' ')[1]}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Alt panel: Seans geçmişi + Son notlar */}
      <div className="grid grid-cols-2 gap-6">

        {/* Seans geçmişi */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={14} className="text-emerald-500" />
              Seans Geçmişi
            </h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {sortedAppts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Henüz randevu yok</p>
              </div>
            ) : (
              sortedAppts.map(appt => (
                <div key={appt.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {formatDateTR(appt.date)} · {appt.time}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                      {appt.type} · {appt.duration} dk
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusStyle[appt.status] || 'bg-gray-100 text-gray-500'}`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Son notlar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={14} className="text-purple-500" />
              Son Notlar
            </h2>
            <button
              onClick={() => navigate('/notlar')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Henüz not yok</p>
              </div>
            ) : (
              notes.slice(0, 5).map(note => (
                <div key={note.id} className="px-5 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    {note.session_number && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg">
                        #{note.session_number}. Seans
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {formatDateTR(note.created_at)}
                    </span>
                  </div>
                  {note.title && (
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-0.5">{note.title}</p>
                  )}
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}