"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import { useGeolocation } from "../hooks/useGeolocation"
import Layout from "../components/Layout"
import { motion, AnimatePresence } from "framer-motion"

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
  const {} = useAuth() // Removendo user não utilizado
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <Layout>
      <motion.div
        className="employee-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Registro de Ponto</h1>
          <motion.div
            className="date-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {formatDate(currentTime)}
          </motion.div>
        </motion.div>

        <motion.div className="dashboard-grid" variants={container} initial="hidden" animate="show">
          <motion.div
            className="card time-display-card"
            variants={item}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div className="time-display">
              <motion.div
                className="current-time"
                animate={{
                  scale: [1, 1.03, 1],
                  transition: {
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  },
                }}
              >
                {formatTime(currentTime)}
              </motion.div>
              <div className="time-label">Horário atual</div>
            </motion.div>
          </motion.div>

          <motion.div
            className="card time-entry-actions"
            variants={item}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2>Registrar Ponto</motion.h2>

            {/* Mostrar status da geolocalização */}
            <motion.div
              className={`geolocation-status ${geolocation.loading ? "loading" : geolocation.error ? "error" : "success"}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
            >
              {geolocation.loading ? (
                <>
                  <motion.div
                    className="geo-icon loading"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                  </motion.div>
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
                  <motion.div
                    className="geo-icon success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
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
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </motion.div>
                  <p>Localização obtida (precisão: {Math.round(geolocation.accuracy || 0)}m)</p>
                </>
              )}
            </motion.div>

            <AnimatePresence>
              {geoError && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {geoError}
                  <motion.button
                    className="btn-close"
                    onClick={() => setGeoError(null)}
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <motion.div className="loading-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
                </motion.svg>
                <p>Carregando...</p>
              </motion.div>
            ) : (
              <motion.div
                className="action-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {getNextActionType() === "CLOCK_IN" && (
                  <motion.button
                    className="btn-entry clock-in"
                    onClick={() => handleTimeEntry("CLOCK_IN")}
                    disabled={geolocation.loading || !!geolocation.error}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
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
                    </motion.svg>
                    Registrar Entrada
                  </motion.button>
                )}

                {getNextActionType() === "BREAK_START" && (
                  <motion.button
                    className="btn-entry break-start"
                    onClick={() => handleTimeEntry("BREAK_START")}
                    disabled={geolocation.loading || !!geolocation.error}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
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
                    </motion.svg>
                    Iniciar Intervalo
                  </motion.button>
                )}

                {getNextActionType() === "BREAK_END" && (
                  <motion.button
                    className="btn-entry break-end"
                    onClick={() => handleTimeEntry("BREAK_END")}
                    disabled={geolocation.loading || !!geolocation.error}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
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
                    </motion.svg>
                    Retornar do Intervalo
                  </motion.button>
                )}

                {getNextActionType() === "CLOCK_OUT" && (
                  <motion.button
                    className="btn-entry clock-out"
                    onClick={() => handleTimeEntry("CLOCK_OUT")}
                    disabled={geolocation.loading || !!geolocation.error}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
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
                    </motion.svg>
                    Registrar Saída
                  </motion.button>
                )}

                {getNextActionType() === null && (
                  <motion.div
                    className="day-completed"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <motion.svg
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
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
                    </motion.svg>
                    <p>Jornada de hoje finalizada!</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="card today-entries"
            variants={item}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <h2>Registros de Hoje</h2>

            {todayEntries.length === 0 ? (
              <motion.div
                className="no-entries"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
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
                </motion.svg>
                <p>Nenhum registro hoje</p>
              </motion.div>
            ) : (
              <motion.ul className="entries-list" variants={container} initial="hidden" animate="show">
                {todayEntries.map((entry, index) => (
                  <motion.li
                    key={entry.id}
                    className={`entry-item ${entry.type.toLowerCase()}`}
                    variants={item}
                    custom={index}
                    whileHover={{ x: 5 }}
                  >
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
                      <motion.div
                        className="entry-location"
                        title={`Lat: ${entry.latitude}, Long: ${entry.longitude}`}
                        whileHover={{ scale: 1.2 }}
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
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </motion.div>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>

          <motion.div
            className="card adjustment-request"
            variants={item}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <h2>Solicitar Ajuste</h2>
            <p>Precisa corrigir algum registro de ponto? Faça uma solicitação de ajuste.</p>
            <motion.button className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  )
}

export default EmployeeDashboard

