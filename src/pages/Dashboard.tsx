"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import Layout from "../components/Layout"
import { motion } from "framer-motion"

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirecionar com base no papel do usuário
    if (user?.role === "ADMIN") {
      navigate("/admin")
    } else if (user?.role === "MANAGER") {
      navigate("/manager")
    } else {
      navigate("/timesheet")
    }
  }, [user, navigate])

  return (
    <Layout>
      <div className="dashboard-redirect">
        <div className="redirect-container">
          <motion.div 
            className="redirect-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="redirect-header">
              <motion.div 
                className="redirect-icon"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
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
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Redirecionando
              </motion.h1>
              
              <motion.div 
                className="loading-dots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.span
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
                ></motion.span>
                <motion.span
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
                ></motion.span>
                <motion.span
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
                ></motion.span>
              </motion.div>
            </div>
            
            <div className="redirect-content">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Estamos direcionando você para o dashboard apropriado com base no seu perfil de acesso.
              </motion.p>
              
              <motion.div 
                className="redirect-destination"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="destination-label">Destino:</div>
                <div className="destination-value">
                  {user?.role === "ADMIN" && "Painel Administrativo"}
                  {user?.role === "MANAGER" && "Dashboard do Gestor"}
                  {user?.role === "EMPLOYEE" && "Registro de Ponto"}
                </div>
              </motion.div>
              
              <motion.div 
                className="progress-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <motion.div 
                  className="progress-bar"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                ></motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
