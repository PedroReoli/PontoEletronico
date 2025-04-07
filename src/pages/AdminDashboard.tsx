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
      <motion.div className="admin-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Painel Administrativo
        </motion.h1>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8"
          >
            <motion.svg
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
              }}
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </motion.svg>
            <p className="mt-4">Carregando estatísticas...</p>
          </motion.div>
        ) : (
          <motion.div className="stats-grid" variants={container} initial="hidden" animate="show">
            <motion.div
              className="stat-card"
              variants={item}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <h3>Usuários</h3>
              <motion.p
                className="stat-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {stats?.totalUsers || 0}
              </motion.p>
            </motion.div>

            <motion.div
              className="stat-card"
              variants={item}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <h3>Empresas</h3>
              <motion.p
                className="stat-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              >
                {stats?.totalCompanies || 0}
              </motion.p>
            </motion.div>

            <motion.div
              className="stat-card"
              variants={item}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <h3>Grupos de Jornada</h3>
              <motion.p
                className="stat-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                {stats?.totalShiftGroups || 0}
              </motion.p>
            </motion.div>

            <motion.div
              className="stat-card"
              variants={item}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <h3>Tipos de Plantão</h3>
              <motion.p
                className="stat-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              >
                {stats?.totalShiftTypes || 0}
              </motion.p>
            </motion.div>

            <motion.div
              className="stat-card"
              variants={item}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <h3>Ajustes Pendentes</h3>
              <motion.p
                className="stat-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
              >
                {stats?.pendingAdjustments || 0}
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        <motion.div
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
            <motion.button
              className="action-card"
              onClick={() => (window.location.href = "/admin/users")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h3>Gerenciar Usuários</h3>
              <p>Adicionar, editar ou remover usuários do sistema</p>
            </motion.button>

            <motion.button
              className="action-card"
              onClick={() => (window.location.href = "/admin/companies")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h3>Gerenciar Empresas</h3>
              <p>Configurar empresas e suas configurações</p>
            </motion.button>

            <motion.button
              className="action-card"
              onClick={() => (window.location.href = "/admin/shift-groups")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h3>Grupos de Jornada</h3>
              <p>Definir horários e regras para grupos de funcionários</p>
            </motion.button>

            <motion.button
              className="action-card"
              onClick={() => (window.location.href = "/admin/shift-types")}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h3>Tipos de Plantão</h3>
              <p>Configurar escalas e plantões especiais</p>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  )
}

export default AdminDashboard

