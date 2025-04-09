"use client"

import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { motion, AnimatePresence } from "framer-motion"

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

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  }

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 }
    }
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 114, 245, 0.3), 0 4px 6px -2px rgba(0, 114, 245, 0.15)" },
    tap: { scale: 0.97 }
  }

  const successIconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
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
    <div className="auth-container">
      {/* Floating background elements */}
      {floatingElements.map((el, index) => (
        <motion.div
          key={index}
          className="floating-element"
          style={{
            width: el.size,
            height: el.size,
            top: el.top,
            left: el.left,
            right: el.right,
            bottom: el.bottom
          }}
          animate={{
            y: [0, 15, 0],
            x: [0, 10, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: el.delay
          }}
        />
      ))}

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="auth-header"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="auth-logo" variants={logoVariants}>
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
          <motion.h2 variants={itemVariants}>Recuperação de Senha</motion.h2>
          <motion.p variants={itemVariants}>Informe seu e-mail para receber instruções</motion.p>
        </motion.div>

        {/* Form */}
        <div className="auth-form">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="alert alert-error"
              >
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {success ? (
            <motion.div
              className="success-container"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div
                className="success-icon"
                variants={successIconVariants}
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
              <motion.h3 variants={itemVariants}>E-mail enviado!</motion.h3>
              <motion.p variants={itemVariants}>
                Enviamos um link para recuperação de senha para o e-mail <strong>{email}</strong>. Por favor, verifique
                sua caixa de entrada e siga as instruções.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link to="/login">
                  <motion.button
                    className="btn btn-primary"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Voltar para o Login
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <motion.div 
                className="form-group"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="email">E-mail</label>
                <div className="input-with-icon">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
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
                </div>
              </motion.div>

              <motion.button
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
                transition={{ delay: 0.2 }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin mr-2"
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
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  "Enviar Instruções"
                )}
              </motion.button>
            </form>
          )}
        </div>

        <motion.div 
          className="auth-footer"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <p>
            <Link to="/login" className="font-medium">
              Voltar para o login
            </Link>
          </p>
        </motion.div>
      </motion.div>

      <motion.div 
        className="auth-copyright"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        &copy; {new Date().getFullYear()} Controle de Ponto. Todos os direitos reservados.
      </motion.div>
    </div>
  )
}

export default ForgotPassword
