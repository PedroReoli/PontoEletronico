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
      <motion.div
        className="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Carregando...
        </motion.h1>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="loading-indicator"
        />
      </motion.div>
    </Layout>
  )
}

export default Dashboard

