"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import LoginForm from "@/components/auth/LoginForm"
import { useAuth } from "@/hooks/useAuth"

const LoginPage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-heading-1 font-bold">Ponto Eletrônico</h1>
          <p className="text-body-1 text-muted mt-2">Faça login para acessar o sistema</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage

