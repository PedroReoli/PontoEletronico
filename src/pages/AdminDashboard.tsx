"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import Layout from "../components/Layout"
import { motion } from "framer-motion"

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  totalShiftGroups: number
  totalShiftTypes: number
  pendingAdjustments: number
  punctualityRate: number
  activeWorkers: number
  onBreakUsers: number
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Layout>
      <section className="admin-dashboard">
        <header className="admin-header">
          <motion.div
            className="admin-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Painel Administrativo</h1>
            <p className="admin-subtitle">Gerencie todos os aspectos do sistema</p>
          </motion.div>

          <motion.div
            className="admin-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button className="btn-dashboard">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Configurações
            </button>
          </motion.div>
        </header>

        {loading ? (
          <div className="admin-loading">
            <div className="loading-animation">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <p>Carregando estatísticas do sistema...</p>
          </div>
        ) : (
          <>
            {/* KPI Principal */}
            <motion.article
              className="main-kpi"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="kpi-content">
                <div className="kpi-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="kpi-details">
                  <h2>Pontualidade Geral da Empresa</h2>
                  <div className="kpi-value-container">
                    <motion.span
                      className="kpi-value"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      {stats?.punctualityRate || 0}%
                    </motion.span>
                    <div className="kpi-progress">
                      <div className="kpi-progress-bar" style={{ width: `${stats?.punctualityRate || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Status Cards */}
            <motion.div className="status-cards" variants={container} initial="hidden" animate="show">
              <motion.article
                className="status-card"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="status-icon working">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div className="status-content">
                  <h3>Funcionários Trabalhando</h3>
                  <motion.p
                    className="status-value"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  >
                    {stats?.activeWorkers || 0}
                  </motion.p>
                </div>
              </motion.article>

              <motion.article
                className="status-card"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="status-icon break">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <div className="status-content">
                  <h3>Usuários em Intervalo</h3>
                  <motion.p
                    className="status-value"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                  >
                    {stats?.onBreakUsers || 0}
                  </motion.p>
                </div>
              </motion.article>
            </motion.div>

            {/* Stats Grid */}
            <motion.div className="admin-stats" variants={container} initial="hidden" animate="show">
              <motion.article
                className="admin-stat-card"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="stat-content">
                  <div className="stat-icon users">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Total de Usuários</h3>
                    <motion.p
                      className="stat-value"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      {stats?.totalUsers || 0}
                    </motion.p>
                  </div>
                </div>
              </motion.article>

              <motion.article
                className="admin-stat-card"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="stat-content">
                  <div className="stat-icon companies">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Total de Empresas</h3>
                    <motion.p
                      className="stat-value"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      {stats?.totalCompanies || 0}
                    </motion.p>
                  </div>
                </div>
              </motion.article>

              <motion.article
                className="admin-stat-card"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="stat-content">
                  <div className="stat-icon shift-groups">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Grupos de Jornada</h3>
                    <motion.p
                      className="stat-value"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    >
                      {stats?.totalShiftGroups || 0}
                    </motion.p>
                  </div>
                </div>
              </motion.article>

              <motion.article
                className="admin-stat-card"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="stat-content">
                  <div className="stat-icon shift-types">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Tipos de Plantão</h3>
                    <motion.p
                      className="stat-value"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                    >
                      {stats?.totalShiftTypes || 0}
                    </motion.p>
                  </div>
                </div>
              </motion.article>

              <motion.article
                className="admin-stat-card highlight"
                variants={item}
                whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="stat-content">
                  <div className="stat-icon adjustments">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                  <div className="stat-details">
                    <h3>Ajustes Pendentes</h3>
                    <motion.p
                      className="stat-value"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
                    >
                      {stats?.pendingAdjustments || 0}
                    </motion.p>
                  </div>
                </div>
                <div className="stat-footer">
                  <a href="/adjustments" className="stat-link">
                    Revisar
                  </a>
                </div>
              </motion.article>
            </motion.div>
          </>
        )}

        <motion.section
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2>Ações Rápidas</h2>

          <motion.div
            className="actions-grid"
            variants={container}
            initial="hidden"
            animate="show"
            transition={{ delayChildren: 0.8 }}
          >
            <motion.article
              className="action-card"
              onClick={() => (window.location.href = "/admin/users")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="action-content">
                <h3>Gerenciar Usuários</h3>
                <p>Adicionar, editar ou remover usuários do sistema</p>
              </div>
            </motion.article>

            <motion.article
              className="action-card"
              onClick={() => (window.location.href = "/admin/companies")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className="action-content">
                <h3>Gerenciar Empresas</h3>
                <p>Configurar empresas e suas configurações</p>
              </div>
            </motion.article>

            <motion.article
              className="action-card"
              onClick={() => (window.location.href = "/admin/shift-groups")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="action-content">
                <h3>Grupos de Jornada</h3>
                <p>Definir horários e regras para grupos de funcionários</p>
              </div>
            </motion.article>

            <motion.article
              className="action-card"
              onClick={() => (window.location.href = "/admin/shift-types")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="action-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div className="action-content">
                <h3>Tipos de Plantão</h3>
                <p>Configurar escalas e plantões especiais</p>
              </div>
            </motion.article>
          </motion.div>
        </motion.section>
      </section>
    </Layout>
  )
}

export default AdminDashboard
