"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../services/api"
import Layout from "../../components/Layout"

interface Company {
  id: string
  name: string
  logoUrl: string | null
  active: boolean
  createdAt: string
}

function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    active: true,
  })

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const response = await api.get("/admin/companies")
        setCompanies(response.data)
      } catch (error) {
        console.error("Erro ao buscar empresas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      active: true,
    })
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Primeiro, criar a empresa
      const response = await api.post("/admin/companies", formData)

      // Se houver um logo, fazer upload
      if (logoFile) {
        const formData = new FormData()
        formData.append("logo", logoFile)

        const uploadResponse = await api.post(`/admin/companies/${response.data.id}/logo`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        response.data.logoUrl = uploadResponse.data.logoUrl
      }

      setCompanies([...companies, response.data])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error)
    }
  }

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentCompany) return

    try {
      // Primeiro, atualizar os dados da empresa
      const response = await api.put(`/admin/companies/${currentCompany.id}`, formData)

      // Se houver um logo novo, fazer upload
      if (logoFile) {
        const formDataLogo = new FormData()
        formDataLogo.append("logo", logoFile)

        const uploadResponse = await api.post(`/admin/companies/${currentCompany.id}/logo`, formDataLogo, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        response.data.logoUrl = uploadResponse.data.logoUrl
      }

      // Atualizar a lista de empresas
      setCompanies(companies.map((company) => (company.id === currentCompany.id ? response.data : company)))

      setShowEditModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao editar empresa:", error)
    }
  }

  const openEditModal = (company: Company) => {
    setCurrentCompany(company)
    setFormData({
      name: company.name,
      active: company.active,
    })
    setLogoFile(null)
    setLogoPreview(null)
    setShowEditModal(true)
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return

    try {
      await api.delete(`/admin/companies/${id}`)
      setCompanies(companies.filter((company) => company.id !== id))
    } catch (error: any) {
      // Verificar se o erro é devido a usuários vinculados
      if (error.response?.status === 400) {
        alert("Não é possível excluir a empresa pois existem usuários vinculados a ela.")
      } else {
        console.error("Erro ao excluir empresa:", error)
        alert("Erro ao excluir empresa.")
      }
    }
  }

  // Filtrar empresas com base no termo de pesquisa
  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Layout>
      <div className="admin-page company-management">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1>Gerenciamento de Empresas</h1>
            <p className="page-description">Cadastre e gerencie as empresas do sistema</p>
          </div>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nova Empresa
          </motion.button>
        </motion.div>

        <motion.div
          className="search-filter-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="search-box">
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
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          className="card companies-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="loading-container">
              <svg
                className="animate-spin"
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
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              <p>Carregando empresas...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
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
              <p>{searchTerm ? "Nenhuma empresa encontrada com esse termo" : "Nenhuma empresa cadastrada"}</p>
              {!searchTerm && (
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Cadastrar Primeira Empresa
                </button>
              )}
            </div>
          ) : (
            <div className="companies-table-container">
              <table className="companies-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <motion.tr
                      key={company.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td>
                        {company.logoUrl ? (
                          <div className="company-logo">
                            <img
                              src={company.logoUrl || "/placeholder.svg"}
                              alt={`Logo de ${company.name}`}
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="no-logo">{company.name.charAt(0).toUpperCase()}</div>
                        )}
                      </td>
                      <td>{company.name}</td>
                      <td>
                        <span className={`status-badge ${company.active ? "status-success" : "status-danger"}`}>
                          {company.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="btn-icon"
                            title="Editar"
                            onClick={() => openEditModal(company)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
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
                          </motion.button>
                          <motion.button
                            className="btn-icon delete"
                            title="Excluir"
                            onClick={() => handleDeleteCompany(company.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
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
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Modal de Adicionar Empresa */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="modal-header">
                  <h2>Adicionar Empresa</h2>
                  <button className="btn-close" onClick={() => setShowAddModal(false)}>
                    ×
                  </button>
                </div>
                <form onSubmit={handleAddCompany}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="add-name">Nome da Empresa</label>
                      <input
                        type="text"
                        id="add-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="add-logo">Logo (opcional)</label>
                      <div className="file-input-container">
                        <input
                          type="file"
                          id="add-logo"
                          name="logo"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="file-input"
                        />
                        <label htmlFor="add-logo" className="file-input-label">
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
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          Escolher arquivo
                        </label>
                        <span className="file-name">{logoFile ? logoFile.name : "Nenhum arquivo selecionado"}</span>
                      </div>

                      {logoPreview && (
                        <div className="logo-preview">
                          <img src={logoPreview || "/placeholder.svg"} alt="Preview do logo" />
                        </div>
                      )}
                    </div>

                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="add-active"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="add-active">Empresa ativa</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salvar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Editar Empresa */}
        <AnimatePresence>
          {showEditModal && currentCompany && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="modal-header">
                  <h2>Editar Empresa</h2>
                  <button className="btn-close" onClick={() => setShowEditModal(false)}>
                    ×
                  </button>
                </div>
                <form onSubmit={handleEditCompany}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="edit-name">Nome da Empresa</label>
                      <input
                        type="text"
                        id="edit-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-logo">Logo (opcional)</label>
                      <div className="file-input-container">
                        <input
                          type="file"
                          id="edit-logo"
                          name="logo"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="file-input"
                        />
                        <label htmlFor="edit-logo" className="file-input-label">
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
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          Escolher arquivo
                        </label>
                        <span className="file-name">{logoFile ? logoFile.name : "Nenhum arquivo selecionado"}</span>
                      </div>

                      {logoPreview ? (
                        <div className="logo-preview">
                          <img src={logoPreview || "/placeholder.svg"} alt="Preview do logo" />
                        </div>
                      ) : (
                        currentCompany.logoUrl && (
                          <div className="current-logo">
                            <p>Logo atual:</p>
                            <img
                              src={currentCompany.logoUrl || "/placeholder.svg"}
                              alt={`Logo de ${currentCompany.name}`}
                            />
                          </div>
                        )
                      )}
                    </div>

                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="edit-active"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="edit-active">Empresa ativa</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salvar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default CompanyManagement
