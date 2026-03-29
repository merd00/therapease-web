import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Lock, User } from 'lucide-react'
import userService from '../../services/userService'
import useAuthStore from '../../store/authStore'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [user, setUser]                   = useState(null)
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar]   = useState(false)
  const fileInputRef = useRef(null)
  const updateUser = useAuthStore((state) => state.updateUser)

  const [profile, setProfile] = useState({
    name: '',
    title: '',
    clinic_name: '',
  })

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await userService.getMe()
      setUser(data)
      setProfile({
        name: data.name || '',
        title: data.title || '',
        clinic_name: data.clinic_name || '',
      })
    } catch (err) {
      toast.error('Profil bilgileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) {
      toast.warning('Ad soyad zorunludur')
      return
    }
    try {
      setSaving(true)
      const updated = await userService.updateProfile(profile)
      setUser(updated)
      updateUser(updated)
      toast.success('Profil güncellendi')
    } catch (err) {
      toast.error('Profil güncellenemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.current_password || !passwords.new_password) {
      toast.warning('Tüm şifre alanları zorunludur')
      return
    }
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }
    if (passwords.new_password.length < 6) {
      toast.warning('Yeni şifre en az 6 karakter olmalı')
      return
    }
    try {
      setChangingPassword(true)
      await userService.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      })
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      toast.success('Şifre başarıyla değiştirildi')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Şifre değiştirilemedi')
    } finally {
      setChangingPassword(false)
    }
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
    } catch (err) {
      toast.error('Fotoğraf yüklenemedi')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || '?'

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"

  if (loading) return (
    <div className="p-8 max-w-2xl space-y-6">
      <div className="animate-pulse bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 space-y-6 max-w-2xl">

      {/* Başlık */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">Hesap bilgilerinizi yönetin</p>
      </motion.div>

      {/* Avatar + isim kartı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            {user?.avatar_url ? (
              <img
                src={`http://localhost:8000${user.avatar_url}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-3xl font-black">
                {getInitials(user?.name)}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md"
            >
              {uploadingAvatar ? (
                <span className="text-xs">...</span>
              ) : (
                <Camera size={14} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-300 mt-0.5">
              {user?.title || 'Unvan eklenmemiş'}
            </p>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-0.5">
              {user?.clinic_name || 'Klinik adı eklenmemiş'}
            </p>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Kişisel bilgiler */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kişisel Bilgiler</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Ad Soyad *</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">Email adresi değiştirilemez</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Unvan</label>
          <input
            type="text"
            value={profile.title}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            placeholder="Uzman Psikolog"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Klinik Adı</label>
          <input
            type="text"
            value={profile.clinic_name}
            onChange={(e) => setProfile({ ...profile, clinic_name: e.target.value })}
            placeholder="Umut Psikoloji Merkezi"
            className={inputClass}
          />
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </motion.div>

      {/* Şifre değiştirme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock size={16} className="text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Şifre Değiştir</h2>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Mevcut Şifre</label>
          <input
            type="password"
            value={passwords.current_password}
            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yeni Şifre</label>
          <input
            type="password"
            value={passwords.new_password}
            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Yeni Şifre Tekrar</label>
          <input
            type="password"
            value={passwords.confirm_password}
            onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <Lock size={14} />
          {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
        </button>
      </motion.div>

    </div>
  )
}