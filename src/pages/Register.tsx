"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "../components/ui/Input"
import { PasswordInput, PasswordConfirmInput } from "../components/ui/PasswordInput"
import { Button } from "../components/ui/Button"
import { Alert } from "../components/ui/Alert"
import { ProgressSteps } from "../components/ui/ProgressSteps"

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
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
              </div>
              <h1 className="text-xl font-bold text-gray-800">Controle de Ponto</h1>
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800">Crie sua conta</h2>
            <p className="text-sm text-gray-600 mt-1">Preencha os dados abaixo para começar</p>

            {/* Progress Steps */}
            <ProgressSteps steps={["Dados Pessoais", "Segurança"]} currentStep={currentStep} />
          </div>

          {/* Form */}
          <div>
            <AnimatePresence mode="wait">
              {error && (
                <Alert variant="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {success ? (
                <motion.div variants={successVariants} initial="hidden" animate="visible" className="text-center py-8">
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
                  <motion.h3 variants={itemVariants} className="text-xl font-bold text-gray-800 mt-4">
                    Conta criada com sucesso!
                  </motion.h3>
                  <motion.p variants={itemVariants} className="text-gray-600 mt-2">
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
                      <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          label="Nome Completo"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Digite seu nome completo"
                          disabled={loading || success}
                          required
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
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          }
                        />

                        <Input
                          id="email"
                          name="email"
                          type="email"
                          label="E-mail"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Digite seu e-mail"
                          disabled={loading || success}
                          required
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

                        <div className="mt-6">
                          <Button type="button" onClick={nextStep} disabled={loading || success} fullWidth>
                            Continuar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                        <PasswordInput
                          id="password"
                          name="password"
                          label="Senha"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Crie uma senha"
                          disabled={loading || success}
                          required
                          showStrength
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

                        <PasswordConfirmInput
                          id="confirmPassword"
                          name="confirmPassword"
                          label="Confirmar Senha"
                          value={formData.confirmPassword}
                          passwordValue={formData.password}
                          onChange={handleChange}
                          placeholder="Confirme sua senha"
                          disabled={loading || success}
                          required
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

                        <Input
                          id="companyCode"
                          name="companyCode"
                          type="text"
                          label="Código da Empresa"
                          value={formData.companyCode}
                          onChange={handleChange}
                          placeholder="Digite o código da empresa"
                          disabled={loading || success}
                          required
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
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                          }
                        />

                        <div className="flex gap-3 mt-6">
                          <Button type="button" onClick={prevStep} disabled={loading || success} variant="secondary">
                            Voltar
                          </Button>
                          <Button type="submit" disabled={loading || success} isLoading={loading} fullWidth>
                            {loading ? "Processando..." : "Criar Conta"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            <p>
              Já possui uma conta?{" "}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Entrar
              </Link>
            </p>
          </div>
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

export default Register
