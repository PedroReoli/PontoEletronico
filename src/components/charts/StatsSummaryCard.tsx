"use client"

import { useState, useEffect } from "react"
import { getPunchRecords } from "@/services/punchRecordService"
import { calculateMonthlyStats } from "@/utils/timeCalculations"

interface StatsSummaryCardProps {
  userId?: string
  period: "week" | "month" | "year"
  title?: string
}

const StatsSummaryCard = ({ userId, period, title }: StatsSummaryCardProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalHours: number
    totalLateMinutes: number
    totalExtraMinutes: number
    totalAbsences: number
    expectedHours: number
    completionPercentage: number
  }>({
    totalHours: 0,
    totalLateMinutes: 0,
    totalExtraMinutes: 0,
    totalAbsences: 0,
    expectedHours: 0,
    completionPercentage: 0,
  })

  // Definir datas de início e fim com base no período
  const getDateRange = () => {
    const today = new Date()
    let startDate: Date
    const endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999)

    switch (period) {
      case "week":
        const currentDay = today.getDay() // 0 = domingo, 1 = segunda, ...
        startDate = new Date(today)
        startDate.setDate(today.getDate() - currentDay) // Domingo da semana atual
        startDate.setHours(0, 0, 0, 0)
        break
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1)
        startDate.setHours(0, 0, 0, 0)
        break
      default:
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
    }

    return { startDate, endDate }
  }

  // Carregar dados de ponto para o período
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { startDate, endDate } = getDateRange()

        // Obter registros de ponto para o período
        const response = await getPunchRecords({
          startDate,
          endDate,
          userId,
          limit: 1000, // Valor alto para garantir que todos os registros sejam retornados
        })

        // Calcular estatísticas
        const monthlyStats = calculateMonthlyStats(response.data, startDate, endDate)
        setStats(monthlyStats)
      } catch (err: any) {
        setError(err.message || `Erro ao carregar estatísticas do ${period}`)
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [userId, period])

  // Definir título com base no período
  const getDefaultTitle = () => {
    switch (period) {
      case "week":
        return "Resumo da Semana"
      case "month":
        return "Resumo do Mês"
      case "year":
        return "Resumo do Ano"
      default:
        return "Resumo"
    }
  }

  const cardTitle = title || getDefaultTitle()

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-3 mb-4">{cardTitle}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-500 mb-1">Horas Trabalhadas</div>
            <div className="text-heading-3 font-bold text-blue-600">{stats.totalHours.toFixed(1)}h</div>
            <div className="text-xs text-gray-500 mt-1">{stats.completionPercentage.toFixed(0)}% do esperado</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(stats.completionPercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-sm text-gray-500 mb-1">Atrasos</div>
            <div className="text-heading-3 font-bold text-red-600">{(stats.totalLateMinutes / 60).toFixed(1)}h</div>
            <div className="text-xs text-gray-500 mt-1">{stats.totalLateMinutes} minutos</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-gray-500 mb-1">Horas Extras</div>
            <div className="text-heading-3 font-bold text-green-600">{(stats.totalExtraMinutes / 60).toFixed(1)}h</div>
            <div className="text-xs text-gray-500 mt-1">{stats.totalExtraMinutes} minutos</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="text-sm text-gray-500 mb-1">Faltas</div>
            <div className="text-heading-3 font-bold text-amber-600">{stats.totalAbsences}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.totalAbsences * 8} horas perdidas</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsSummaryCard

