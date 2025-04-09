"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import { motion, AnimatePresence } from "framer-motion"

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyCode: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError("Por favor, informe seu nome completo")
      return false
    }
    if (!formData.email.trim()) {
      setError("Por favor, informe seu e-mail")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, informe um e-mail válido")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.password) {
      setError("Por favor, crie uma senha")
      return false
    }
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return false
    }
    if (!formData.companyCode.trim()) {
      setError("Por favor, informe o código da empresa")
      return false
    }
    return true
  }

  const nextStep = () => {
    setError("")
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setError("")
    setCurrentStep(1)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateStep2()) {
      return
    }

    try {
      setLoading(true)
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyCode: formData.companyCode,
      })

      setSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao registrar usuário")
    } finally {
      setLoading(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  }

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="register-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="register-card"
      >
        {/* Header */}
        <div className="register-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="register-logo"
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
            <h1>Controle de Ponto</h1>
          </motion.div>
          <h2>Crie sua conta</h2>
          <p>Preencha os dados abaixo para começar</p>

          {/* Progress Steps */}
          <div className="register-progress">
            <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <span className="step-label">Dados Pessoais</span>
            </div>
            <div className="progress-line">
              <motion.div
                className="progress-line-fill"
                initial={{ width: "0%" }}
                animate={{ width: currentStep >= 2 ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
            <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <span className="step-label">Segurança</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="register-form">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
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

            {success ? (
              <motion.div variants={successVariants} initial="hidden" animate="visible" className="register-success">
                <motion.div
                  className="success-icon"
                  variants={itemVariants}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
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
                <motion.h3 variants={itemVariants}>Conta criada com sucesso!</motion.h3>
                <motion.p variants={itemVariants}>
                  Seu cadastro foi realizado. Você será redirecionado para a página de login em instantes...
                </motion.p>
                <motion.div variants={itemVariants} className="progress-bar-container">
                  <motion.div
                    className="progress-bar"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  ></motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="form-step"
                    >
                      <div className="form-group">
                        <label htmlFor="name">Nome Completo</label>
                        <div className="input-with-icon">
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
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Digite seu nome completo"
                            disabled={loading || success}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <div className="input-with-icon">
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
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Digite seu e-mail"
                            disabled={loading || success}
                            required
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={nextStep}
                        disabled={loading || success}
                        className="btn btn-primary w-full"
                      >
                        Continuar
                      </motion.button>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="form-step"
                    >
                      <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <div className="input-with-icon">
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
                          <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Crie uma senha"
                            disabled={loading || success}
                            required
                          />
                        </div>
                        <div className="password-strength">
                          <div className={`strength-bar ${formData.password.length > 0 ? "weak" : ""}`}></div>
                          <div className={`strength-bar ${formData.password.length >= 4 ? "medium" : ""}`}></div>
                          <div className={`strength-bar ${formData.password.length >= 6 ? "strong" : ""}`}></div>
                          <span className="strength-text">
                            {formData.password.length === 0 && "Crie uma senha forte"}
                            {formData.password.length > 0 && formData.password.length < 4 && "Senha fraca"}
                            {formData.password.length >= 4 && formData.password.length < 6 && "Senha média"}
                            {formData.password.length >= 6 && "Senha forte"}
                          </span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <div className="input-with-icon">
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
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirme sua senha"
                            disabled={loading || success}
                            required
                          />
                        </div>
                        {formData.password && formData.confirmPassword && (
                          <div className="password-match">
                            {formData.password === formData.confirmPassword ? (
                              <span className="match-success">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
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
                                Senhas coincidem
                              </span>
                            ) : (
                              <span className="match-error">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="15" y1="9" x2="9" y2="15"></line>
                                  <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                                Senhas não coincidem
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="companyCode">Código da Empresa</label>
                        <div className="input-with-icon">
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
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                          <input
                            id="companyCode"
                            name="companyCode"
                            type="text"
                            value={formData.companyCode}
                            onChange={handleChange}
                            placeholder="Digite o código da empresa"
                            disabled={loading || success}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-actions">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={prevStep}
                          disabled={loading || success}
                          className="btn btn-secondary"
                        >
                          Voltar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading || success}
                          className="btn btn-primary"
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
                              Processando...
                            </>
                          ) : (
                            "Criar Conta"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </AnimatePresence>
        </div>

        <div className="register-footer">
          <p>
            Já possui uma conta?{" "}
            <Link to="/login" className="font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>

      <div className="register-copyright">
        &copy; {new Date().getFullYear()} Controle de Ponto. Todos os direitos reservados.
      </div>
    </div>
  )
}

export default Register
