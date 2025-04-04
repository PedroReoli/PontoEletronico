"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [tokenValid, setTokenValid] = useState(true)
  const [resetSuccess, setResetSuccess] = useState(false)
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { resetPassword, isLoading, error, clearError } = useAuth()

  useEffect(() => {
    // Aqui você poderia verificar se o token é válido antes de mostrar o formulário
    // Por exemplo, fazendo uma chamada à API
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return false
    }

    if (password.length < 8) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres")
      return false
    }

    setPasswordError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword() || !token) {
      return
    }

    try {
      await resetPassword(token, password)
      setResetSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      // Erro já será tratado pelo contexto de autenticação
    }
  }

  if (!tokenValid) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-surface rounded-lg shadow-md">
        <h2 className="text-heading-2 text-center mb-6">Link Inválido</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>O link de redefinição de senha é inválido ou expirou.</p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  if (resetSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-surface rounded-lg shadow-md">
        <h2 className="text-heading-2 text-center mb-6">Senha Redefinida</h2>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.</p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-primary hover:underline">
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-surface rounded-lg shadow-md">
      <h2 className="text-heading-2 text-center mb-6">Redefinir Senha</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={clearError}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="password" className="block text-body-2 font-medium mb-1">
            Nova Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-small text-muted mt-1">A senha deve ter pelo menos 8 caracteres</p>
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-body-2 font-medium mb-1">
            Confirmar Nova Senha
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
              passwordError ? "border-red-500" : ""
            }`}
            required
          />
          {passwordError && <p className="text-small text-red-500 mt-1">{passwordError}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Redefinindo..." : "Redefinir Senha"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}

export default ResetPasswordForm

