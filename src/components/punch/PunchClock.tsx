"use client"

import { useState, useEffect } from "react"
import { PunchType, type PunchRecord } from "@prisma/client"
import { createPunchRecord, getMyTodayPunchRecords, canRegisterPunchType } from "@/services/punchRecordService"

interface PunchClockProps {
  showHistory?: boolean
  compact?: boolean
}

const PunchClock = ({ showHistory = true, compact = false }: PunchClockProps) => {
  const [todayRecords, setTodayRecords] = useState<PunchRecord[]>([])
  const [currentStatus, setCurrentStatus] = useState<string>("Não iniciado")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [geolocationAvailable, setGeolocationAvailable] = useState<boolean>(false)
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null)

  // Verificar se a geolocalização está disponível
  useEffect(() => {
    if ("geolocation" in navigator) {
      setGeolocationAvailable(true)
    }
  }, [])

  // Carregar registros de ponto do dia atual
  const loadTodayRecords = async () => {
    setIsLoadingRecords(true)
    setError(null)

    try {
      const records = await getMyTodayPunchRecords()
      setTodayRecords(records)
      updateCurrentStatus(records)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar registros de ponto")
    } finally {
      setIsLoadingRecords(false)
    }
  }

  // Carregar registros ao montar o componente
  useEffect(() => {
    loadTodayRecords()
  }, [])

  // Atualizar o status atual com base nos registros
  const updateCurrentStatus = (records: PunchRecord[]) => {
    if (records.length === 0) {
      setCurrentStatus("Não iniciado")
      return
    }

    // Ordenar registros por timestamp
    const sortedRecords = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // O último registro determina o status atual
    const lastRecord = sortedRecords[0]

    switch (lastRecord.type) {
      case PunchType.ENTRY:
        setCurrentStatus("Trabalhando")
        break
      case PunchType.BREAK_START:
        setCurrentStatus("Em intervalo")
        break
      case PunchType.BREAK_END:
        setCurrentStatus("Trabalhando")
        break
      case PunchType.EXIT:
        setCurrentStatus("Finalizado")
        break
      default:
        setCurrentStatus("Desconhecido")
    }
  }

  // Obter a posição atual do usuário
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!geolocationAvailable) {
        reject(new Error("Geolocalização não disponível"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    })
  }

  // Registrar um ponto
  const registerPunch = async (type: PunchType) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Verificar se pode registrar este tipo de ponto
      const validation = await canRegisterPunchType(type)

      if (!validation.canRegister) {
        setError(validation.message || "Não é possível registrar este tipo de ponto agora")
        return
      }

      // Tentar obter a localização
      const punchData: { type: PunchType; latitude?: number; longitude?: number; deviceInfo?: string } = {
        type,
        deviceInfo: navigator.userAgent,
      }

      try {
        if (geolocationAvailable) {
          const geoPosition = await getCurrentPosition()
          setPosition({
            latitude: geoPosition.coords.latitude,
            longitude: geoPosition.coords.longitude,
          })

          punchData.latitude = geoPosition.coords.latitude
          punchData.longitude = geoPosition.coords.longitude
        }
      } catch (geoError) {
        console.warn("Erro ao obter localização:", geoError)
        // Continuar sem a localização
      }

      // Registrar o ponto
      await createPunchRecord(punchData)

      // Mostrar mensagem de sucesso
      setSuccess("Ponto registrado com sucesso!")

      // Recarregar registros
      await loadTodayRecords()
    } catch (err: any) {
      setError(err.message || "Erro ao registrar ponto")
    } finally {
      setIsLoading(false)
    }
  }

  // Formatar timestamp para exibição
  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Obter o tipo de ponto em português
  const getPunchTypeLabel = (type: PunchType) => {
    switch (type) {
      case PunchType.ENTRY:
        return "Entrada"
      case PunchType.BREAK_START:
        return "Início de Intervalo"
      case PunchType.BREAK_END:
        return "Fim de Intervalo"
      case PunchType.EXIT:
        return "Saída"
      default:
        return type
    }
  }

  // Obter a cor do botão com base no tipo de ponto
  const getButtonColor = (type: PunchType) => {
    switch (type) {
      case PunchType.ENTRY:
        return "bg-green-500 hover:bg-green-600"
      case PunchType.BREAK_START:
        return "bg-amber-500 hover:bg-amber-600"
      case PunchType.BREAK_END:
        return "bg-blue-500 hover:bg-blue-600"
      case PunchType.EXIT:
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Obter a cor do status atual
  const getStatusColor = () => {
    switch (currentStatus) {
      case "Trabalhando":
        return "text-green-600"
      case "Em intervalo":
        return "text-amber-600"
      case "Finalizado":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-heading-2 mb-2">Registro de Ponto</h2>
          <div className="flex items-center">
            <span className="text-body-1 mr-2">Status atual:</span>
            <span className={`text-body-1 font-semibold ${getStatusColor()}`}>{currentStatus}</span>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="text-body-2 text-gray-500">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-heading-3 font-bold">
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{success}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Botões de registro de ponto */}
      <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"} gap-4 mb-6`}>
        <button
          onClick={() => registerPunch(PunchType.ENTRY)}
          disabled={isLoading || currentStatus === "Trabalhando" || currentStatus === "Finalizado"}
          className={`${getButtonColor(PunchType.ENTRY)} text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
            isLoading || currentStatus === "Trabalhando" || currentStatus === "Finalizado"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Entrar
        </button>

        <button
          onClick={() => registerPunch(PunchType.BREAK_START)}
          disabled={isLoading || currentStatus !== "Trabalhando"}
          className={`${getButtonColor(PunchType.BREAK_START)} text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
            isLoading || currentStatus !== "Trabalhando" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Intervalo
        </button>

        <button
          onClick={() => registerPunch(PunchType.BREAK_END)}
          disabled={isLoading || currentStatus !== "Em intervalo"}
          className={`${getButtonColor(PunchType.BREAK_END)} text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
            isLoading || currentStatus !== "Em intervalo" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <button
          onClick={() => registerPunch(PunchType.EXIT)}
          disabled={isLoading || (currentStatus !== "Trabalhando" && currentStatus !== "Em intervalo")}
          className={`${getButtonColor(PunchType.EXIT)} text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
            isLoading || (currentStatus !== "Trabalhando" && currentStatus !== "Em intervalo")
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sair
        </button>
      </div>

      {/* Informação sobre geolocalização */}
      <div className="text-sm text-gray-500 mb-6">
        {geolocationAvailable ? (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Localização disponível
          </div>
        ) : (
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Localização não disponível
          </div>
        )}
      </div>

      {/* Histórico de registros do dia */}
      {showHistory && (
        <div>
          <h3 className="text-heading-4 mb-4">Registros de Hoje</h3>

          {isLoadingRecords ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : todayRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum registro de ponto hoje</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...todayRecords]
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatTimestamp(record.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPunchTypeLabel(record.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.latitude && record.longitude ? (
                            <span className="text-green-600">Registrado</span>
                          ) : (
                            <span className="text-gray-400">Não disponível</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PunchClock

