"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import api from "../services/api"
import Layout from "../components/Layout"

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
      <section className="adjustment-section">
        <header className="adjustment-header">
          <h1 className="adjustment-title">Solicitações de Ajuste</h1>
          <nav className="adjustment-nav">
            <ul className="filter-list">
              <li className="filter-item">
                <button
                  className={`filter-button ${filter === "PENDING" ? "active" : ""}`}
                  onClick={() => setFilter("PENDING")}
                >
                  Pendentes
                </button>
              </li>
              <li className="filter-item">
                <button
                  className={`filter-button ${filter === "APPROVED" ? "active" : ""}`}
                  onClick={() => setFilter("APPROVED")}
                >
                  Aprovados
                </button>
              </li>
              <li className="filter-item">
                <button
                  className={`filter-button ${filter === "REJECTED" ? "active" : ""}`}
                  onClick={() => setFilter("REJECTED")}
                >
                  Rejeitados
                </button>
              </li>
              <li className="filter-item">
                <button
                  className={`filter-button ${filter === "ALL" ? "active" : ""}`}
                  onClick={() => setFilter("ALL")}
                >
                  Todos
                </button>
              </li>
            </ul>
          </nav>
        </header>

        <article className="adjustment-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">Carregando solicitações...</p>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
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
              </div>
              <p className="empty-text">
                Nenhuma solicitação {filter === "ALL" ? "" : getStatusText(filter).toLowerCase()} encontrada
              </p>
            </div>
          ) : (
            <div className="adjustment-list-container">
              <ul className="adjustment-list">
                {adjustments.map((adjustment) => (
                  <li key={adjustment.id} className="adjustment-item">
                    <div className="adjustment-card">
                      <div className="adjustment-card-header">
                        <h3 className="adjustment-user">{adjustment.userName}</h3>
                        <span className={`adjustment-status ${getStatusBadgeClass(adjustment.status)}`}>
                          {getStatusText(adjustment.status)}
                        </span>
                      </div>
                      <div className="adjustment-card-body">
                        <div className="adjustment-info">
                          <div className="info-group">
                            <span className="info-label">Data:</span>
                            <span className="info-value">{format(new Date(adjustment.date), "dd/MM/yyyy")}</span>
                          </div>
                          <div className="info-group">
                            <span className="info-label">Tipo:</span>
                            <span className="info-value">{getEntryTypeText(adjustment.entryType)}</span>
                          </div>
                          <div className="info-group">
                            <span className="info-label">Horário:</span>
                            <span className="info-value">{adjustment.requestedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="adjustment-card-footer">
                        <button
                          className="action-button view"
                          onClick={() => handleViewDetails(adjustment)}
                          title="Ver detalhes"
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
                          <span>Detalhes</span>
                        </button>
                        {adjustment.status === "PENDING" && (
                          <>
                            <button
                              className="action-button approve"
                              onClick={() => handleViewDetails(adjustment)}
                              title="Aprovar"
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
                              <span>Aprovar</span>
                            </button>
                            <button
                              className="action-button reject"
                              onClick={() => handleViewDetails(adjustment)}
                              title="Rejeitar"
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
                              <span>Rejeitar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </section>

      {/* Modal de Detalhes */}
      {showModal && selectedAdjustment && (
        <div className="modal-backdrop">
          <div className="modal-container">
            <header className="modal-header">
              <h2 className="modal-title">Detalhes da Solicitação</h2>
              <button className="modal-close" onClick={handleCloseModal} aria-label="Fechar">
                &times;
              </button>
            </header>
            <div className="modal-content">
              <div className="detail-section">
                <div className="detail-row">
                  <span className="detail-label">Funcionário:</span>
                  <span className="detail-value">{selectedAdjustment.userName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Data:</span>
                  <span className="detail-value">{format(new Date(selectedAdjustment.date), "dd/MM/yyyy")}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tipo de Registro:</span>
                  <span className="detail-value">{getEntryTypeText(selectedAdjustment.entryType)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Horário Solicitado:</span>
                  <span className="detail-value">{selectedAdjustment.requestedTime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-tag ${getStatusBadgeClass(selectedAdjustment.status)}`}>
                    {getStatusText(selectedAdjustment.status)}
                  </span>
                </div>
              </div>

              <div className="reason-section">
                <h3 className="reason-title">Motivo da Solicitação</h3>
                <div className="reason-content">{selectedAdjustment.reason}</div>
              </div>

              {selectedAdjustment.attachmentUrl && (
                <div className="attachment-section">
                  <h3 className="attachment-title">Anexo</h3>
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
                    Ver documento anexado
                  </a>
                </div>
              )}

              {selectedAdjustment.status !== "PENDING" && (
                <div className="response-section">
                  <h3 className="response-title">Resposta</h3>
                  <div className="response-content">
                    {selectedAdjustment.responseComment || "Sem comentários adicionais."}
                  </div>
                  {selectedAdjustment.responseDate && (
                    <div className="response-date">
                      Respondido em {format(new Date(selectedAdjustment.responseDate), "dd/MM/yyyy HH:mm")}
                    </div>
                  )}
                </div>
              )}

              {selectedAdjustment.status === "PENDING" && (
                <form className="response-form">
                  <div className="form-group">
                    <label htmlFor="responseComment" className="form-label">
                      Comentário (opcional):
                    </label>
                    <textarea
                      id="responseComment"
                      className="form-textarea"
                      value={responseComment}
                      onChange={(e) => setResponseComment(e.target.value)}
                      placeholder="Adicione um comentário para sua decisão..."
                      rows={3}
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="form-button secondary"
                      onClick={handleCloseModal}
                      disabled={actionLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="form-button danger"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processando..." : "Rejeitar"}
                    </button>
                    <button
                      type="button"
                      className="form-button success"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Processando..." : "Aprovar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default AdjustmentRequests