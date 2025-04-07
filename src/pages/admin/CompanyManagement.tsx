"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
      setLogoFile(e.target.files[0])
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      active: true,
    })
    setLogoFile(null)
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

  // Implementar a função handleEditCompany que está vazia
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

  // Adicionar a função para abrir o modal de edição
  const openEditModal = (company: Company) => {
    setCurrentCompany(company)
    setFormData({
      name: company.name,
      active: company.active,
    })
    setLogoFile(null)
    setShowEditModal(true)
  }

  // Adicionar a função para excluir empresa
  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return

    try {
      await api.delete(`/admin/companies/${id}`)
      setCompanies(companies.filter((company) => company.id !== id))
    } catch (error) {
      console.error("Erro ao excluir empresa:", error)
    }
  }

  return (
    <Layout>
      <div className="company-management">
        <div className="page-header">
          <h1>Gerenciamento de Empresas</h1>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
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
          </button>
        </div>

        <div className="card companies-card">
          {loading ? (
            <p>Carregando empresas...</p>
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
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl || "/placeholder.svg"}
                            alt={`Logo de ${company.name}`}
                            style={{ width: "40px", height: "40px", objectFit: "contain" }}
                          />
                        ) : (
                          <div className="no-logo">Sem logo</div>
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
                          <button className="btn-icon" title="Editar" onClick={() => openEditModal(company)}>
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
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Excluir"
                            onClick={() => handleDeleteCompany(company.id)}
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
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Adicionar Empresa */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
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
                    <input type="file" id="add-logo" name="logo" onChange={handleFileChange} accept="image/*" />
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
            </div>
          </div>
        )}

        {/* Modal de Editar Empresa */}
        {showEditModal && currentCompany && (
          <div className="modal-overlay">
            <div className="modal">
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
                    <input type="file" id="edit-logo" name="logo" onChange={handleFileChange} accept="image/*" />
                    {currentCompany.logoUrl && (
                      <div className="current-logo">
                        <p>Logo atual:</p>
                        <img
                          src={currentCompany.logoUrl || "/placeholder.svg"}
                          alt={`Logo de ${currentCompany.name}`}
                          style={{ maxWidth: "100px", maxHeight: "100px", marginTop: "8px" }}
                        />
                      </div>
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
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CompanyManagement

