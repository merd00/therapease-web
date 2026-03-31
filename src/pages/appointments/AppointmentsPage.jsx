import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Trash2,
  Search,
  X,
  Pencil,
  Check,
  Clock,
  User,
} from "lucide-react";
import appointmentService from "../../services/appointmentService";
import patientService from "../../services/patientService";
import { toast } from "sonner";

const avatarColors = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
];

const STATUS_FILTERS = ["Tümü", "Onaylı", "Beklemede", "İptal"];

const statusStyle = {
  Onaylı:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Beklemede: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  İptal: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const APPOINTMENT_TYPES = [
  "Bireysel terapi",
  "Çift terapisi",
  "İlk görüşme",
  "Aile terapisi",
];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDateTR(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtreler
  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'

  // Yeni randevu formu
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patient_id: "",
    date: todayStr(),
    time: "",
    type: "Bireysel terapi",
    duration: 50,
    status: "Beklemede",
  });

  // Combobox
  const [patientQuery, setPatientQuery] = useState("");
  const [showPatientDrop, setShowPatientDrop] = useState(false);

  // Düzenleme modal
  const [editAppt, setEditAppt] = useState(null);
  const [editData, setEditData] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  // Düzenleme combobox
  const [editPatientQuery, setEditPatientQuery] = useState("");
  const [showEditPatientDrop, setShowEditPatientDrop] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Düzenleme modalı açılınca doldur
  useEffect(() => {
    if (editAppt) {
      setEditData({
        patient_id: String(editAppt.patient_id),
        date: editAppt.date,
        time: editAppt.time,
        type: editAppt.type,
        duration: editAppt.duration,
        status: editAppt.status,
      });
      setEditPatientQuery(editAppt.patient_name || "");
    }
  }, [editAppt]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appts, pats] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
      ]);
      setAppointments(appts);
      setPatients(pats);
    } catch {
      toast.error("Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Danışan seç (yeni form)
  const selectPatient = (p) => {
    setNewAppt((prev) => ({ ...prev, patient_id: String(p.id) }));
    setPatientQuery(p.name);
    setShowPatientDrop(false);
  };

  // Danışan seç (düzenleme)
  const selectEditPatient = (p) => {
    setEditData((prev) => ({ ...prev, patient_id: String(p.id) }));
    setEditPatientQuery(p.name);
    setShowEditPatientDrop(false);
  };

  // Combobox filtresi
  const filteredPatientOptions = (query) =>
    patients.filter((p) => {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        String(p.age || "").includes(q)
      );
    });

  const handleCreate = async () => {
    if (!newAppt.patient_id || !newAppt.date || !newAppt.time) {
      toast.warning("Danışan, tarih ve saat zorunludur");
      return;
    }
    try {
      setSaving(true);
      const created = await appointmentService.create({
        ...newAppt,
        patient_id: parseInt(newAppt.patient_id),
        duration: parseInt(newAppt.duration),
      });
      setAppointments((prev) => [created, ...prev]);
      setNewAppt({
        patient_id: "",
        date: todayStr(),
        time: "",
        type: "Bireysel terapi",
        duration: 50,
        status: "Beklemede",
      });
      setPatientQuery("");
      setShowForm(false);
      toast.success("Randevu başarıyla eklendi");
    } catch (err) {
      // 409 = çakışma
      const msg = err?.response?.data?.detail || "Randevu eklenemedi";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editData.patient_id || !editData.date || !editData.time) {
      toast.warning("Danışan, tarih ve saat zorunludur");
      return;
    }
    try {
      setEditSaving(true);
      const updated = await appointmentService.update(editAppt.id, {
        ...editData,
        patient_id: parseInt(editData.patient_id),
        duration: parseInt(editData.duration),
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      setEditAppt(null);
      toast.success("Randevu güncellendi");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Randevu güncellenemedi";
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu randevuyu silmek istediğinize emin misiniz?"))
      return;
    try {
      await appointmentService.delete(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Randevu silindi");
    } catch {
      toast.error("Randevu silinemedi");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await appointmentService.update(id, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      );
      toast.success("Durum güncellendi");
    } catch {
      toast.error("Durum güncellenemedi");
    }
  };

  const hasActiveFilter = searchQuery || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Filtrelenmiş + sıralanmış randevular
  const filtered = useMemo(() => {
    let list = appointments.filter((a) => {
      // Durum filtresi
      if (activeFilter !== "Tümü" && a.status !== activeFilter) return false;
      // Danışan adı arama
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !a.patient_name?.toLowerCase().includes(q) &&
          !a.type?.toLowerCase().includes(q)
        )
          return false;
      }
      // Tarih aralığı
      if (filterDateFrom && a.date < filterDateFrom) return false;
      if (filterDateTo && a.date > filterDateTo) return false;
      return true;
    });

    // Tarihe + saate göre sırala
    list.sort((a, b) => {
      const dateA = `${a.date} ${a.time}`;
      const dateB = `${b.date} ${b.time}`;
      return sortOrder === "asc"
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);
    });

    return list;
  }, [
    appointments,
    activeFilter,
    searchQuery,
    filterDateFrom,
    filterDateTo,
    sortOrder,
  ]);

  // Combobox input — paylaşılan component
  const PatientCombobox = ({
    query,
    setQuery,
    onSelect,
    showDrop,
    setShowDrop,
    selectedId,
  }) => (
    <div className="relative">
      <div className="relative">
        <User
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="İsim yazarak ara..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDrop(true);
          }}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)}
          className={`w-full border rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 ${
            selectedId
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
              : "border-gray-200 dark:border-gray-700 focus:border-emerald-400"
          }`}
        />
        {selectedId && (
          <Check
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
          />
        )}
      </div>
      {showDrop && (
        <div className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {filteredPatientOptions(query).length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center font-medium">
              Danışan bulunamadı
            </div>
          ) : (
            filteredPatientOptions(query).map((p, i) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => onSelect(p)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-50 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {[p.age && `${p.age} yaş`, p.phone]
                        .filter(Boolean)
                        .join(" · ") || "Bilgi yok"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                    p.status === "Aktif"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {p.status}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  const inputClass =
    "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600";

  if (loading)
    return (
      <div className="p-8 space-y-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex gap-4 items-center bg-white dark:bg-gray-900 rounded-2xl p-5"
            >
              <div className="w-16 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              <div className="flex-1 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              <div className="w-24 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
          ))}
      </div>
    );

  return (
    <div className="p-8 space-y-6">
      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Randevular
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">
            {filtered.length === appointments.length
              ? `${appointments.length} randevu`
              : `${filtered.length} / ${appointments.length} randevu gösteriliyor`}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setPatientQuery("");
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showForm ? "İptal" : "Yeni Randevu"}
        </button>
      </motion.div>

      {/* Yeni randevu formu */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Yeni randevu ekle
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Danışan combobox */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Danışan *
                </label>
                <PatientCombobox
                  query={patientQuery}
                  setQuery={setPatientQuery}
                  onSelect={selectPatient}
                  showDrop={showPatientDrop}
                  setShowDrop={setShowPatientDrop}
                  selectedId={newAppt.patient_id}
                />
              </div>

              {/* Tür */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Tür *
                </label>
                <select
                  value={newAppt.type}
                  onChange={(e) =>
                    setNewAppt({ ...newAppt, type: e.target.value })
                  }
                  className={inputClass}
                >
                  {APPOINTMENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Tarih */}
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

              {/* Saat */}
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

              {/* Süre */}
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

              {/* Durum */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Durum
                </label>
                <select
                  value={newAppt.status}
                  onChange={(e) =>
                    setNewAppt({ ...newAppt, status: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>Beklemede</option>
                  <option>Onaylı</option>
                  <option>İptal</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Plus size={15} />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtre satırı */}
      <div className="space-y-3">
        {/* Durum filtreleri */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === f
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                  : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {f}
            </button>
          ))}

          {/* Sıralama toggle */}
          <button
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Clock size={13} />
            {sortOrder === "desc" ? "En yeni önce" : "En eski önce"}
          </button>
        </div>

        {/* Arama + tarih filtresi */}
        <div className="flex gap-2 flex-wrap">
          {/* Danışan / tür arama */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Danışan veya randevu türü ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Tarih başlangıç */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2">
            <Calendar size={13} className="text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none"
            />
          </div>

          {/* Tarih bitiş */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2">
            <span className="text-xs text-gray-400 font-medium">–</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none"
            />
          </div>

          {/* Filtreleri temizle */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X size={12} />
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Randevu listesi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
              <Calendar
                size={24}
                className="text-gray-300 dark:text-gray-600"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">
              {appointments.length === 0
                ? "Henüz randevu eklenmemiş"
                : "Eşleşen randevu bulunamadı"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {appointments.length === 0
                ? "Yeni randevu ekle butonuna tıklayın"
                : "Farklı bir filtre deneyin"}
            </p>
          </div>
        ) : (
          filtered.map((appt, index) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-4 py-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl px-3 group"
            >
              {/* Tarih + saat */}
              <div className="w-20 text-center shrink-0">
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {appt.time}
                </p>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">
                  {new Date(appt.date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              <div className="w-0.5 h-10 bg-gray-100 dark:bg-gray-700 rounded-full shrink-0" />

              {/* Avatar + isim */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[index % avatarColors.length]}`}
                >
                  {getInitials(appt.patient_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {appt.patient_name}
                  </p>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {appt.type} · {appt.duration} dk
                    {appt.patient_age && (
                      <span className="ml-1">· {appt.patient_age} yaş</span>
                    )}
                    {appt.patient_phone && (
                      <span className="ml-1">· {appt.patient_phone}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Durum dropdown */}
              <select
                value={appt.status}
                onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold border-0 outline-none cursor-pointer shrink-0 ${statusStyle[appt.status] || "bg-gray-100 text-gray-500"}`}
              >
                <option>Beklemede</option>
                <option>Onaylı</option>
                <option>İptal</option>
              </select>

              {/* Düzenle + Sil */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setEditAppt(appt)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-white hover:bg-emerald-500 px-2 py-1.5 rounded-lg transition-all"
                >
                  <Pencil size={11} />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(appt.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-2 py-1.5 rounded-lg transition-all"
                >
                  <Trash2 size={11} />
                  Sil
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Düzenleme Modal */}
      <AnimatePresence>
        {editAppt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setEditAppt(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              {/* Modal başlık */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Randevuyu Düzenle
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                    {editAppt.patient_name} · {formatDateTR(editAppt.date)}
                  </p>
                </div>
                <button
                  onClick={() => setEditAppt(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Danışan combobox */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Danışan *
                  </label>
                  <PatientCombobox
                    query={editPatientQuery}
                    setQuery={setEditPatientQuery}
                    onSelect={selectEditPatient}
                    showDrop={showEditPatientDrop}
                    setShowDrop={setShowEditPatientDrop}
                    selectedId={editData.patient_id}
                  />
                </div>

                {/* Tür */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Tür
                  </label>
                  <select
                    value={editData.type || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, type: e.target.value })
                    }
                    className={inputClass}
                  >
                    {APPOINTMENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Tarih */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={editData.date || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, date: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                {/* Saat */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Saat
                  </label>
                  <input
                    type="time"
                    value={editData.time || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, time: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                {/* Süre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Süre (dk)
                  </label>
                  <input
                    type="number"
                    value={editData.duration || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, duration: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                {/* Durum */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                    Durum
                  </label>
                  <select
                    value={editData.status || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option>Beklemede</option>
                    <option>Onaylı</option>
                    <option>İptal</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-5">
                <button
                  onClick={() => setEditAppt(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={editSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  {editSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
