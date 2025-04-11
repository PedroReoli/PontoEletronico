"use client"

import { useState, useEffect, useRef } from "react"
import { format, differenceInMinutes, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import { useGeolocation } from "../hooks/useGeolocation"
import Layout from "../components/Layout"
import { TimeEntryCard } from "../components/ui/TimeEntryCard"
import { NotificationToast } from "../components/ui/NotificationToast"
import { EntryTypeIcon } from "../components/ui/EntryTypeIcon"
import { SummaryItem } from "../components/ui/SummaryItem"
import Modal from "../components/ui/Modal"
import Camera from "../components/ui/Camera"
import LocationOption from "../components/ui/LocationOption"
import {
  Home,
  Building2,
  MapPin,
  CameraIcon,
  Clock,
  Coffee,
  FileEdit,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  MoreHorizontal,
} from "lucide-react"

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

  // Obter endereço a partir das coordenadas
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
      iframe.style.borderRadius = "0.375rem"
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
    return format(date, "dd 'de' MMMM", { locale: ptBR })
  }

  const getEntryTypeLabel = (type: string) => {
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

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
        return "bg-green-100 text-green-800"
      case "BREAK_START":
        return "bg-amber-100 text-amber-800"
      case "BREAK_END":
        return "bg-blue-100 text-blue-800"
      case "CLOCK_OUT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionButtonColor = (type: string | null) => {
    switch (type) {
      case "CLOCK_IN":
        return "bg-green-600 hover:bg-green-700"
      case "BREAK_START":
        return "bg-amber-500 hover:bg-amber-600"
      case "BREAK_END":
        return "bg-blue-600 hover:bg-blue-700"
      case "CLOCK_OUT":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        {/* Notificação flutuante */}
        <NotificationToast
          message={notificationMessage}
          show={showNotification}
          onClose={() => setShowNotification(false)}
        />

        {/* Cabeçalho compacto */}
        <header className="mb-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Registro de Ponto</h1>
            <p className="text-xs text-gray-500">{formatDate(currentTime)}</p>
          </div>
          <div className="clock-pulse text-xl sm:text-2xl font-bold text-gray-800 tabular-nums">
            {formatTime(currentTime)}
          </div>
        </header>

        {/* Grid de cards - layout mais compacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card de resumo do dia */}
          <TimeEntryCard title="Resumo do Dia">
            <div className="space-y-2">
              <SummaryItem
                icon={<Clock size={14} />}
                label="Horas Trabalhadas"
                value={todaySummary.hoursWorked}
                iconColor="text-blue-500"
              />
              <SummaryItem
                icon={<Coffee size={14} />}
                label="Tempo de Intervalo"
                value={todaySummary.breakTime}
                iconColor="text-amber-500"
              />
              <SummaryItem
                icon={<CheckCircle size={14} />}
                label="Status"
                value={todaySummary.status}
                iconColor="text-green-500"
              />
            </div>
          </TimeEntryCard>

          {/* Card de ações de registro */}
          <TimeEntryCard
            title="Registrar Ponto"
            className="sm:col-span-2"
            rightElement={
              geolocation.error ? (
                <span className="text-xs text-red-500 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  Erro de localização
                </span>
              ) : geolocation.loading ? (
                <span className="text-xs text-blue-500 flex items-center">
                  <Loader2 size={12} className="mr-1 animate-spin" />
                  Localizando...
                </span>
              ) : (
                <span className="text-xs text-green-500 flex items-center">
                  <MapPin size={12} className="mr-1" />
                  {Math.round(geolocation.accuracy || 0)}m
                </span>
              )
            }
          >
            {/* Exibir endereço de forma compacta */}
            {!geolocation.error && !geolocation.loading && (
              <div className="mb-2 text-xs text-gray-500 flex items-start">
                <Home size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">
                  {addressLoading ? "Obtendo endereço..." : address || "Endereço não disponível"}
                </span>
              </div>
            )}

            {/* Mensagem de erro */}
            <AnimatePresence>
              {geoError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 p-1.5 bg-red-50 text-red-700 rounded text-xs flex items-center justify-between"
                >
                  <span>{geoError}</span>
                  <button
                    onClick={() => setGeoError(null)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de ação */}
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 size={18} className="animate-spin mr-2 text-blue-500" />
                <p className="text-xs text-gray-500">Carregando...</p>
              </div>
            ) : (
              <div className="flex gap-2">
                {getNextActionType() === "CLOCK_IN" && (
                  <button
                    onClick={() => initiateTimeEntry("CLOCK_IN")}
                    disabled={geolocation.loading || !!geolocation.error}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <EntryTypeIcon type="CLOCK_IN" className="text-white" size={14} />
                    <span>Registrar Entrada</span>
                  </button>
                )}

                {getNextActionType() === "BREAK_START" && (
                  <button
                    onClick={() => initiateTimeEntry("BREAK_START")}
                    disabled={geolocation.loading || !!geolocation.error}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <EntryTypeIcon type="BREAK_START" className="text-white" size={14} />
                    <span>Iniciar Intervalo</span>
                  </button>
                )}

                {getNextActionType() === "BREAK_END" && (
                  <button
                    onClick={() => initiateTimeEntry("BREAK_END")}
                    disabled={geolocation.loading || !!geolocation.error}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <EntryTypeIcon type="BREAK_END" className="text-white" size={14} />
                    <span>Retornar do Intervalo</span>
                  </button>
                )}

                {getNextActionType() === "CLOCK_OUT" && (
                  <button
                    onClick={() => initiateTimeEntry("CLOCK_OUT")}
                    disabled={geolocation.loading || !!geolocation.error}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <EntryTypeIcon type="CLOCK_OUT" className="text-white" size={14} />
                    <span>Registrar Saída</span>
                  </button>
                )}

                {getNextActionType() === null && (
                  <div className="flex-1 flex items-center justify-center py-2 text-green-600 text-xs">
                    <CheckCircle size={14} className="mr-1" />
                    <span>Jornada finalizada!</span>
                  </div>
                )}

                <button className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
                  <FileEdit size={14} />
                </button>
              </div>
            )}
          </TimeEntryCard>

          {/* Card do mapa de localização */}
          <TimeEntryCard title="Localização">
            <div className="h-32 rounded overflow-hidden" ref={mapRef}>
              {(geolocation.loading || geolocation.error) && (
                <div className="h-full flex items-center justify-center bg-gray-100 rounded">
                  {geolocation.loading ? (
                    <div className="text-center">
                      <Loader2 size={18} className="animate-spin mb-1 mx-auto text-blue-500" />
                      <p className="text-xs text-gray-500">Carregando mapa...</p>
                    </div>
                  ) : (
                    <div className="text-center p-2">
                      <AlertCircle size={18} className="mb-1 mx-auto text-red-500" />
                      <p className="text-xs text-gray-600">Mapa indisponível</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TimeEntryCard>

          {/* Card de registros de hoje */}
          <TimeEntryCard
            title="Registros de Hoje"
            className="lg:col-span-4"
            rightElement={
              <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors">Ver todos</button>
            }
          >
            {todayEntries.length === 0 ? (
              <div className="flex items-center justify-center py-3 text-gray-500">
                <Clock size={16} className="mr-2" />
                <p className="text-xs">Nenhum registro hoje</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {todayEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="p-2 border border-gray-100 rounded bg-gray-50 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`p-1.5 rounded-full ${getEntryTypeColor(entry.type)}`}>
                      <EntryTypeIcon type={entry.type} size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-800">{getEntryTypeLabel(entry.type)}</p>
                        <p className="text-xs text-gray-500 tabular-nums">
                          {format(new Date(entry.timestamp), "HH:mm")}
                        </p>
                      </div>
                      {entry.address && (
                        <p className="text-[10px] text-gray-500 truncate">{entry.address.split(",")[0]}</p>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreHorizontal size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </TimeEntryCard>
        </div>

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
            <div className="space-y-3">
              <div className="rounded overflow-hidden border border-gray-200">
                <img src={capturedImage || "/placeholder.svg"} alt="Foto capturada" className="w-full h-auto" />
              </div>

              <h3 className="text-xs font-medium text-gray-700">Selecione sua localização:</h3>

              <div className="grid grid-cols-3 gap-2">
                <LocationOption
                  icon={<Home size={18} />}
                  label="Casa"
                  isSelected={selectedLocation === "casa"}
                  onClick={() => setSelectedLocation("casa")}
                />

                <LocationOption
                  icon={<Building2 size={18} />}
                  label="Escritório"
                  isSelected={selectedLocation === "escritorio"}
                  onClick={() => setSelectedLocation("escritorio")}
                />

                <LocationOption
                  icon={<MapPin size={18} />}
                  label="Outros"
                  isSelected={selectedLocation === "outros"}
                  onClick={() => setSelectedLocation("outros")}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex items-center justify-center gap-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-1.5 px-3 rounded text-xs transition-colors"
                >
                  <CameraIcon size={14} />
                  <span>Nova Foto</span>
                </button>

                <button
                  onClick={finalizeTimeEntry}
                  disabled={!selectedLocation}
                  className={`flex-1 text-white py-1.5 px-3 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getActionButtonColor(pendingEntryType)}`}
                >
                  Confirmar Registro
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}

export default EmployeeDashboard
