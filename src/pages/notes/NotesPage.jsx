import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Trash2, Search, X,
  ChevronRight, Pencil, Check, Calendar, Hash
} from "lucide-react";
import noteService from "../../services/noteService";
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

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function todayInputFormat() {
  return new Date().toISOString().split("T")[0];
}

function inputDateToISO(dateStr) {
  return new Date(dateStr).toISOString();
}

export default function NotesPage() {
  const [summaries, setSummaries]               = useState([]);
  const [patients, setPatients]                 = useState([]);
  const [selectedPatient, setSelectedPatient]   = useState(null);
  const [notes, setNotes]                       = useState([]);
  const [patientSearch, setPatientSearch]       = useState("");
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [loadingNotes, setLoadingNotes]         = useState(false);

  // Yeni not formu
  const [showForm, setShowForm]             = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [formPatientId, setFormPatientId]   = useState("");
  const [formTitle, setFormTitle]           = useState("");
  const [formContent, setFormContent]       = useState("");
  const [formSession, setFormSession]       = useState("");
  const [formDate, setFormDate]             = useState(todayInputFormat());

  // Combobox (danışan arama formu içi)
  const [patientQuery, setPatientQuery]       = useState("");
  const [showPatientDrop, setShowPatientDrop] = useState(false);

  // Not filtreleri
  const [noteSearch, setNoteSearch]         = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]     = useState("");
  const [filterSession, setFilterSession]   = useState("");

  // Detay / düzenleme modal
  const [detailNote, setDetailNote]   = useState(null);
  const [editing, setEditing]         = useState(false);
  const [editTitle, setEditTitle]     = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSession, setEditSession] = useState("");
  const [editDate, setEditDate]       = useState("");
  const [editSaving, setEditSaving]   = useState(false);

  useEffect(() => { fetchSummaries(); fetchPatients(); }, []);

  useEffect(() => {
    if (selectedPatient) fetchNotes(selectedPatient.patient_id);
  }, [selectedPatient]);

  useEffect(() => {
    if (detailNote) {
      setEditTitle(detailNote.title || "");
      setEditContent(detailNote.content || "");
      setEditSession(detailNote.session_number ? String(detailNote.session_number) : "");
      setEditDate(new Date(detailNote.created_at).toISOString().split("T")[0]);
      setEditing(false);
    }
  }, [detailNote]);

  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      setSummaries(await noteService.getPatientSummaries());
    } catch { toast.error("Danışan listesi yüklenemedi"); }
    finally { setLoadingSummaries(false); }
  };

  const fetchPatients = async () => {
    try { setPatients(await patientService.getAll()); }
    catch { toast.error("Danışanlar yüklenemedi"); }
  };

  const fetchNotes = async (patientId) => {
    try {
      setLoadingNotes(true);
      setNotes(await noteService.getByPatient(patientId));
    } catch { toast.error("Notlar yüklenemedi"); }
    finally { setLoadingNotes(false); }
  };

  // Combobox'ta danışan seç
  const selectPatientInForm = (p) => {
    setFormPatientId(String(p.id));
    setPatientQuery(p.name);
    setShowPatientDrop(false);
    // Seans numarasını otomatik hesapla
    const count = summaries.find(s => s.patient_id === p.id)?.count || 0;
    setFormSession(String(count + 1));
  };

  // Combobox filtresi — isim, telefon veya yaşa göre
  const filteredPatientOptions = patients.filter((p) => {
    const q = patientQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      String(p.age || "").includes(q)
    );
  });

  // Not filtreleri
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (noteSearch.trim()) {
        const q = noteSearch.toLowerCase();
        if (!note.title?.toLowerCase().includes(q) && !note.content.toLowerCase().includes(q)) return false;
      }
      if (filterSession.trim()) {
        if (String(note.session_number) !== filterSession.trim()) return false;
      }
      if (filterDateFrom) {
        if (new Date(note.created_at) < new Date(filterDateFrom)) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo);
        to.setHours(23, 59, 59);
        if (new Date(note.created_at) > to) return false;
      }
      return true;
    });
  }, [notes, noteSearch, filterSession, filterDateFrom, filterDateTo]);

  const hasActiveFilter = noteSearch || filterSession || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setNoteSearch(""); setFilterSession("");
    setFilterDateFrom(""); setFilterDateTo("");
  };

  const handleCreate = async () => {
    if (!formPatientId || !formContent.trim()) {
      toast.warning("Danışan ve not alanları zorunludur");
      return;
    }
    try {
      setSaving(true);
      await noteService.create({
        patient_id:     parseInt(formPatientId),
        title:          formTitle.trim() || null,
        content:        formContent.trim(),
        session_number: formSession ? parseInt(formSession) : null,
        created_at:     inputDateToISO(formDate),
      });
      toast.success("Not başarıyla eklendi");
      setFormPatientId(""); setFormTitle(""); setFormContent("");
      setFormSession(""); setFormDate(todayInputFormat());
      setPatientQuery(""); // combobox temizle
      setShowForm(false);
      await fetchSummaries();
      if (selectedPatient && selectedPatient.patient_id === parseInt(formPatientId)) {
        await fetchNotes(selectedPatient.patient_id);
      }
    } catch { toast.error("Not eklenemedi"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) { toast.warning("Not içeriği boş olamaz"); return; }
    try {
      setEditSaving(true);
      const updated = await noteService.update(detailNote.id, {
        title:          editTitle.trim() || null,
        content:        editContent.trim(),
        session_number: editSession ? parseInt(editSession) : null,
        created_at:     inputDateToISO(editDate),
      });
      setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
      setDetailNote(updated);
      setEditing(false);
      toast.success("Not güncellendi");
    } catch { toast.error("Not güncellenemedi"); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    try {
      await noteService.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setSummaries((prev) => prev.map((s) =>
        s.patient_id === selectedPatient?.patient_id ? { ...s, count: s.count - 1 } : s
      ));
      if (detailNote?.id === noteId) setDetailNote(null);
      toast.success("Not silindi");
    } catch { toast.error("Not silinemedi"); }
  };

  const filteredSummaries = summaries.filter((s) =>
    s.patient_name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col gap-6">

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notlar</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {summaries.length} danışan · {summaries.reduce((a, s) => a + s.count, 0)} toplam not
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setPatientQuery(""); setFormPatientId(""); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showForm ? "İptal" : "Yeni Not"}
        </button>
      </motion.div>

      {/* Yeni not formu */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yeni seans notu</h2>

            {/* Satır 1: Danışan (combobox) + Seans No + Tarih */}
            <div className="grid grid-cols-3 gap-3">

              {/* ── Danışan Combobox ── */}
              <div className="col-span-1 relative">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Danışan</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="İsim yazarak ara..."
                    value={patientQuery}
                    onChange={(e) => {
                      setPatientQuery(e.target.value);
                      setFormPatientId("");
                      setShowPatientDrop(true);
                    }}
                    onFocus={() => setShowPatientDrop(true)}
                    onBlur={() => setTimeout(() => setShowPatientDrop(false), 150)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 ${
                      formPatientId
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 focus:border-emerald-400"
                    }`}
                  />
                  {/* Seçili ise yeşil tik */}
                  {formPatientId && (
                    <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>

                {/* Dropdown listesi */}
                {showPatientDrop && (
                  <div className="absolute z-30 w-72 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {filteredPatientOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center font-medium">
                        Danışan bulunamadı
                      </div>
                    ) : (
                      filteredPatientOptions.map((p, i) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => selectPatientInForm(p)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-50 dark:border-gray-700 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                              {getInitials(p.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                {[p.age && `${p.age} yaş`, p.phone].filter(Boolean).join(" · ") || "Bilgi yok"}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                            p.status === "Aktif"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}>
                            {p.status}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Seans No */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Seans No</label>
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number" min="1" value={formSession}
                    onChange={(e) => setFormSession(e.target.value)}
                    placeholder="Otomatik"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 transition-colors"
                  />
                </div>
              </div>

              {/* Tarih */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Tarih</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date" value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Başlık */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Başlık <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
              </label>
              <input
                type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Seans başlığı..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
              />
            </div>

            {/* Not içeriği */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Not</label>
              <textarea
                value={formContent} onChange={(e) => setFormContent(e.target.value)}
                placeholder="Seans notunu buraya yazın..." rows={4}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
              />
            </div>

            <button
              onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Plus size={15} />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* İki panel */}
      <div className="flex gap-6 flex-1 min-h-0">

        {/* Sol panel — danışan listesi */}
        <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text" placeholder="Danışan ara..." value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400"
              />
              {patientSearch && (
                <button onClick={() => setPatientSearch("")}>
                  <X size={13} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingSummaries ? (
              <div className="space-y-2 p-2">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredSummaries.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                  {patientSearch ? "Danışan bulunamadı" : "Henüz not yok"}
                </p>
              </div>
            ) : (
              filteredSummaries.map((s, index) => {
                const isSelected = selectedPatient?.patient_id === s.patient_id;
                return (
                  <motion.button
                    key={s.patient_id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => { setSelectedPatient(s); clearFilters(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left mb-1 ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                      {getInitials(s.patient_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-gray-200"}`}>
                        {s.patient_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{s.count} seans</p>
                    </div>
                    {isSelected && <ChevronRight size={14} className="text-emerald-500 flex-shrink-0" />}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Sağ panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedPatient ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <FileText size={24} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">Bir danışan seçin</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Sol panelden danışan seçerek notlarını görüntüleyin</p>
            </motion.div>
          ) : (
            <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col overflow-hidden">

              {/* Başlık + filtreler */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedPatient.patient_name}</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                      {filteredNotes.length === notes.length
                        ? `${notes.length} seans notu`
                        : `${filteredNotes.length} / ${notes.length} not gösteriliyor`}
                    </p>
                  </div>
                  {hasActiveFilter && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X size={12} />
                      Filtreleri temizle
                    </button>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Metin arama */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 flex-1 min-w-40">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="text" placeholder="Başlık veya içerikte ara..."
                      value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400"
                    />
                    {noteSearch && <button onClick={() => setNoteSearch("")}><X size={12} className="text-gray-400" /></button>}
                  </div>

                  {/* Seans no */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 w-32">
                    <Hash size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="number" min="1" placeholder="Seans no"
                      value={filterSession} onChange={(e) => setFilterSession(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400"
                    />
                    {filterSession && <button onClick={() => setFilterSession("")}><X size={12} className="text-gray-400" /></button>}
                  </div>

                  {/* Tarih başlangıç */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                    <input
                      type="date" value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none"
                    />
                  </div>

                  {/* Tarih bitiş */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-400 font-medium">–</span>
                    <input
                      type="date" value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Not listesi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingNotes ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/3" />
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))
                ) : filteredNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
                    <FileText size={32} className="text-gray-200 dark:text-gray-700" />
                    <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
                      {hasActiveFilter ? "Filtreyle eşleşen not bulunamadı" : "Bu danışana ait not yok"}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">
                      {hasActiveFilter ? "Filtreleri değiştirmeyi deneyin" : "Yeni Not butonuna tıklayarak ekleyebilirsiniz"}
                    </p>
                  </div>
                ) : (
                  filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 group cursor-pointer"
                      onClick={() => setDetailNote(note)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {note.session_number && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg">
                                <Hash size={10} />
                                {note.session_number}. Seans
                              </span>
                            )}
                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                              {formatDate(note.created_at)}
                            </span>
                          </div>
                          {note.title && (
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{note.title}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailNote(note); setEditing(true); }}
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-white hover:bg-emerald-500 px-2 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Pencil size={11} />
                            Düzenle
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                            className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-2 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={11} />
                            Sil
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {note.content}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detay / Düzenleme Modal */}
      <AnimatePresence>
        {detailNote && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => { setDetailNote(null); setEditing(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedPatient?.patient_name}
                    </p>
                    {detailNote.session_number && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg">
                        <Hash size={10} />
                        {detailNote.session_number}. Seans
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {formatDate(detailNote.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Pencil size={13} />
                      Düzenle
                    </button>
                  )}
                  <button
                    onClick={() => { setDetailNote(null); setEditing(false); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Seans No</label>
                      <div className="relative">
                        <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number" min="1" value={editSession}
                          onChange={(e) => setEditSession(e.target.value)}
                          placeholder="Seans numarası"
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tarih</label>
                      <div className="relative">
                        <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date" value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-3 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Başlık <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
                    </label>
                    <input
                      type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Not başlığı..."
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Not</label>
                    <textarea
                      value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleUpdate} disabled={editSaving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                      {editSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 max-h-96 overflow-y-auto">
                    {detailNote.title && (
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">{detailNote.title}</p>
                    )}
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {detailNote.content}
                    </p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => { setDetailNote(null); setEditing(false); }}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}