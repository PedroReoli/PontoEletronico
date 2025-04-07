"use client"

import type React from "react"

import { useState, useEffect } from "react"
import api from "../../services/api"
import Layout from "../../components/Layout"

interface ShiftType {
  id: string
  name: string
  description: string | null
  companyId: string
  companyName: string
  createdAt: string
  updatedAt: string
}

function ShiftTypes() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentShiftType, setCurrentShiftType] = useState<ShiftType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    companyId: "",
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [shiftTypesResponse, companiesResponse] = await Promise.all([
          api.get("/admin/shift-types"),
          api.get("/admin/companies"),
        ])

        setShiftTypes(shiftTypesResponse.data)
        setCompanies(companiesResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      companyId: "",
    })
    setCurrentShiftType(null)
  }

  const handleAddShiftType = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post("/admin/shift-types", formData)
      setShiftTypes([...shiftTypes, response.data])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao adicionar tipo de plantão:", error)
    }
  }

  const handleEditShiftType = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentShiftType) return

    try {
      const response = await api.put(`/admin/shift-types/${currentShiftType.id}`, formData)
      setShiftTypes(shiftTypes.map((type) => (type.id === currentShiftType.id ? response.data : type)))
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao editar tipo de plantão:", error)
    }
  }

  const handleDeleteShiftType = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tipo de plantão?")) return

    try {
      await api.delete(`/admin/shift-types/${id}`)
      setShiftTypes(shiftTypes.filter((type) => type.id !== id))
    } catch (error) {
      console.error("Erro ao excluir tipo de plantão:", error)
    }
  }

  const openEditModal = (shiftType: ShiftType) => {
    setCurrentShiftType(shiftType)
    setFormData({
      name: shiftType.name,
      description: shiftType.description || "",
      companyId: shiftType.companyId,
    })
    setShowEditModal(true)
  }

  return (
    <Layout>
      <div className="shift-types-page">
        <div className="page-header">
          <h1>Tipos de Plantão</h1>
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
            Novo Tipo
          </button>
        </div>

        <div className="card shift-types-card">
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
              <p>Carregando tipos de plantão...</p>
            </div>
          ) : shiftTypes.length === 0 ? (
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <p>Nenhum tipo de plantão cadastrado</p>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                Criar Primeiro Tipo
              </button>
            </div>
          ) : (
            <div className="shift-types-table-container">
              <table className="shift-types-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Empresa</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftTypes.map((type) => (
                    <tr key={type.id}>
                      <td>{type.name}</td>
                      <td>{type.companyName}</td>
                      <td>{type.description || "-"}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Editar" onClick={() => openEditModal(type)}>
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
                            onClick={() => handleDeleteShiftType(type.id)}
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

        {/* Modal de Adicionar */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Novo Tipo de Plantão</h2>
                <button className="btn-close" onClick={() => setShowAddModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleAddShiftType}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Nome do Tipo</label>
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
                    <label htmlFor="companyId">Empresa</label>
                    <select
                      id="companyId"
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descrição (opcional)</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Editar */}
        {showEditModal && currentShiftType && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Editar Tipo de Plantão</h2>
                <button className="btn-close" onClick={() => setShowEditModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEditShiftType}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="edit-name">Nome do Tipo</label>
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
                    <label htmlFor="edit-companyId">Empresa</label>
                    <select
                      id="edit-companyId"
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-description">Descrição (opcional)</label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    ></textarea>
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

export default ShiftTypes

