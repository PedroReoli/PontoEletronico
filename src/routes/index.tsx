import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AdminLayout from "@/components/layout/AdminLayout"

// Páginas de autenticação
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"

// Páginas protegidas
import DashboardPage from "@/pages/DashboardPage"
import ProfilePage from "@/pages/ProfilePage"
import AdminPage from "@/pages/AdminPage"
import PunchClockPage from "@/pages/PunchClockPage"

// Páginas de administração
import UsersPage from "@/pages/admin/UsersPage"
import UserDetailsPage from "@/pages/admin/UserDetailsPage"

// Páginas de jornadas e plantões
import ScheduleConfigPage from "@/pages/schedule/ScheduleConfigPage"
import ShiftBoardPage from "@/pages/schedule/ShiftBoardPage"
import UserShiftsPage from "@/pages/schedule/UserShiftsPage"

// Páginas de ajustes
import AdjustmentRequestPage from "@/pages/adjustment/AdjustmentRequestPage"
import PendingAdjustmentsPage from "@/pages/adjustment/PendingAdjustmentsPage"
import AllAdjustmentsPage from "@/pages/adjustment/AllAdjustmentsPage"

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rotas protegidas com layout de admin */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="punch" element={<PunchClockPage />} />

            {/* Rotas de jornadas e plantões */}
            <Route path="schedule">
              <Route
                path="config"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <ScheduleConfigPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="board"
                element={
                  <ProtectedRoute>
                    <ShiftBoardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="shifts" element={<UserShiftsPage />} />
            </Route>

            {/* Rotas de ajustes */}
            <Route path="adjustments">
              <Route path="request" element={<AdjustmentRequestPage />} />
              <Route
                path="pending"
                element={
                  <ProtectedRoute>
                    <PendingAdjustmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="all"
                element={
                  <ProtectedRoute>
                    <AllAdjustmentsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Rotas de administração */}
            <Route path="admin">
              <Route
                index
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              path="users/:id"
              element={
                <ProtectedRoute>
                  <UserDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota de fallback para páginas não encontradas */}
          <Route path="*" element={<div>Página não encontrada</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes

