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
      <div className="dashboard-container">
        <motion.div
          className="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="loading-content"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="loading-title"
            >
              Redirecionando...
            </motion.h1>

            <motion.div
              className="loading-spinner"
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="loading-message"
            >
              Você será redirecionado para a página apropriada com base no seu perfil de acesso.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

export default Dashboard
