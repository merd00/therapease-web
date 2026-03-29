import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import statsService from "../../services/statsService";
import noteService from "../../services/noteService";
import patientService from "../../services/patientService";
import appointmentService from "../../services/appointmentService";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";

const statusStyle = {
  Onaylı:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Beklemede: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  İptal: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const avatarColors = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="tabular-nums">
      {time.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-4" />
      <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, bgColor, index, to }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => navigate(to)}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">
          {label}
        </p>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} group-hover:scale-110 transition-transform`}
        >
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className="text-4xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </motion.div>
  );
}

function WeeklyChart({ data, weekOffset, onPrev, onNext, onReset }) {
  const [tooltip, setTooltip] = useState(null)
  const max = Math.max(...data.map(d => d.count), 1)

  const weekLabel = weekOffset === 0
    ? 'Bu hafta'
    : weekOffset === -1
    ? 'Geçen hafta'
    : weekOffset === 1
    ? 'Gelecek hafta'
    : weekOffset < 0
    ? `${Math.abs(weekOffset)} hafta önce`
    : `${weekOffset} hafta sonra`

  return (
    <div className="space-y-5">

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">Onaylı</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">Beklemede</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">İptal</span>
        </div>
      </div>

      {/* Hafta navigasyonu */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-all"
        >
          ← Önceki
        </button>

        <div className="flex items-center gap-2">
          {weekOffset !== 0 && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-2 rounded-xl transition-all"
            >
              ↩ Bu haftaya dön
            </button>
          )}
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
            {weekLabel}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={false}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-all"
        >
          Sonraki →
        </button>
      </div>

      {/* Grafik */}
      <div className="flex items-end gap-3 h-28">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2 relative"
            onMouseEnter={() => setTooltip(i)}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Tooltip */}
            {tooltip === i && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap z-10 shadow-lg space-y-0.5"
              >
                <p className="text-emerald-400 dark:text-emerald-600">{d.onaylı} onaylı</p>
                <p className="text-amber-400 dark:text-amber-600">{d.beklemede} beklemede</p>
                <p className="text-red-400 dark:text-red-500">{d.iptal} iptal</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-gray-900 dark:border-t-white" />
              </motion.div>
            )}

            {/* Bar — 3'e bölünmüş stacked bar */}
            <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '88px' }}>
              {/* Onaylı */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.onaylı / max) * 88, d.onaylı > 0 ? 6 : 2)}px` }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                className={`flex-1 rounded-xl cursor-pointer transition-all ${
                  d.onaylı > 0
                    ? 'bg-emerald-400 hover:bg-emerald-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              />
              {/* Beklemede */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.beklemede / max) * 88, d.beklemede > 0 ? 6 : 2)}px` }}
                transition={{ delay: i * 0.05 + 0.05, duration: 0.5, ease: 'easeOut' }}
                className={`flex-1 rounded-xl cursor-pointer transition-all ${
                  d.beklemede > 0
                    ? 'bg-amber-400 hover:bg-amber-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              />
              {/* İptal */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.iptal / max) * 88, d.iptal > 0 ? 6 : 2)}px` }}
                transition={{ delay: i * 0.05 + 0.1, duration: 0.5, ease: 'easeOut' }}
                className={`flex-1 rounded-xl cursor-pointer transition-all ${
                  d.iptal > 0
                    ? 'bg-red-400 hover:bg-red-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              />
            </div>

            {/* Gün adı */}
            <span className={`text-xs font-bold transition-colors ${
              tooltip === i
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickModal({ title, onClose, children }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 w-full max-w-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  const [showApptModal, setShowApptModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const [newAppt, setNewAppt] = useState({
    patient_id: "",
    date: "",
    time: "",
    type: "Bireysel terapi",
    duration: 50,
    status: "Beklemede",
  });
  const [savingAppt, setSavingAppt] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    phone: "",
    status: "Aktif",
  });
  const [savingPatient, setSavingPatient] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchAll(weekOffset);
  }, [weekOffset]);

  const fetchAll = async (offset = 0) => {
    try {
      setLoading(true);
      const [statsData, patientsData] = await Promise.all([
        statsService.getStats(offset),
        patientService.getAll(),
      ]);
      setStats(statsData);
      setRecentPatients(statsData.recent_patients || []);
      setAllPatients(patientsData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Günaydın";
    if (hour >= 12 && hour < 18) return "İyi günler";
    if (hour >= 18 && hour < 24) return "İyi akşamlar";
    return "İyi geceler";
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "?";

  const handleSaveNote = async () => {
    if (!note.trim() || !selectedPatientId) return;
    try {
      setSavingNote(true);
      await noteService.create({
        patient_id: parseInt(selectedPatientId),
        content: note.trim(),
      });
      setNote("");
      setSelectedPatientId("");
      toast.success("Not eklendi");
    } catch (err) {
      toast.error("Not eklenemedi");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateAppt = async () => {
    if (!newAppt.patient_id || !newAppt.date || !newAppt.time) {
      toast.warning("Danışan, tarih ve saat zorunludur");
      return;
    }
    try {
      setSavingAppt(true);
      await appointmentService.create({
        ...newAppt,
        patient_id: parseInt(newAppt.patient_id),
        duration: parseInt(newAppt.duration),
      });
      setNewAppt({
        patient_id: "",
        date: "",
        time: "",
        type: "Bireysel terapi",
        duration: 50,
        status: "Beklemede",
      });
      setShowApptModal(false);
      toast.success("Randevu eklendi");
      fetchAll(weekOffset);
    } catch (err) {
      toast.error("Randevu eklenemedi");
    } finally {
      setSavingAppt(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.name.trim()) {
      toast.warning("Danışan adı zorunludur");
      return;
    }
    try {
      setSavingPatient(true);
      await patientService.create({
        ...newPatient,
        age: newPatient.age ? parseInt(newPatient.age) : null,
      });
      setNewPatient({ name: "", age: "", phone: "", status: "Aktif" });
      setShowPatientModal(false);
      toast.success("Danışan eklendi");
      fetchAll(weekOffset);
    } catch (err) {
      toast.error("Danışan eklenemedi");
    } finally {
      setSavingPatient(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600";

  const metrics = [
    {
      label: "Bugünkü randevu",
      value: stats?.today_count ?? 0,
      icon: Calendar,
      bgColor: "bg-purple-50 dark:bg-purple-950",
      color: "text-purple-600 dark:text-purple-400",
      to: "/randevular",
    },
    {
      label: "Aktif danışan",
      value: stats?.active_patients ?? 0,
      icon: TrendingUp,
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      color: "text-emerald-600 dark:text-emerald-400",
      to: "/hastalar",
    },
    {
      label: "Toplam seans",
      value: stats?.total_appointments ?? 0,
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-950",
      color: "text-blue-600 dark:text-blue-400",
      to: "/randevular",
    },
    {
      label: "Toplam not",
      value: stats?.total_notes ?? 0,
      icon: FileText,
      bgColor: "bg-amber-50 dark:bg-amber-950",
      color: "text-amber-600 dark:text-amber-400",
      to: "/notlar",
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Yeni Randevu Modal */}
      {showApptModal && (
        <QuickModal
          title="Yeni Randevu"
          onClose={() => setShowApptModal(false)}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Danışan *
              </label>
              <select
                value={newAppt.patient_id}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, patient_id: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Danışan seçin...</option>
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Tarih *
              </label>
              <input
                type="date"
                value={newAppt.date}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, date: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Saat *
              </label>
              <input
                type="time"
                value={newAppt.time}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, time: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Tür
              </label>
              <select
                value={newAppt.type}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, type: e.target.value })
                }
                className={inputClass}
              >
                <option>Bireysel terapi</option>
                <option>Çift terapisi</option>
                <option>İlk görüşme</option>
                <option>Aile terapisi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Süre (dk)
              </label>
              <input
                type="number"
                value={newAppt.duration}
                onChange={(e) =>
                  setNewAppt({ ...newAppt, duration: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <button
            onClick={handleCreateAppt}
            disabled={savingAppt}
            className="w-full mt-4 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {savingAppt ? "Kaydediliyor..." : "Randevu Ekle"}
          </button>
        </QuickModal>
      )}

      {/* Yeni Danışan Modal */}
      {showPatientModal && (
        <QuickModal
          title="Yeni Danışan"
          onClose={() => setShowPatientModal(false)}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Ad Soyad *
              </label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, name: e.target.value })
                }
                placeholder="Ayşe Kaya"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Yaş
              </label>
              <input
                type="number"
                value={newPatient.age}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, age: e.target.value })
                }
                placeholder="28"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Telefon
              </label>
              <input
                type="text"
                value={newPatient.phone}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, phone: e.target.value })
                }
                placeholder="0532 111 22 33"
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Durum
              </label>
              <select
                value={newPatient.status}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, status: e.target.value })
                }
                className={inputClass}
              >
                <option>Aktif</option>
                <option>Yeni</option>
                <option>Pasif</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreatePatient}
            disabled={savingPatient}
            className="w-full mt-4 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {savingPatient ? "Kaydediliyor..." : "Danışan Ekle"}
          </button>
        </QuickModal>
      )}

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Danışman"} 👋
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
              {new Date().toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-300">
              <Clock size={14} className="text-emerald-500" />
              <LiveClock />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowPatientModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Users size={15} />
            Yeni danışan
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            onClick={() => setShowApptModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Yeni randevu
          </motion.button>
        </div>
      </motion.div>

      {/* Metrik kartlar */}
      <div className="grid grid-cols-4 gap-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          : metrics.map((metric, i) => (
              <MetricCard key={metric.label} {...metric} index={i} />
            ))}
      </div>

      {/* Alt grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sol kolon */}
        <div className="col-span-2 space-y-6">
          {/* Yaklaşan randevular */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Yaklaşan Randevular
                </h2>
              </div>
              <button
                onClick={() => navigate("/randevular")}
                className="flex items-center gap-1 text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Tümü <ChevronRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-4 py-3">
                      <div className="w-14 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                      <div className="flex-1 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                      <div className="w-24 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                  ))}
              </div>
            ) : !stats?.today_appointments?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
                  <Calendar
                    size={24}
                    className="text-gray-300 dark:text-gray-600"
                  />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-base font-semibold">
                  Randevu bulunamadı
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Henüz randevu eklenmemiş
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.today_appointments.slice(0, 5).map((appt, index) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.06 }}
                    className="flex items-center gap-4 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-2 transition-colors"
                  >
                    <div className="w-16 text-center shrink-0">
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {appt.time}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-300">
                        {appt.date}
                      </p>
                    </div>
                    <div className="w-0.5 h-10 bg-gray-100 dark:bg-gray-700 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {appt.patient_name}
                      </p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        {appt.type} · {appt.duration} dk
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-bold shrink-0 ${statusStyle[appt.status] || "bg-gray-100 text-gray-500"}`}
                    >
                      {appt.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Haftalık grafik */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Haftalık Seans
              </h2>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                {stats?.weekly_sessions?.reduce((a, b) => a + b.count, 0) || 0}{" "}
                seans
              </span>
            </div>
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ) : (
              <WeeklyChart
                data={stats?.weekly_sessions || []}
                weekOffset={weekOffset}
                onPrev={() => setWeekOffset((w) => w - 1)}
                onNext={() => setWeekOffset((w) => w + 1)}
                onReset={() => setWeekOffset(0)}
              />
            )}
          </motion.div>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-6">
          {/* Son danışanlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Son Danışanlar
              </h2>
              <button
                onClick={() => navigate("/hastalar")}
                className="flex items-center gap-1 text-sm text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Tümü <ChevronRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex gap-3 items-center"
                    >
                      <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full" />
                      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  ))}
              </div>
            ) : recentPatients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-300 text-sm text-center py-4">
                Danışan bulunamadı
              </p>
            ) : (
              <div className="space-y-2">
                {recentPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + index * 0.05 }}
                    onClick={() => navigate("/hastalar")}
                    className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[index % avatarColors.length]}`}
                    >
                      {getInitials(patient.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {patient.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ${statusStyle[patient.status] || "bg-gray-100 text-gray-500"}`}
                    >
                      {patient.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Hızlı not */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Hızlı Not
              </h2>
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 mb-3"
            >
              <option value="">Danışan seçin...</option>
              {allPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bir not yaz..."
              rows={4}
              className="w-full text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none outline-none leading-relaxed bg-transparent"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                {note.length} karakter
              </p>
              <button
                onClick={handleSaveNote}
                disabled={savingNote || !note.trim() || !selectedPatientId}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
              >
                <Plus size={12} />
                {savingNote ? "Kaydediliyor..." : "Notlara ekle"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
