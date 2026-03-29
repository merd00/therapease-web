import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import authService from "../../services/authService";
import useThemeStore from "../../store/themeStore";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { isDark, toggleTheme } = useThemeStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email ve şifre zorunludur");
      toast.warning("Email ve şifre zorunludur");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setError(null);
      login({ name: data.user.name, role: data.user.role }, data.access_token);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.detail || "Email veya şifre hatalı";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center relative">

      {/* Dark mode toggle — sağ üst köşe */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
          style={{ backgroundColor: isDark ? '#10b981' : '#e5e7eb' }}
        >
          <motion.div
            animate={{ x: isDark ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
      </div>

      <div className="w-full max-w-md">

        {/* Kart */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-10">

          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Therap<span className="text-emerald-600">Ease</span>
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">
              Danışman panelinize giriş yapın
            </p>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-semibold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="doktor@klinik.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors placeholder-gray-300 dark:placeholder-gray-600
                  ${error
                    ? 'border-red-300 focus:border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-800 text-gray-900 dark:text-white'
                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors placeholder-gray-300 dark:placeholder-gray-600
                  ${error
                    ? 'border-red-300 focus:border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-800 text-gray-900 dark:text-white'
                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
              />
            </div>

            {/* Buton */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 shadow-sm mt-2"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </div>

        {/* Alt yazı */}
        <p className="text-center text-xs font-medium text-gray-400 dark:text-gray-600 mt-6">
          TherapEase — Psikolojik Danışman Yönetim Sistemi
        </p>
      </div>
    </div>
  );
}