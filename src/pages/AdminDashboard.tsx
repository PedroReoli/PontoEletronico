"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import Layout from "../components/Layout"

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  totalShiftGroups: number
  totalShiftTypes: number
  pendingAdjustments: number
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/dashboard-stats")
        setStats(response.data)
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1>Painel Administrativo</h1>

        {loading ? (
          <p>Carregando estatísticas...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Usuários</h3>
              <p className="stat-value">{stats?.totalUsers || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Empresas</h3>
              <p className="stat-value">{stats?.totalCompanies || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Grupos de Jornada</h3>
              <p className="stat-value">{stats?.totalShiftGroups || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Tipos de Plantão</h3>
              <p className="stat-value">{stats?.totalShiftTypes || 0}</p>
            </div>

            <div className="stat-card">
              <h3>Ajustes Pendentes</h3>
              <p className="stat-value">{stats?.pendingAdjustments || 0}</p>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h2>Ações Rápidas</h2>

          <div className="actions-grid">
            <button className="action-card" onClick={() => (window.location.href = "/admin/users")}>
              <h3>Gerenciar Usuários</h3>
              <p>Adicionar, editar ou remover usuários do sistema</p>
            </button>

            <button className="action-card" onClick={() => (window.location.href = "/admin/companies")}>
              <h3>Gerenciar Empresas</h3>
              <p>Configurar empresas e suas configurações</p>
            </button>

            <button className="action-card" onClick={() => (window.location.href = "/admin/shift-groups")}>
              <h3>Grupos de Jornada</h3>
              <p>Definir horários e regras para grupos de funcionários</p>
            </button>

            <button className="action-card" onClick={() => (window.location.href = "/admin/shift-types")}>
              <h3>Tipos de Plantão</h3>
              <p>Configurar escalas e plantões especiais</p>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard

