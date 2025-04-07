"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import ManagerDashboard from "./pages/ManagerDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import UserManagement from "./pages/admin/UserManagement"
import CompanyManagement from "./pages/admin/CompanyManagement"
import ShiftGroups from "./pages/admin/ShiftGroups"
import ShiftTypes from "./pages/admin/ShiftTypes"
import Reports from "./pages/Reports"
import AdjustmentRequests from "./pages/AdjustmentRequests"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />

      {/* Rotas protegidas */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas de funcionário */}
      <Route
        path="/timesheet"
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas de gestor */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={["MANAGER", "ADMIN"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/adjustments"
        element={
          <ProtectedRoute roles={["MANAGER", "ADMIN"]}>
            <AdjustmentRequests />
          </ProtectedRoute>
        }
      />

      {/* Rotas de administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <CompanyManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/shift-groups"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <ShiftGroups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/shift-types"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <ShiftTypes />
          </ProtectedRoute>
        }
      />

      {/* Relatórios (acessível por todos os perfis) */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

