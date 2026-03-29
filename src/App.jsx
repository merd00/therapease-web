import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/dashboard/DashboardPage'
import PatientsPage from './pages/patients/PatientsPage'
import AppointmentsPage from './pages/appointments/AppointmentsPage'
import NotesPage from './pages/notes/NotesPage'
import ProfilePage from './pages/profile/ProfilePage'
import useAuthStore from './store/authStore'

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="hastalar" element={<PatientsPage />} />
          <Route path="randevular" element={<AppointmentsPage />} />
          <Route path="notlar" element={<NotesPage />} />
          <Route path="profil" element={<ProfilePage />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App