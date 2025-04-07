"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import Layout from "../components/Layout"

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
      <div className="dashboard">
        <h1>Carregando...</h1>
      </div>
    </Layout>
  )
}

export default Dashboard

