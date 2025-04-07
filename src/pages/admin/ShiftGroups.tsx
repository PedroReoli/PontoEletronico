"use client"

import type React from "react"

import { useState, useEffect } from "react"
import api from "../../services/api"
import Layout from "../../components/Layout"

interface ShiftGroup {
  id: string
  name: string
  startTime: string
  endTime: string
  breakDuration: number
  companyId: string
  companyName: string
  createdAt: string
  updatedAt: string
}

function ShiftGroups() {
  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentShiftGroup, setCurrentShiftGroup] = useState<ShiftGroup | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    breakDuration: 60,
    companyId: "",
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [shiftGroupsResponse, companiesResponse] = await Promise.all([
          api.get("/admin/shift-groups"),
          api.get("/admin/companies"),
        ])

        setShiftGroups(shiftGroupsResponse.data)
        setCompanies(companiesResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "breakDuration" ? Number.parseInt(value) : value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "09:00",
      endTime: "18:00",
      breakDuration: 60,
      companyId: "",
    })
    setCurrentShiftGroup(null)
  }

  const handleAddShiftGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post("/admin/shift-groups", formData)
      setShiftGroups([...shiftGroups, response.data])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao adicionar grupo de jornada:", error)
    }
  }

  const handleEditShiftGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentShiftGroup) return

    try {
      const response = await api.put(`/admin/shift-groups/${currentShiftGroup.id}`, formData)
      setShiftGroups(shiftGroups.map((group) => (group.id === currentShiftGroup.id ? response.data : group)))
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao editar grupo de jornada:", error)
    }
  }

  const handleDeleteShiftGroup = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este grupo de jornada?")) return

    try {
      await api.delete(`/admin/shift-groups/${id}`)
      setShiftGroups(shiftGroups.filter((group) => group.id !== id))
    } catch (error) {
      console.error("Erro ao excluir grupo de jornada:", error)
    }
  }

  const openEditModal = (shiftGroup: ShiftGroup) => {
    setCurrentShiftGroup(shiftGroup)
    setFormData({
      name: shiftGroup.name,
      startTime: shiftGroup.startTime,
      endTime: shiftGroup.endTime,
      breakDuration: shiftGroup.breakDuration,
      companyId: shiftGroup.companyId,
    })
    setShowEditModal(true)
  }

  const formatBreakDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours > 0 ? `${hours}h` : ""}${mins > 0 ? ` ${mins}min` : ""}`
  }

  return (
    <Layout>
      <div className="shift-groups-page">
        <div className="page-header">
          <h1>Grupos de Jornada</h1>
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
            Novo Grupo
          </button>
        </div>

        <div className="card shift-groups-card">
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
              <p>Carregando grupos de jornada...</p>
            </div>
          ) : shiftGroups.length === 0 ? (
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p>Nenhum grupo de jornada cadastrado</p>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                Criar Primeiro Grupo
              </button>
            </div>
          ) : (
            <div className="shift-groups-table-container">
              <table className="shift-groups-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Empresa</th>
                    <th>Horário</th>
                    <th>Intervalo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftGroups.map((group) => (
                    <tr key={group.id}>
                      <td>{group.name}</td>
                      <td>{group.companyName}</td>
                      <td>
                        {group.startTime} - {group.endTime}
                      </td>
                      <td>{formatBreakDuration(group.breakDuration)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Editar" onClick={() => openEditModal(group)}>
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
                            onClick={() => handleDeleteShiftGroup(group.id)}
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
      </div>

      {/* Modal de Adicionar */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Novo Grupo de Jornada</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddShiftGroup}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Nome do Grupo</label>
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime">Horário de Início</label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endTime">Horário de Término</label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="breakDuration">Duração do Intervalo (minutos)</label>
                  <input
                    type="number"
                    id="breakDuration"
                    name="breakDuration"
                    min="0"
                    max="240"
                    value={formData.breakDuration}
                    onChange={handleInputChange}
                    required
                  />
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
      {showEditModal && currentShiftGroup && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Editar Grupo de Jornada</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleEditShiftGroup}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-name">Nome do Grupo</label>
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-startTime">Horário de Início</label>
                    <input
                      type="time"
                      id="edit-startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-endTime">Horário de Término</label>
                    <input
                      type="time"
                      id="edit-endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-breakDuration">Duração do Intervalo (minutos)</label>
                  <input
                    type="number"
                    id="edit-breakDuration"
                    name="breakDuration"
                    min="0"
                    max="240"
                    value={formData.breakDuration}
                    onChange={handleInputChange}
                    required
                  />
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
    </Layout>
  )
}

export default ShiftGroups

