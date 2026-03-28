import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    // Basit doğrulama
    if (!email || !password) {
      setError("Email ve şifre zorunludur.");
      return;
    }

    setLoading(true);
    setError(null);

    // Şimdilik sahte giriş — ileride gerçek API'ye bağlayacağız
    setTimeout(() => {
      if (email === "doktor@test.com" && password === "123456") {
        localStorage.setItem("token", "sahte-token-123");
        navigate("/");
      } else {
        setError("Email veya şifre hatalı.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md">
        {/* Logo ve başlık */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">
            Therap<span className="text-emerald-600">Ease</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Danışman panelinize giriş yapın
          </p>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doktor@klinik.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Buton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
