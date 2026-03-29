import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2 } from "lucide-react";
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
  return name.split(" ").map((n) => n[0]).join("");
}

export default function NotesPage() {
  const [notes, setNotes]         = useState([]);
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [patientId, setPatientId] = useState("");
  const [content, setContent]     = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesData, patientsData] = await Promise.all([
        noteService.getAll(),
        patientService.getAll(),
      ]);
      setNotes(notesData);
      setPatients(patientsData);
    } catch (err) {
      toast.error("Notlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!patientId || !content.trim()) {
      toast.warning("Danışan ve not alanları zorunludur");
      return;
    }
    try {
      setSaving(true);
      const created = await noteService.create({
        patient_id: parseInt(patientId),
        content: content.trim(),
      });
      setNotes([created, ...notes]);
      setPatientId("");
      setContent("");
      setShowForm(false);
      toast.success("Not başarıyla eklendi");
    } catch (err) {
      toast.error("Not eklenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    try {
      await noteService.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
      toast.success("Not silindi");
    } catch (err) {
      toast.error("Not silinemedi");
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || "Bilinmeyen danışan";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-8 space-y-6">

      {/* Başlık */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notlar</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">
            {notes.length} seans notu
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {showForm ? "İptal" : "Yeni not"}
        </button>
      </motion.div>

      {/* Not ekleme formu */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yeni seans notu</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Danışan</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">Danışan seçin...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Not</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Seans notunu buraya yazın..."
              rows={4}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-400 transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
            />
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

      {/* Not listesi */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center"
          >
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3 mx-auto">
              <FileText size={24} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">Henüz not eklenmemiş</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Yeni not ekle butonuna tıklayın</p>
          </motion.div>
        ) : (
          notes.map((note, index) => {
            const patientName = getPatientName(note.patient_id);
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[index % avatarColors.length]}`}>
                      {getInitials(patientName)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 dark:text-white">{patientName}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-300">{formatDate(note.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 size={13} />
                    Sil
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">{note.content}</p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}