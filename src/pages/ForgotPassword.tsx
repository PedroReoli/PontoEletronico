"use client"

import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import api from "../services/api"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Alert } from "../components/ui/Alert"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, informe seu e-mail")
      return
    }

    try {
      setLoading(true)
      setError("")
      await api.post("/auth/forgot-password", { email })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao processar solicitação")
    } finally {
      setLoading(false)
    }
  }

  // Floating elements for background
  const floatingElements = [
    { size: 60, top: "10%", left: "5%", delay: 0 },
    { size: 80, top: "20%", right: "10%", delay: 1 },
    { size: 40, bottom: "15%", left: "10%", delay: 2 },
    { size: 100, bottom: "10%", right: "5%", delay: 3 },
  ]

  return (
    <div className="auth-page">
      {/* Floating background elements */}
      {floatingElements.map((el, index) => (
        <div
          key={index}
          className="floating-element"
          style={{
            width: el.size,
            height: el.size,
            top: el.top,
            left: el.left,
            right: el.right,
            bottom: el.bottom,
            animationDelay: `${el.delay}s`,
          }}
        />
      ))}

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="p-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
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
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Recuperação de Senha
            </motion.h2>
            <motion.p
              className="text-gray-600 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Informe seu e-mail para receber instruções
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <Alert variant="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}
          </AnimatePresence>

          {success ? (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              >
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </motion.div>
              <motion.h3
                className="text-xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                E-mail enviado!
              </motion.h3>
              <motion.p
                className="text-gray-600 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Enviamos um link para recuperação de senha para o e-mail{" "}
                <strong className="font-medium">{email}</strong>. Por favor, verifique sua caixa de entrada e siga as
                instruções.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button as={Link} to="/login" fullWidth>
                  Voltar para o Login
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                  icon={
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6"
              >
                <Button type="submit" fullWidth isLoading={loading}>
                  {loading ? "Enviando..." : "Enviar Instruções"}
                </Button>
              </motion.div>
            </form>
          )}

          <motion.div
            className="text-center mt-8 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p>
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Voltar para o login
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="mt-8 text-center text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        &copy; {new Date().getFullYear()} Controle de Ponto. Todos os direitos reservados.
      </motion.div>
    </div>
  )
}

export default ForgotPassword
