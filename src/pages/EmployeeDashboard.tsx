"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import { useGeolocation } from "../hooks/useGeolocation"
import Layout from "../components/Layout"
import "../styles/pages/EmployeeDashboard.css"

interface TimeEntry {
  id: string
  type: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT"
  timestamp: string
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  createdAt: string
}

function EmployeeDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [lastEntry, setLastEntry] = useState<TimeEntry | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [geoError, setGeoError] = useState<string | null>(null)

  // Obter a geolocalização
  const geolocation = useGeolocation()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchTodayEntries = async () => {
      try {
        setLoading(true)
        const response = await api.get("/time-entries/today")
        setTodayEntries(response.data)

        // Determinar a última entrada
        if (response.data.length > 0) {
          setLastEntry(response.data[response.data.length - 1])
        }
      } catch (error) {
        console.error("Erro ao buscar registros de hoje:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayEntries()
  }, [])

  const handleTimeEntry = async (type: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT") => {
    try {
      // Verificar se a geolocalização está disponível
      if (geolocation.error) {
        setGeoError(geolocation.error)
        return
      }

      // Preparar dados com geolocalização
      const entryData = {
        type,
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        accuracy: geolocation.accuracy,
      }

      const response = await api.post("/time-entries", entryData)

      // Atualizar a lista de entradas
      setTodayEntries([...todayEntries, response.data])
      setLastEntry(response.data)
      setGeoError(null)
    } catch (error) {
      console.error("Erro ao registrar ponto:", error)
    }
  }

  const getNextActionType = (): "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT" | null => {
    if (!lastEntry) return "CLOCK_IN"

    switch (lastEntry.type) {
      case "CLOCK_IN":
        return "BREAK_START"
      case "BREAK_START":
        return "BREAK_END"
      case "BREAK_END":
        return "CLOCK_OUT"
      case "CLOCK_OUT":
        return null // Jornada finalizada
      default:
        return "CLOCK_IN"
    }
  }

  const formatTime = (date: Date) => {
    return format(date, "HH:mm:ss")
  }

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
        return (
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        )
      case "BREAK_START":
        return (
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
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        )
      case "BREAK_END":
        return (
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
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        )
      case "CLOCK_OUT":
        return (
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="employee-dashboard">
        <div className="dashboard-header">
          <h1>Registro de Ponto</h1>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>

        <div className="dashboard-grid">
          <div className="card time-display-card">
            <div className="time-display">
              <div className="current-time">{formatTime(currentTime)}</div>
              <div className="time-label">Horário atual</div>
            </div>
          </div>

          <div className="card time-entry-actions">
            <h2>Registrar Ponto</h2>

            {/* Mostrar status da geolocalização */}
            <div
              className={`geolocation-status ${geolocation.loading ? "loading" : geolocation.error ? "error" : "success"}`}
            >
              {geolocation.loading ? (
                <>
                  <div className="geo-icon loading">
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
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                  </div>
                  <p>Obtendo sua localização...</p>
                </>
              ) : geolocation.error ? (
                <>
                  <div className="geo-icon error">
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
                  </div>
                  <p>{geolocation.error}</p>
                </>
              ) : (
                <>
                  <div className="geo-icon success">
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
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <p>Localização obtida (precisão: {Math.round(geolocation.accuracy || 0)}m)</p>
                </>
              )}
            </div>

            {geoError && (
              <div className="error-message">
                {geoError}
                <button className="btn-close" onClick={() => setGeoError(null)}>
                  ×
                </button>
              </div>
            )}

            {loading ? (
              <div className="loading-indicator">
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
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <p>Carregando...</p>
              </div>
            ) : (
              <div className="action-buttons">
                {getNextActionType() === "CLOCK_IN" && (
                  <button
                    className="btn-entry clock-in"
                    onClick={() => handleTimeEntry("CLOCK_IN")}
                    disabled={geolocation.loading || !!geolocation.error}
                  >
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
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Registrar Entrada
                  </button>
                )}

                {getNextActionType() === "BREAK_START" && (
                  <button
                    className="btn-entry break-start"
                    onClick={() => handleTimeEntry("BREAK_START")}
                    disabled={geolocation.loading || !!geolocation.error}
                  >
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
                    Iniciar Intervalo
                  </button>
                )}

                {getNextActionType() === "BREAK_END" && (
                  <button
                    className="btn-entry break-end"
                    onClick={() => handleTimeEntry("BREAK_END")}
                    disabled={geolocation.loading || !!geolocation.error}
                  >
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
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Retornar do Intervalo
                  </button>
                )}

                {getNextActionType() === "CLOCK_OUT" && (
                  <button
                    className="btn-entry clock-out"
                    onClick={() => handleTimeEntry("CLOCK_OUT")}
                    disabled={geolocation.loading || !!geolocation.error}
                  >
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
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Registrar Saída
                  </button>
                )}

                {getNextActionType() === null && (
                  <div className="day-completed">
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
                    <p>Jornada de hoje finalizada!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card today-entries">
            <h2>Registros de Hoje</h2>

            {todayEntries.length === 0 ? (
              <div className="no-entries">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
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
                <p>Nenhum registro hoje</p>
              </div>
            ) : (
              <ul className="entries-list">
                {todayEntries.map((entry) => (
                  <li key={entry.id} className={`entry-item ${entry.type.toLowerCase()}`}>
                    <div className="entry-icon">{getEntryTypeIcon(entry.type)}</div>
                    <div className="entry-details">
                      <span className="entry-type">
                        {entry.type === "CLOCK_IN" && "Entrada"}
                        {entry.type === "BREAK_START" && "Início do Intervalo"}
                        {entry.type === "BREAK_END" && "Fim do Intervalo"}
                        {entry.type === "CLOCK_OUT" && "Saída"}
                      </span>
                      <span className="entry-time">{format(new Date(entry.timestamp), "HH:mm:ss")}</span>
                    </div>
                    {entry.latitude && entry.longitude && (
                      <div className="entry-location" title={`Lat: ${entry.latitude}, Long: ${entry.longitude}`}>
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
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card adjustment-request">
            <h2>Solicitar Ajuste</h2>
            <p>Precisa corrigir algum registro de ponto? Faça uma solicitação de ajuste.</p>
            <button className="btn btn-primary">
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Nova Solicitação
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeDashboard

