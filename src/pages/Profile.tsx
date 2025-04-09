"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { motion } from "framer-motion"
import Layout from "../components/Layout"
import { useAuth } from "../hooks/useAuth"
import api from "../services/api"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  companyName: string
  shiftGroup?: {
    name: string
    startTime: string
    endTime: string
    breakDuration: number
  } | null
  manager?: {
    id: string
    name: string
    email: string
  } | null
}

function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        // Buscar dados detalhados do perfil
        const response = await api.get("/users/profile")
        setProfile(response.data)
        setFormData({
          name: response.data.name,
          email: response.data.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } catch (error) {
        console.error("Erro ao buscar perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validar senhas se estiver alterando
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError("A senha atual é obrigatória para alterar a senha")
        return
      }
      if (formData.newPassword.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres")
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("As senhas não coincidem")
        return
      }
    }

    try {
      setSaving(true)
      const updateData = {
        name: formData.name,
        email: formData.email,
        ...(formData.newPassword
          ? {
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            }
          : {}),
      }

      await api.put("/users/profile", updateData)

      // Atualizar o perfil local
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          email: formData.email,
        })
      }

      setSuccess("Perfil atualizado com sucesso!")
      setEditMode(false)

      // Limpar campos de senha
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao atualizar perfil")
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
    setEditMode(false)
    setError("")
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "MANAGER":
        return "Gestor"
      case "EMPLOYEE":
        return "Funcionário"
      default:
        return role
    }
  }

  return (
    <Layout>
      <div className="profile-page">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1>Seu Perfil</h1>
        </motion.div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando dados do perfil...</p>
          </div>
        ) : (
          <div className="profile-content">
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile?.name.charAt(0).toUpperCase() || user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-title">
                  <h2>{profile?.name || user?.name}</h2>
                  <span className="profile-role">{getRoleName(profile?.role || user?.role || "")}</span>
                </div>
                {!editMode && (
                  <motion.button
                    className="btn-edit"
                    onClick={() => setEditMode(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar Perfil
                  </motion.button>
                )}
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {editMode ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Nome</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-divider">
                    <span>Alterar Senha (opcional)</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="currentPassword">Senha Atual</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Digite para alterar a senha"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Nova Senha</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Mínimo de 6 caracteres"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Repita a nova senha"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="info-group">
                    <div className="info-label">Nome</div>
                    <div className="info-value">{profile?.name}</div>
                  </div>

                  <div className="info-group">
                    <div className="info-label">E-mail</div>
                    <div className="info-value">{profile?.email}</div>
                  </div>

                  <div className="info-group">
                    <div className="info-label">Empresa</div>
                    <div className="info-value">{profile?.companyName}</div>
                  </div>

                  {profile?.shiftGroup && (
                    <div className="info-group">
                      <div className="info-label">Grupo de Jornada</div>
                      <div className="info-value">
                        <div>{profile.shiftGroup.name}</div>
                        <div className="info-detail">
                          Horário: {profile.shiftGroup.startTime} - {profile.shiftGroup.endTime}
                        </div>
                        <div className="info-detail">Intervalo: {profile.shiftGroup.breakDuration} minutos</div>
                      </div>
                    </div>
                  )}

                  {profile?.manager && (
                    <div className="info-group">
                      <div className="info-label">Gestor</div>
                      <div className="info-value">
                        <div>{profile.manager.name}</div>
                        <div className="info-detail">{profile.manager.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              className="profile-card security-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3>Atividade Recente</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon login">
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
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Login realizado</div>
                    <div className="activity-time">Hoje, 09:45</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon password">
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Senha alterada</div>
                    <div className="activity-time">15/04/2023, 14:30</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon profile">
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Perfil atualizado</div>
                    <div className="activity-time">10/04/2023, 11:15</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Profile
