"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { forgotPassword, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await forgotPassword(email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-surface rounded-lg shadow-md">
        <h2 className="text-heading-2 text-center mb-6">Email Enviado</h2>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>
            Se o email <strong>{email}</strong> estiver cadastrado em nosso sistema, você receberá um link para
            redefinir sua senha.
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-primary hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-surface rounded-lg shadow-md">
      <h2 className="text-heading-2 text-center mb-6">Recuperar Senha</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={clearError}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <p className="mb-4 text-body-2">Digite seu email abaixo e enviaremos um link para redefinir sua senha.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-body-2 font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
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

export default ForgotPasswordForm

