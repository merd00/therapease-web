import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, Lock, User, Building, Calendar, Star,
  TrendingUp, FileText, CheckCircle, XCircle,
  Clock, Banknote, Award, ChevronDown, ChevronUp
} from 'lucide-react'
import userService from '../../services/userService'
import useAuthStore from '../../store/authStore'
import { toast } from 'sonner'

const SPECIALIZATION_TAGS = [
  'Anksiyete', 'Depresyon', 'Travma', 'Çift Terapisi',
  'Aile Terapisi', 'Stres', 'Fobia', 'OKB', 'Yas',
  'Bağımlılık', 'Öfke Kontrolü', 'Çocuk & Ergen',
]

function parseTags(str) {
  if (!str) return []
  return str.split(',').map(t => t.trim()).filter(Boolean)
}

function formatMoney(amount) {
  return new Intl.NumberFormat('tr-TR').format(amount) + ' ₺'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const inputClass = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"

export default function ProfilePage() {
  const fileInputRef = useRef(null)
  const updateUser   = useAuthStore(s => s.updateUser)

  const [user, setUser]     = useState(null)
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Form state'leri
  const [profile, setProfile] = useState({
    name: '', title: '', clinic_name: '',
    bio: '', work_hours: '', session_fee: '',
  })
  const [specializations, setSpecializations] = useState([])
  const [saving, setSaving] = useState(false)

  // Şifre
  const [passwords, setPasswords] = useState({
    current_password: '', new_password: '', confirm_password: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords]       = useState(false)

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [userData, statsData] = await Promise.all([
        userService.getMe(),
        userService.getStats(),
      ])
      setUser(userData)
      setStats(statsData)
      setProfile({
        name:        userData.name        || '',
        title:       userData.title       || '',
        clinic_name: userData.clinic_name || '',
        bio:         userData.bio         || '',
        work_hours:  userData.work_hours  || '',
        session_fee: userData.session_fee || '',
      })
      setSpecializations(parseTags(userData.specializations))
    } catch { toast.error('Profil yüklenemedi') }
    finally { setLoading(false) }
  }

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) { toast.warning('Ad soyad zorunludur'); return }
    try {
      setSaving(true)
      const updated = await userService.updateProfile({
        ...profile,
        session_fee:     profile.session_fee ? parseInt(profile.session_fee) : null,
        specializations: specializations.join(',') || null,
      })
      setUser(updated)
      updateUser(updated)
      toast.success('Profil güncellendi')
    } catch { toast.error('Profil güncellenemedi') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (!passwords.current_password || !passwords.new_password) {
      toast.warning('Tüm şifre alanları zorunludur'); return
    }
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Yeni şifreler eşleşmiyor'); return
    }
    if (passwords.new_password.length < 6) {
      toast.warning('Şifre en az 6 karakter olmalı'); return
    }
    try {
      setChangingPassword(true)
      await userService.changePassword({
        current_password: passwords.current_password,
        new_password:     passwords.new_password,
      })
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Şifre başarıyla değiştirildi')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Şifre değiştirilemedi')
    } finally { setChangingPassword(false) }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingAvatar(true)
      const updated = await userService.uploadAvatar(file)
      setUser(updated)
      updateUser(updated)
      toast.success('Profil fotoğrafı güncellendi')
    } catch { toast.error('Fotoğraf yüklenemedi') }
    finally { setUploadingAvatar(false) }
  }

  const toggleSpec = (tag) => {
    setSpecializations(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || '?'

  if (loading) return (
    <div className="p-8 max-w-5xl space-y-6">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 h-32" />
      ))}
    </div>
  )

  return (
    <div className="p-8 max-w-5xl space-y-6">

      {/* Başlık */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">Hesap ve klinik bilgilerinizi yönetin</p>
      </motion.div>

      {/* ── Üst: Avatar + Özet + İstatistikler ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
      >
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user?.avatar_url ? (
              <img
                src={userService.getAvatarUrl(user.avatar_url)}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-3xl font-black">
                {getInitials(user?.name)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md"
            >
              {uploadingAvatar ? <span className="text-xs animate-spin">↻</span> : <Camera size={14} />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* Özet bilgiler */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                {user?.role || 'Psikolog'}
              </span>
            </div>
            {user?.title && <p className="text-sm font-semibold text-gray-500 dark:text-gray-300">{user.title}</p>}
            {user?.clinic_name && (
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                <Building size={12} /> {user.clinic_name}
              </p>
            )}
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-0.5">{user?.email}</p>
            {user?.created_at && (
              <p className="text-xs font-medium text-gray-300 dark:text-gray-600 mt-1 flex items-center gap-1">
                <Calendar size={11} /> Kayıt: {formatDate(user.created_at)}
              </p>
            )}
            {/* Uzmanlık etiketleri */}
            {specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {specializations.map(s => (
                  <span key={s} className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* İstatistik kartları */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 border-t border-gray-50 dark:border-gray-800">
            {[
              { label: 'Toplam Danışan',  value: stats.total_patients,      icon: <User size={15} />,        color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Toplam Seans',    value: stats.total_appointments,   icon: <Calendar size={15} />,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Toplam Not',      value: stats.total_notes,          icon: <FileText size={15} />,    color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Tamamlanma',      value: `%${stats.completion_rate}`, icon: <CheckCircle size={15} />, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-xl p-4`}>
                <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── İki kolon: Sol = Profil formu, Sağ = Gelir + Bu ay ── */}
      <div className="grid grid-cols-3 gap-6">

        {/* Sol: Profil formu (2/3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <User size={15} className="text-gray-400" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Kişisel Bilgiler</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Ad Soyad *</label>
              <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" value={user?.email} disabled className="w-full border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Unvan</label>
              <input type="text" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} placeholder="Uzman Psikolog" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Klinik Adı</label>
              <input type="text" value={profile.clinic_name} onChange={e => setProfile({ ...profile, clinic_name: e.target.value })} placeholder="Umut Psikoloji Merkezi" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Biyografi <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
              </label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Kendiniz hakkında kısa bir yazı..."
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Clock size={13} /> Çalışma Saatleri
              </label>
              <input type="text" value={profile.work_hours} onChange={e => setProfile({ ...profile, work_hours: e.target.value })} placeholder="Pzt-Cum 09:00-18:00" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Banknote size={13} /> Seans Ücreti (₺)
              </label>
              <input type="number" value={profile.session_fee} onChange={e => setProfile({ ...profile, session_fee: e.target.value })} placeholder="500" className={inputClass} />
            </div>
          </div>

          {/* Uzmanlık etiketleri */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Star size={13} /> Uzmanlık Alanları
            </label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATION_TAGS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleSpec(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    specializations.includes(tag)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >{tag}</button>
              ))}
            </div>
          </div>

          <button onClick={handleUpdateProfile} disabled={saving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </motion.div>

        {/* Sağ: Gelir + Bu ay (1/3) */}
        <div className="space-y-4">

          {/* Bu ay */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Bu Ay</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Toplam Seans</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.this_month_total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Tamamlanan</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.this_month_completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">En çok yapılan</span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 text-right max-w-24 truncate">{stats.most_common_type || '-'}</span>
                </div>

                {/* Tamamlanma oranı bar */}
                <div className="pt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-400">Tamamlanma</span>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">%{stats.completion_rate}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.completion_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Gelir hesabı */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <Banknote size={15} />
                <h3 className="text-sm font-bold">Gelir Tahmini</h3>
              </div>
              {stats.session_fee > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs opacity-75 font-medium">Bu Ay</p>
                    <p className="text-2xl font-black">{formatMoney(stats.this_month_income)}</p>
                    <p className="text-xs opacity-75">{stats.this_month_completed} seans × {formatMoney(stats.session_fee)}</p>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <p className="text-xs opacity-75 font-medium">Toplam (Tüm Zamanlar)</p>
                    <p className="text-lg font-bold">{formatMoney(stats.total_income)}</p>
                    <p className="text-xs opacity-75">{stats.completed_appointments} seans × {formatMoney(stats.session_fee)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm opacity-75 font-medium">Gelir hesabı için</p>
                  <p className="text-sm font-bold">seans ücreti girin</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Hesap bilgileri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award size={15} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hesap Bilgileri</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-medium">Rol</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{user?.role || 'Psikolog'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-medium">Kayıt Tarihi</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatDate(user?.created_at)}</span>
              </div>
              {profile.work_hours && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400 font-medium">Çalışma</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{profile.work_hours}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Şifre değiştirme — açılır kapanır */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-gray-400" />
            <span className="text-base font-bold text-gray-900 dark:text-white">Şifre Değiştir</span>
          </div>
          {showPasswords ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {showPasswords && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4 border-t border-gray-50 dark:border-gray-800 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Mevcut Şifre</label>
                  <input type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} placeholder="••••••••" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yeni Şifre</label>
                  <input type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="••••••••" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yeni Şifre Tekrar</label>
                  <input type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} placeholder="••••••••" className={inputClass} />
                </div>
                <button onClick={handleChangePassword} disabled={changingPassword}
                  className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Lock size={14} />
                  {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  )
}
