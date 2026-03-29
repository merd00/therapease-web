import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, Users, FileText, LogOut, User } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";

const navItems = [
  { path: "/",           label: "Dashboard",  icon: LayoutDashboard },
  { path: "/randevular", label: "Randevular", icon: Calendar         },
  { path: "/hastalar", label: "Danışanlar", icon: Users },
  { path: "/notlar",     label: "Notlar",     icon: FileText         },
];

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("") || "?";
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                Therap<span className="text-emerald-600">Ease</span>
              </span>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">Danışman Paneli</p>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0"
              style={{ backgroundColor: isDark ? '#10b981' : '#e5e7eb' }}
            >
              <motion.div
                animate={{ x: isDark ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
              />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">Menü</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
                    : "text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? "text-white" : "text-gray-400 dark:text-gray-400"} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Alt kısım — profil */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700 space-y-1">

          {/* Profil linki */}
          <NavLink
            to="/profil"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`
            }
          >
            {user?.avatar_url ? (
              <img
                src={`http://localhost:8000${user.avatar_url}`}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm font-black shrink-0">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.name || "Danışman"}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                {user?.title || "Danışman"}
              </p>
            </div>
            <User size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
          </NavLink>

          {/* Çıkış */}
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-3 text-sm font-semibold text-red-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 w-full px-4 py-3 rounded-xl transition-all"
          >
            <LogOut size={16} />
            Çıkış yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}