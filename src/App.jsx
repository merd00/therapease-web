import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/dashboard/DashboardPage'
import PatientsPage from './pages/patients/PatientsPage'
import AppointmentsPage from './pages/appointments/AppointmentsPage'
import NotesPage from './pages/notes/NotesPage'

// Giriş yapılmamışsa login sayfasına yönlendir
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('token')
  return isLoggedIn ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Giriş sayfası — herkese açık */}
        <Route path="/login" element={<LoginPage />} />

        {/* Korunan sayfalar — sadece giriş yapılmışsa */}
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
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App