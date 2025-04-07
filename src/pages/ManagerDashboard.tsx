"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import Layout from "../components/Layout"

interface TeamMember {
  id: string
  name: string
  email: string
  status: "PRESENT" | "ABSENT" | "BREAK" | "NOT_STARTED"
  lastEntry?: {
    type: string
    timestamp: string
  }
}

interface AdjustmentRequest {
  id: string
  userId: string
  userName: string
  date: string
  type: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
}

function ManagerDashboard() {
  const {} = useAuth() // Removendo user não utilizado
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingAdjustments, setPendingAdjustments] = useState<AdjustmentRequest[]>([])
  const [currentDate] = useState(new Date())

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [teamResponse, adjustmentsResponse] = await Promise.all([
          api.get("/manager/team"),
          api.get("/manager/adjustments?status=PENDING"),
        ])

        setTeamMembers(teamResponse.data)
        setPendingAdjustments(adjustmentsResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "status-present"
      case "ABSENT":
        return "status-absent"
      case "BREAK":
        return "status-break"
      case "NOT_STARTED":
        return "status-not-started"
      default:
        return ""
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "Presente"
      case "ABSENT":
        return "Ausente"
      case "BREAK":
        return "Em intervalo"
      case "NOT_STARTED":
        return "Não iniciou"
      default:
        return status
    }
  }

  return (
    <Layout>
      <div className="manager-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard do Gestor</h1>
            <p className="dashboard-date">{format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon present">
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Presentes</h3>
              <p className="stat-value">{teamMembers.filter((member) => member.status === "PRESENT").length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon break">
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
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Em Intervalo</h3>
              <p className="stat-value">{teamMembers.filter((member) => member.status === "BREAK").length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon absent">
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
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Ausentes</h3>
              <p className="stat-value">{teamMembers.filter((member) => member.status === "ABSENT").length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon not-started">
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
            <div className="stat-info">
              <h3>Não Iniciaram</h3>
              <p className="stat-value">{teamMembers.filter((member) => member.status === "NOT_STARTED").length}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card team-status">
            <div className="card-header">
              <h2>Status da Equipe</h2>
              <button className="btn btn-secondary">
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
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                Exportar Relatório
              </button>
            </div>

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
                <p>Carregando dados da equipe...</p>
              </div>
            ) : (
              <div className="team-list">
                {teamMembers.length === 0 ? (
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
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <p>Nenhum membro na equipe</p>
                  </div>
                ) : (
                  <table className="team-table">
                    <thead>
                      <tr>
                        <th>Funcionário</th>
                        <th>Status</th>
                        <th>Último Registro</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="member-info">
                            <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                            <div className="member-details">
                              <span className="member-name">{member.name}</span>
                              <span className="member-email">{member.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusColor(member.status)}`}>
                              {getStatusText(member.status)}
                            </span>
                          </td>
                          <td>
                            {member.lastEntry ? (
                              <div className="last-entry">
                                <span className="entry-time">
                                  {format(new Date(member.lastEntry.timestamp), "HH:mm")}
                                </span>
                                <span className="entry-type">
                                  {member.lastEntry.type === "CLOCK_IN" && "Entrada"}
                                  {member.lastEntry.type === "BREAK_START" && "Início do Intervalo"}
                                  {member.lastEntry.type === "BREAK_END" && "Fim do Intervalo"}
                                  {member.lastEntry.type === "CLOCK_OUT" && "Saída"}
                                </span>
                              </div>
                            ) : (
                              <span className="no-entry">Nenhum registro</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" title="Ver detalhes">
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
                              <button className="btn-icon" title="Enviar mensagem">
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
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          <div className="card pending-adjustments">
            <div className="card-header">
              <h2>Ajustes Pendentes</h2>
              <button className="btn btn-primary" onClick={() => (window.location.href = "/adjustments")}>
                Ver Todos
              </button>
            </div>

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
                <p>Carregando ajustes pendentes...</p>
              </div>
            ) : (
              <>
                {pendingAdjustments.length > 0 ? (
                  <div className="adjustments-list">
                    {pendingAdjustments.slice(0, 5).map((adjustment) => (
                      <div key={adjustment.id} className="adjustment-item">
                        <div className="adjustment-info">
                          <div className="adjustment-user">{adjustment.userName}</div>
                          <div className="adjustment-details">
                            <span className="adjustment-date">{format(new Date(adjustment.date), "dd/MM/yyyy")}</span>
                            <span className="adjustment-type">
                              {adjustment.type === "CLOCK_IN" && "Entrada"}
                              {adjustment.type === "BREAK_START" && "Início do Intervalo"}
                              {adjustment.type === "BREAK_END" && "Fim do Intervalo"}
                              {adjustment.type === "CLOCK_OUT" && "Saída"}
                            </span>
                          </div>
                        </div>
                        <div className="adjustment-actions">
                          <button className="btn-icon approve" title="Aprovar">
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
                          <button className="btn-icon reject" title="Rejeitar">
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
                        </div>
                      </div>
                    ))}
                    {pendingAdjustments.length > 5 && (
                      <div className="view-more">
                        <a href="/adjustments">Ver mais {pendingAdjustments.length - 5} ajustes pendentes</a>
                      </div>
                    )}
                  </div>
                ) : (
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
                    <p>Nenhum ajuste pendente</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ManagerDashboard

