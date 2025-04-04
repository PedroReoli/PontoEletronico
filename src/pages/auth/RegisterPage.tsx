"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import RegisterForm from "@/components/auth/RegisterForm"
import { useAuth } from "@/hooks/useAuth"

const RegisterPage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-heading-1 font-bold">Ponto Eletrônico</h1>
          <p className="text-body-1 text-muted mt-2">Crie sua conta para acessar o sistema</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}

export default RegisterPage

