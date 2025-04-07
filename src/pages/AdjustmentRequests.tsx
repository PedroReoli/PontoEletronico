"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import api from "../services/api"
import Layout from "../components/Layout"
// Remover esta linha
// import "../styles/pages/AdjustmentRequests.css"

interface AdjustmentRequest {
  id: string
  userId: string
  userName: string
  date: string
  entryType: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT"
  requestedTime: string
  reason: string
  attachmentUrl?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  responseComment?: string
  responseDate?: string
}

function AdjustmentRequests() {
  const [adjustments, setAdjustments] = useState<AdjustmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("PENDING")
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentRequest | null>(null)
  const [responseComment, setResponseComment] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchAdjustments()
  }, [filter])

  const fetchAdjustments = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/manager/adjustments?status=${filter}`)
      setAdjustments(response.data)
    } catch (error) {
      console.error("Erro ao buscar ajustes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (adjustment: AdjustmentRequest) => {
    setSelectedAdjustment(adjustment)
    setResponseComment("")
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAdjustment(null)
  }

  const handleApprove = async () => {
    if (!selectedAdjustment) return

    try {
      setActionLoading(true)
      await api.put(`/manager/adjustments/${selectedAdjustment.id}/approve`, {
        responseComment,
      })

      // Atualizar a lista
      fetchAdjustments()
      handleCloseModal()
    } catch (error) {
      console.error("Erro ao aprovar ajuste:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedAdjustment) return

    try {
      setActionLoading(true)
      await api.put(`/manager/adjustments/${selectedAdjustment.id}/reject`, {
        responseComment,
      })

      // Atualizar a lista
      fetchAdjustments()
      handleCloseModal()
    } catch (error) {
      console.error("Erro ao rejeitar ajuste:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getEntryTypeText = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
        return "Entrada"
      case "BREAK_START":
        return "Início do Intervalo"
      case "BREAK_END":
        return "Fim do Intervalo"
      case "CLOCK_OUT":
        return "Saída"
      default:
        return type
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "status-pending"
      case "APPROVED":
        return "status-approved"
      case "REJECTED":
        return "status-rejected"
      default:
        return ""
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente"
      case "APPROVED":
        return "Aprovado"
      case "REJECTED":
        return "Rejeitado"
      default:
        return status
    }
  }

  return (
    <Layout>
      <div className="adjustments-page">
        <div className="page-header">
          <h1>Solicitações de Ajuste</h1>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "PENDING" ? "active" : ""}`}
              onClick={() => setFilter("PENDING")}
            >
              Pendentes
            </button>
            <button
              className={`filter-tab ${filter === "APPROVED" ? "active" : ""}`}
              onClick={() => setFilter("APPROVED")}
            >
              Aprovados
            </button>
            <button
              className={`filter-tab ${filter === "REJECTED" ? "active" : ""}`}
              onClick={() => setFilter("REJECTED")}
            >
              Rejeitados
            </button>
            <button className={`filter-tab ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
              Todos
            </button>
          </div>
        </div>

        <div className="card adjustments-card">
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
              <p>Carregando solicitações...</p>
            </div>
          ) : adjustments.length === 0 ? (
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
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              <p>Nenhuma solicitação {filter === "ALL" ? "" : getStatusText(filter).toLowerCase()} encontrada</p>
            </div>
          ) : (
            <div className="adjustments-table-container">
              <table className="adjustments-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Horário Solicitado</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adjustment) => (
                    <tr key={adjustment.id}>
                      <td>{adjustment.userName}</td>
                      <td>{format(new Date(adjustment.date), "dd/MM/yyyy")}</td>
                      <td>{getEntryTypeText(adjustment.entryType)}</td>
                      <td>{adjustment.requestedTime}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(adjustment.status)}`}>
                          {getStatusText(adjustment.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            title="Ver detalhes"
                            onClick={() => handleViewDetails(adjustment)}
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
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          {adjustment.status === "PENDING" && (
                            <>
                              <button
                                className="btn-icon approve"
                                title="Aprovar"
                                onClick={() => handleViewDetails(adjustment)}
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
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button
                                className="btn-icon reject"
                                title="Rejeitar"
                                onClick={() => handleViewDetails(adjustment)}
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
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </>
                          )}
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

      {/* Modal de Detalhes */}
      {showModal && selectedAdjustment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Detalhes da Solicitação</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <span className="detail-label">Funcionário:</span>
                <span className="detail-value">{selectedAdjustment.userName}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Data:</span>
                <span className="detail-value">{format(new Date(selectedAdjustment.date), "dd/MM/yyyy")}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Tipo de Registro:</span>
                <span className="detail-value">{getEntryTypeText(selectedAdjustment.entryType)}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Horário Solicitado:</span>
                <span className="detail-value">{selectedAdjustment.requestedTime}</span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${getStatusBadgeClass(selectedAdjustment.status)}`}>
                  {getStatusText(selectedAdjustment.status)}
                </span>
              </div>
              <div className="detail-group">
                <span className="detail-label">Motivo:</span>
                <p className="detail-reason">{selectedAdjustment.reason}</p>
              </div>

              {selectedAdjustment.attachmentUrl && (
                <div className="detail-group">
                  <span className="detail-label">Anexo:</span>
                  <a
                    href={selectedAdjustment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-link"
                  >
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Ver anexo
                  </a>
                </div>
              )}

              {selectedAdjustment.status !== "PENDING" && (
                <>
                  <div className="detail-group">
                    <span className="detail-label">Resposta:</span>
                    <p className="detail-reason">{selectedAdjustment.responseComment || "Sem comentários"}</p>
                  </div>
                  {selectedAdjustment.responseDate && (
                    <div className="detail-group">
                      <span className="detail-label">Data da resposta:</span>
                      <span className="detail-value">
                        {format(new Date(selectedAdjustment.responseDate), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>
                  )}
                </>
              )}

              {selectedAdjustment.status === "PENDING" && (
                <div className="response-form">
                  <label htmlFor="responseComment">Comentário (opcional):</label>
                  <textarea
                    id="responseComment"
                    value={responseComment}
                    onChange={(e) => setResponseComment(e.target.value)}
                    placeholder="Adicione um comentário para sua decisão..."
                    rows={3}
                  ></textarea>

                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={handleCloseModal} disabled={actionLoading}>
                      Cancelar
                    </button>
                    <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading}>
                      {actionLoading ? "Processando..." : "Rejeitar"}
                    </button>
                    <button className="btn btn-success" onClick={handleApprove} disabled={actionLoading}>
                      {actionLoading ? "Processando..." : "Aprovar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default AdjustmentRequests

