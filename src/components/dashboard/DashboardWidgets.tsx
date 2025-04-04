"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import PunchClockWidget from "@/components/punch/PunchClockWidget"
import { getMyTodayPunchRecords } from "@/services/punchRecordService"
import { type PunchRecord, PunchType } from "@prisma/client"

const DashboardWidgets = () => {
  const { user } = useAuth()
  const [todayRecords, setTodayRecords] = useState<PunchRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [workSummary, setWorkSummary] = useState({
    totalWorked: "00:00",
    totalBreak: "00:00",
    status: "Não iniciado",
  })

  // Carregar registros de ponto do dia atual
  useEffect(() => {
    const loadTodayRecords = async () => {
      setIsLoading(true)

      try {
        const records = await getMyTodayPunchRecords()
        setTodayRecords(records)
        calculateWorkSummary(records)
      } catch (err) {
        console.error("Erro ao carregar registros de ponto:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTodayRecords()

    // Atualizar a cada minuto
    const intervalId = setInterval(loadTodayRecords, 60000)

    return () => clearInterval(intervalId)
  }, [])

  // Calcular resumo de trabalho
  const calculateWorkSummary = (records: PunchRecord[]) => {
    if (records.length === 0) {
      setWorkSummary({
        totalWorked: "00:00",
        totalBreak: "00:00",
        status: "Não iniciado",
      })
      return
    }

    // Ordenar registros por timestamp
    const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    let totalWorkedMs = 0
    let totalBreakMs = 0
    let lastEntryTime: Date | null = null
    let lastBreakStartTime: Date | null = null
    let currentStatus = "Não iniciado"

    // Calcular tempo trabalhado e tempo de intervalo
    for (let i = 0; i < sortedRecords.length; i++) {
      const record = sortedRecords[i]
      const timestamp = new Date(record.timestamp)

      switch (record.type) {
        case PunchType.ENTRY:
          lastEntryTime = timestamp
          currentStatus = "Trabalhando"
          break

        case PunchType.BREAK_START:
          if (lastEntryTime) {
            totalWorkedMs += timestamp.getTime() - lastEntryTime.getTime()
            lastEntryTime = null
          }
          lastBreakStartTime = timestamp
          currentStatus = "Em intervalo"
          break

        case PunchType.BREAK_END:
          if (lastBreakStartTime) {
            totalBreakMs += timestamp.getTime() - lastBreakStartTime.getTime()
            lastBreakStartTime = null
          }
          lastEntryTime = timestamp
          currentStatus = "Trabalhando"
          break

        case PunchType.EXIT:
          if (lastEntryTime) {
            totalWorkedMs += timestamp.getTime() - lastEntryTime.getTime()
            lastEntryTime = null
          }
          currentStatus = "Finalizado"
          break
      }
    }

    // Se ainda estiver trabalhando, adicionar o tempo até agora
    if (lastEntryTime) {
      totalWorkedMs += new Date().getTime() - lastEntryTime.getTime()
    }

    // Se ainda estiver em intervalo, adicionar o tempo até agora
    if (lastBreakStartTime) {
      totalBreakMs += new Date().getTime() - lastBreakStartTime.getTime()
    }

    // Converter milissegundos para formato HH:MM
    const formatTime = (ms: number) => {
      const totalMinutes = Math.floor(ms / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }

    setWorkSummary({
      totalWorked: formatTime(totalWorkedMs),
      totalBreak: formatTime(totalBreakMs),
      status: currentStatus,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Widget de registro de ponto rápido */}
      <div>
        <PunchClockWidget />
      </div>

      {/* Widget de resumo do dia */}
      <div className="bg-surface p-4 rounded-lg shadow-md">
        <h3 className="text-heading-4 mb-4">Resumo do Dia</h3>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tempo trabalhado</p>
              <p className="text-heading-3 font-bold text-green-600">{workSummary.totalWorked}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tempo de intervalo</p>
              <p className="text-heading-4 font-medium text-amber-600">{workSummary.totalBreak}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status atual</p>
              <p className="text-body-1 font-medium">
                {workSummary.status === "Trabalhando" && <span className="text-green-600">Trabalhando</span>}
                {workSummary.status === "Em intervalo" && <span className="text-amber-600">Em intervalo</span>}
                {workSummary.status === "Finalizado" && <span className="text-red-600">Finalizado</span>}
                {workSummary.status === "Não iniciado" && <span className="text-gray-600">Não iniciado</span>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Widget de informações do usuário */}
      <div className="bg-surface p-4 rounded-lg shadow-md">
        <h3 className="text-heading-4 mb-4">Meu Perfil</h3>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="ml-4">
                <p className="text-body-1 font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Papel</p>
              <p className="text-body-2 font-medium">
                {user.role === "ADMIN" && "Administrador"}
                {user.role === "MANAGER" && "Gerente"}
                {user.role === "EMPLOYEE" && "Funcionário"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardWidgets

