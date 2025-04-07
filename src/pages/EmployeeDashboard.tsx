"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import { useGeolocation } from "../hooks/useGeolocation"
import Layout from "../components/Layout"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ClockIcon, 
  ArrowRightIcon, 
  CoffeeIcon, 
  ArrowLeftIcon, 
  MapPinIcon, 
  ExclamationCircleIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline"

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
  const [loading, setLoading] = useState(true)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [lastEntry, setLastEntry] = useState<TimeEntry | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [geoError, setGeoError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)

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

      setRegistering(true)

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
    } finally {
      setRegistering(false)
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
    return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
        return <ArrowRightIcon className="h-5 w-5" />
      case "BREAK_START":
        return <CoffeeIcon className="h-5 w-5" />
      case "BREAK_END":
        return <ArrowRightIcon className="h-5 w-5" />
      case "CLOCK_OUT":
        return <ArrowLeftIcon className="h-5 w-5" />
      default:
        return null
    }
  }

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
        return "bg-green-100 text-green-800"
      case "BREAK_START":
        return "bg-blue-100 text-blue-800"
      case "BREAK_END":
        return "bg-purple-100 text-purple-800"
      case "CLOCK_OUT":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Registro de Ponto</h1>
          <p className="mt-2 text-gray-600 text-lg">{formatDate(currentTime)}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 md:col-span-2 lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-1">{formatTime(currentTime)}</div>
                    <div className="text-sm text-gray-500">Horário atual</div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Registrar Ponto</h2>

                {/* Status da geolocalização */}
                <div className={`mb-4 p-3 rounded-lg flex items-center ${
                  geolocation.loading 
                    ? "bg-gray-100" 
                    : geolocation.error 
                      ? "bg-red-50" 
                      : "bg-green-50"
                }`}>
                  {geolocation.loading ? (
                    <>
                      <div className="mr-3 h-6 w-6 text-gray-400">
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">Obtendo sua localização...</span>
                    </>
                  ) : geolocation.error ? (
                    <>
                      <ExclamationCircleIcon className="mr-3 h-6 w-6 text-red-500" />
                      <span className="text-sm text-red-700">{geolocation.error}</span>
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="mr-3 h-6 w-6 text-green-500" />
                      <span className="text-sm text-green-700">
                        Localização obtida (precisão: {Math.round(geolocation.accuracy || 0)}m)
                      </span>
                    </>
                  )}
                </div>

                {geoError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-50 rounded-lg flex items-center"
                  >
                    <ExclamationCircleIcon className="mr-3 h-6 w-6 text-red-500" />
                    <span className="text-sm text-red-700">{geoError}</span>
                    <button 
                      onClick={() => setGeoError(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </motion.div>
                )}

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <AnimatePresence mode="wait">
                      {getNextActionType() === "CLOCK_IN" && (
                        <motion.button
                          key="clock-in"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTimeEntry("CLOCK_IN")}
                          disabled={geolocation.loading || !!geolocation.error || registering}
                          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {registering ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <ArrowRightIcon className="mr-2 h-5 w-5" />
                          )}
                          {registering ? "Registrando..." : "Registrar Entrada"}
                        </motion.button>
                      )}

                      {getNextActionType() === "BREAK_START" && (
                        <motion.button
                          key="break-start"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTimeEntry("BREAK_START")}
                          disabled={geolocation.loading || !!geolocation.error || registering}
                          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {registering ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <CoffeeIcon className="mr-2 h-5 w-5" />
                          )}
                          {registering ? "Registrando..." : "Iniciar Intervalo"}
                        </motion.button>
                      )}

                      {getNextActionType() === "BREAK_END" && (
                        <motion.button
                          key="break-end"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTimeEntry("BREAK_END")}
                          disabled={geolocation.loading || !!geolocation.error || registering}
                          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {registering ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <ArrowRightIcon className="mr-2 h-5 w-5" />
                          )}
                          {registering ? "Registrando..." : "Retornar do Intervalo"}
                        </motion.button>
                      )}

                      {getNextActionType() === "CLOCK_OUT" && (
                        <motion.button
                          key="clock-out"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTimeEntry("CLOCK_OUT")}
                          disabled={geolocation.loading || !!geolocation.error || registering}
                          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {registering ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <ArrowLeftIcon className="mr-2 h-5 w-5" />
                          )}
                          {registering ? "Registrando..." : "Registrar Saída"}
                        </motion.button>
                      )}

                      {getNextActionType() === null && (
                        <motion.div
                          key="day-completed"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="w-full py-6 px-4 bg-gray-50 rounded-lg border border-gray-200 text-center"
                        >
                          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Jornada Finalizada</h3>
                          <p className="text-sm text-gray-500">Você completou todos os registros de hoje!</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Solicitar Ajuste</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PencilSquareIcon className="mr-2 h-4 w-4" />
                    Nova Solicitação
                  </motion.button>
                </div>
                <p className="text-sm text-gray-600">
                  Precisa corrigir algum registro de ponto? Faça uma solicitação de ajuste para seu gestor.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-1 md:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Registros de Hoje</h2>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : todayEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 text-gray-500 mb-3">
                      <ClockIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum registro hoje</h3>
                    <p className="text-sm text-gray-500">Registre seu primeiro ponto do dia.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-sm text-gray-500">Hoje</span>
                      </div>
                    </div>

                    <motion.ul 
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                      className="space-y-3"
                    >
                      {todayEntries.map((entry, index) => (
                        <motion.li 
                          key={entry.id}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
                        >
                          <div className="p-4 flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getEntryTypeColor(entry.type)}`}>
                              {getEntryTypeIcon(entry.type)}
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {entry.type === "CLOCK_IN" && "Entrada"}
                                    {entry.type === "BREAK_START" && "Início do Intervalo"}
                                    {entry.type === "BREAK_END" && "Fim do Intervalo"}
                                    {entry.type === "CLOCK_OUT" && "Saída"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(entry.timestamp), "HH:mm:ss")}
                                  </p>
                                </div>
                                {entry.latitude && entry.longitude && (
                                  <div className="flex items-center text-xs text-gray-500" title={`Lat: ${entry.latitude.toFixed(6)}, Long: ${entry.longitude.toFixed(6)}`}>
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    <span>Localização registrada</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeDashboard
