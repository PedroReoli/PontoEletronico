"use client"

import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import { Input, PasswordInput } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Alert } from "../components/ui/Alert"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Preencha todos os campos")
      return
    }

    try {
      setError("")
      setLoading(true)
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login")
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
              Bem-vindo de volta
            </motion.h2>
            <motion.p
              className="text-gray-600 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Acesse sua conta para continuar
            </motion.p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <Alert variant="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}
          </AnimatePresence>

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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button type="submit" fullWidth isLoading={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          <motion.div
            className="text-center mt-8 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              Não tem uma conta?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Registre-se
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="mt-8 text-center text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        &copy; {new Date().getFullYear()} Controle de Ponto. Todos os direitos reservados.
      </motion.div>
    </div>
  )
}

export default Login
