"use client"

import { useState, useEffect, useRef } from "react"
import { format, differenceInMinutes, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import { useGeolocation } from "../hooks/useGeolocation"
import Layout from "../components/Layout"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Modal from "../components/ui/Modal"
import Camera from "../components/ui/Camera"
import LocationOption from "../components/ui/LocationOption"
import { Home, Building2, MapPin, CameraIcon } from "lucide-react"

interface TimeEntry {
  id: string
  type: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT"
  timestamp: string
  latitude?: number | null
  longitude?: number | null
  accuracy?: number | null
  createdAt: string
  address?: string | null
  photo?: string | null
  location?: "casa" | "escritorio" | "outros"
}

function EmployeeDashboard() {
  const {} = useAuth() // Removendo user não utilizado
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [lastEntry, setLastEntry] = useState<TimeEntry | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [geoError, setGeoError] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [addressLoading, setAddressLoading] = useState(false)
  const [todaySummary, setTodaySummary] = useState({
    hoursWorked: "00:00",
    breakTime: "00:00",
    status: "Em andamento",
  })
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const mapRef = useRef<HTMLDivElement>(null)

  // Estados para o modal de captura de foto
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<"casa" | "escritorio" | "outros" | null>(null)
  const [pendingEntryType, setPendingEntryType] = useState<
    "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT" | null
  >(null)

  // Obter a geolocalização
  const geolocation = useGeolocation()

  // Atualizar o relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Buscar registros de hoje
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

        // Calcular resumo do dia
        calculateTodaySummary(response.data)
      } catch (error) {
        console.error("Erro ao buscar registros de hoje:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayEntries()
  }, [])

  // Obter endereço a partir das coordenadas - com timeout maior
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const getAddressFromCoordinates = async () => {
      if (!geolocation.latitude || !geolocation.longitude || geolocation.error) {
        return
      }

      try {
        setAddressLoading(true)
        // Usando a API Nominatim do OpenStreetMap para geocodificação reversa
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geolocation.latitude}&lon=${geolocation.longitude}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": "pt-BR" } },
        )
        const data = await response.json()

        if (data && data.display_name) {
          // Formatando o endereço para ser mais legível
          const addressParts = [
            data.address.road,
            data.address.house_number,
            data.address.suburb,
            data.address.city_district,
            data.address.city,
            data.address.state,
          ].filter(Boolean)

          setAddress(addressParts.join(", "))
        }
      } catch (error) {
        console.error("Erro ao obter endereço:", error)
        setAddress("Não foi possível determinar o endereço")
      } finally {
        setAddressLoading(false)
      }
    }

    // Aumentar o timeout para 10 segundos
    if (geolocation.latitude && geolocation.longitude && !geolocation.error) {
      timeoutId = setTimeout(() => {
        getAddressFromCoordinates()
      }, 1000) // 1 segundo de delay para evitar muitas requisições
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [geolocation.latitude, geolocation.longitude, geolocation.error])

  // Carregar mapa quando as coordenadas estiverem disponíveis
  useEffect(() => {
    if (mapRef.current && geolocation.latitude && geolocation.longitude && !geolocation.error) {
      // Criando o iframe do mapa do OpenStreetMap
      const iframe = document.createElement("iframe")
      iframe.width = "100%"
      iframe.height = "100%"
      iframe.style.border = "none"
      iframe.style.borderRadius = "var(--border-radius-lg)"
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${geolocation.longitude - 0.002},${geolocation.latitude - 0.002},${geolocation.longitude + 0.002},${geolocation.latitude + 0.002}&layer=mapnik&marker=${geolocation.latitude},${geolocation.longitude}`

      // Limpar o conteúdo anterior e adicionar o iframe
      mapRef.current.innerHTML = ""
      mapRef.current.appendChild(iframe)
    }
  }, [geolocation.latitude, geolocation.longitude, geolocation.error])

  // Calcular resumo do dia com base nos registros
  const calculateTodaySummary = (entries: TimeEntry[]) => {
    if (entries.length === 0) {
      setTodaySummary({
        hoursWorked: "00:00",
        breakTime: "00:00",
        status: "Não iniciado",
      })
      return
    }

    let totalWorkMinutes = 0
    let totalBreakMinutes = 0
    let status = "Em andamento"

    // Organizar entradas em pares
    for (let i = 0; i < entries.length; i += 2) {
      const start = entries[i]
      const end = entries[i + 1]

      if (start && end) {
        const startTime = parseISO(start.timestamp)
        const endTime = parseISO(end.timestamp)
        const diffMinutes = differenceInMinutes(endTime, startTime)

        if (start.type === "CLOCK_IN" && end.type === "BREAK_START") {
          totalWorkMinutes += diffMinutes
        } else if (start.type === "BREAK_START" && end.type === "BREAK_END") {
          totalBreakMinutes += diffMinutes
        } else if (start.type === "BREAK_END" && end.type === "CLOCK_OUT") {
          totalWorkMinutes += diffMinutes
        }
      }
    }

    // Se a última entrada não tem par, calcular até agora
    if (entries.length % 2 !== 0) {
      const lastEntry = entries[entries.length - 1]
      const lastTime = parseISO(lastEntry.timestamp)
      const diffMinutes = differenceInMinutes(new Date(), lastTime)

      if (lastEntry.type === "CLOCK_IN" || lastEntry.type === "BREAK_END") {
        totalWorkMinutes += diffMinutes
      } else if (lastEntry.type === "BREAK_START") {
        totalBreakMinutes += diffMinutes
      }
    }

    // Verificar se a jornada está completa
    if (entries.length >= 4 && entries[entries.length - 1].type === "CLOCK_OUT") {
      status = "Concluído"
    }

    // Formatar horas e minutos
    const formatMinutes = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    }

    setTodaySummary({
      hoursWorked: formatMinutes(totalWorkMinutes),
      breakTime: formatMinutes(totalBreakMinutes),
      status,
    })
  }

  // Iniciar processo de registro de ponto com foto
  const initiateTimeEntry = (type: "CLOCK_IN" | "BREAK_START" | "BREAK_END" | "CLOCK_OUT") => {
    // Verificar se a geolocalização está disponível
    if (geolocation.error) {
      setGeoError(geolocation.error)
      return
    }

    setPendingEntryType(type)
    setShowPhotoModal(true)
  }

  // Finalizar o registro de ponto após capturar a foto e selecionar a localização
  const finalizeTimeEntry = async () => {
    if (!pendingEntryType || !selectedLocation) return

    try {
      // Preparar dados com geolocalização, foto e localização selecionada
      const entryData = {
        type: pendingEntryType,
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        accuracy: geolocation.accuracy,
        address: address,
        photo: capturedImage,
        location: selectedLocation,
      }

      const response = await api.post("/time-entries", entryData)

      // Atualizar a lista de entradas
      const newEntry = response.data
      const updatedEntries = [...todayEntries, newEntry]
      setTodayEntries(updatedEntries)
      setLastEntry(newEntry)
      setGeoError(null)

      // Atualizar o resumo do dia
      calculateTodaySummary(updatedEntries)

      // Mostrar notificação de sucesso
      showSuccessNotification(pendingEntryType)

      // Limpar estados do modal
      setShowPhotoModal(false)
      setCapturedImage(null)
      setSelectedLocation(null)
      setPendingEntryType(null)
    } catch (error) {
      console.error("Erro ao registrar ponto:", error)
      setNotificationMessage("Erro ao registrar ponto. Tente novamente.")
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 5000)
    }
  }

  const showSuccessNotification = (type: string) => {
    let message = ""
    switch (type) {
      case "CLOCK_IN":
        message = "Entrada registrada com sucesso!"
        break
      case "BREAK_START":
        message = "Intervalo iniciado com sucesso!"
        break
      case "BREAK_END":
        message = "Retorno do intervalo registrado!"
        break
      case "CLOCK_OUT":
        message = "Saída registrada com sucesso!"
        break
    }

    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
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
        {/* Notificação flutuante */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              className="notification"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <div className="notification-content">
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
                <span>{notificationMessage}</span>
              </div>
              <button className="notification-close" onClick={() => setShowNotification(false)}>
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
          {/* Card do relógio */}
          <Card title="Horário atual" className="time-display-card">
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
            </motion.div>
          </Card>

          {/* Card de resumo do dia */}
          <Card title="Resumo do Dia" className="today-summary">
            <div className="summary-content">
              <div className="summary-item">
                <div className="summary-icon hours">
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
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="summary-details">
                  <span className="summary-label">Horas Trabalhadas</span>
                  <span className="summary-value">{todaySummary.hoursWorked}</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon break">
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
                </div>
                <div className="summary-details">
                  <span className="summary-label">Tempo de Intervalo</span>
                  <span className="summary-value">{todaySummary.breakTime}</span>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon status">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="summary-details">
                  <span className="summary-label">Status</span>
                  <span className="summary-value">{todaySummary.status}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Card de ações de registro */}
          <Card title="Registrar Ponto" className="time-entry-actions">
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

            {/* Exibir endereço */}
            {!geolocation.error && !geolocation.loading && (
              <motion.div
                className="address-display"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.3 }}
              >
                <div className="address-icon">
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
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                {addressLoading ? (
                  <p>Obtendo endereço...</p>
                ) : (
                  <p className="address-text">{address || "Endereço não disponível"}</p>
                )}
              </motion.div>
            )}

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
                  <Button
                    variant="primary"
                    onClick={() => initiateTimeEntry("CLOCK_IN")}
                    disabled={geolocation.loading || !!geolocation.error}
                    fullWidth
                    icon={
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
                    }
                  >
                    Registrar Entrada
                  </Button>
                )}

                {getNextActionType() === "BREAK_START" && (
                  <Button
                    variant="secondary"
                    onClick={() => initiateTimeEntry("BREAK_START")}
                    disabled={geolocation.loading || !!geolocation.error}
                    fullWidth
                    icon={
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
                    }
                  >
                    Iniciar Intervalo
                  </Button>
                )}

                {getNextActionType() === "BREAK_END" && (
                  <Button
                    variant="primary"
                    onClick={() => initiateTimeEntry("BREAK_END")}
                    disabled={geolocation.loading || !!geolocation.error}
                    fullWidth
                    icon={
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
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                      </svg>
                    }
                  >
                    Retornar do Intervalo
                  </Button>
                )}

                {getNextActionType() === "CLOCK_OUT" && (
                  <Button
                    variant="danger"
                    onClick={() => initiateTimeEntry("CLOCK_OUT")}
                    disabled={geolocation.loading || !!geolocation.error}
                    fullWidth
                    icon={
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
                    }
                  >
                    Registrar Saída
                  </Button>
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
          </Card>

          {/* Card do mapa de localização */}
          <Card title="Sua Localização" className="location-map">
            <div className="map-container" ref={mapRef}>
              {(geolocation.loading || geolocation.error) && (
                <div className="map-placeholder">
                  {geolocation.loading ? (
                    <div className="map-loading">
                      <motion.svg
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                      </motion.svg>
                      <p>Carregando mapa...</p>
                    </div>
                  ) : (
                    <div className="map-error">
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
                      <p>Não foi possível carregar o mapa</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Card de registros de hoje */}
          <Card title="Registros de Hoje" className="today-entries">
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
                      {entry.address && <span className="entry-address">{entry.address}</span>}
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
          </Card>

          {/* Card de solicitação de ajuste */}
          <Card title="Solicitar Ajuste" className="adjustment-request">
            <p>Precisa corrigir algum registro de ponto? Faça uma solicitação de ajuste.</p>
            <Button
              variant="primary"
              icon={
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
              }
            >
              Nova Solicitação
            </Button>
          </Card>
        </motion.div>

        {/* Modal de captura de foto */}
        <Modal
          isOpen={showPhotoModal}
          onClose={() => {
            setShowPhotoModal(false)
            setCapturedImage(null)
            setSelectedLocation(null)
            setPendingEntryType(null)
          }}
          title="Registrar Ponto"
          size="md"
        >
          {!capturedImage ? (
            <Camera
              onCapture={(imageSrc) => setCapturedImage(imageSrc)}
              onCancel={() => {
                setShowPhotoModal(false)
                setPendingEntryType(null)
              }}
            />
          ) : (
            <div className="photo-confirmation">
              <img src={capturedImage || "/placeholder.svg"} alt="Foto capturada" className="captured-image" />

              <h3 className="text-sm font-medium text-gray-700 mb-2">Selecione sua localização:</h3>

              <div className="location-options">
                <LocationOption
                  icon={<Home size={24} />}
                  label="Casa"
                  isSelected={selectedLocation === "casa"}
                  onClick={() => setSelectedLocation("casa")}
                />

                <LocationOption
                  icon={<Building2 size={24} />}
                  label="Escritório"
                  isSelected={selectedLocation === "escritorio"}
                  onClick={() => setSelectedLocation("escritorio")}
                />

                <LocationOption
                  icon={<MapPin size={24} />}
                  label="Outros"
                  isSelected={selectedLocation === "outros"}
                  onClick={() => setSelectedLocation("outros")}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setCapturedImage(null)} icon={<CameraIcon size={18} />}>
                  Nova Foto
                </Button>

                <Button variant="primary" onClick={finalizeTimeEntry} disabled={!selectedLocation} fullWidth>
                  Confirmar Registro
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </motion.div>
    </Layout>
  )
}

export default EmployeeDashboard
