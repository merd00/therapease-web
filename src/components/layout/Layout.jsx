import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const navItems = [
  { path: '/',           label: 'Dashboard'  },
  { path: '/randevular', label: 'Randevular' },
  { path: '/hastalar',   label: 'Hastalar'   },
  { path: '/notlar',     label: 'Notlar'     },
]

export default function Layout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-base font-medium text-gray-900">
            Therap<span className="text-emerald-600">Ease</span>
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900">
            {user?.name || 'Danışman'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {user?.role || 'Psikolog'}
          </p>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="text-xs text-red-400 hover:text-red-600 mt-2 transition-colors"
          >
            Çıkış yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}