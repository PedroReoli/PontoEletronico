"use client"

import { useState, useEffect } from "react"
import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import { getPunchRecords } from "@/services/punchRecordService"
import { calculateWorkHours } from "@/utils/timeCalculations"

interface MonthlyChartProps {
  userId?: string
  month?: number
  year?: number
}

const MonthlyChart = ({ userId, month: propMonth, year: propYear }: MonthlyChartProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<{
    hours: number[]
    lateMinutes: number[]
    extraMinutes: number[]
    absences: number[]
    dates: string[]
  }>({
    hours: [],
    lateMinutes: [],
    extraMinutes: [],
    absences: [],
    dates: [],
  })

  // Definir mês e ano atuais se não fornecidos
  const currentDate = new Date()
  const month = propMonth !== undefined ? propMonth : currentDate.getMonth()
  const year = propYear !== undefined ? propYear : currentDate.getFullYear()

  // Carregar dados de ponto para o mês
  useEffect(() => {
    const loadMonthlyData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Definir datas de início e fim do mês
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0) // Último dia do mês
        endDate.setHours(23, 59, 59, 999)

        // Obter registros de ponto para o período
        const response = await getPunchRecords({
          startDate,
          endDate,
          userId,
          limit: 1000, // Valor alto para garantir que todos os registros sejam retornados
        })

        // Processar dados para o gráfico
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const hours = Array(daysInMonth).fill(0)
        const lateMinutes = Array(daysInMonth).fill(0)
        const extraMinutes = Array(daysInMonth).fill(0)
        const absences = Array(daysInMonth).fill(0)
        const dates = Array(daysInMonth)
          .fill("")
          .map((_, i) => `${i + 1}`)

        // Agrupar registros por dia do mês
        const recordsByDay = response.data.reduce(
          (acc, record) => {
            const date = new Date(record.timestamp)
            const dayOfMonth = date.getDate() // 1-31

            if (!acc[dayOfMonth]) {
              acc[dayOfMonth] = []
            }

            acc[dayOfMonth].push(record)
            return acc
          },
          {} as Record<number, any[]>,
        )

        // Calcular horas trabalhadas, atrasos, extras e faltas para cada dia
        for (let i = 1; i <= daysInMonth; i++) {
          const dayRecords = recordsByDay[i] || []

          if (dayRecords.length > 0) {
            // Calcular horas trabalhadas
            const {
              totalWorkedHours,
              lateMinutes: dayLateMinutes,
              extraMinutes: dayExtraMinutes,
            } = calculateWorkHours(dayRecords)

            hours[i - 1] = Number.parseFloat(totalWorkedHours.toFixed(2))
            lateMinutes[i - 1] = dayLateMinutes
            extraMinutes[i - 1] = dayExtraMinutes
          } else {
            // Verificar se é dia útil (segunda a sexta)
            const dayOfWeek = new Date(year, month, i).getDay()
            if (dayOfWeek > 0 && dayOfWeek < 6) {
              absences[i - 1] = 1 // Marcar como falta
            }
          }
        }

        setChartData({ hours, lateMinutes, extraMinutes, absences, dates })
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados mensais")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadMonthlyData()
  }, [userId, month, year])

  // Opções do gráfico
  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: [3, 2, 2, 2],
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.dates,
      title: {
        text: "Dias do Mês",
      },
    },
    yaxis: {
      title: {
        text: "Horas",
      },
    },
    tooltip: {
      y: {
        formatter: (val) => val + " horas",
      },
    },
    colors: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
  }

  // Séries do gráfico
  const chartSeries = [
    {
      name: "Horas Trabalhadas",
      type: "line",
      data: chartData.hours,
    },
    {
      name: "Atrasos (h)",
      type: "line",
      data: chartData.lateMinutes.map((min) => Number.parseFloat((min / 60).toFixed(2))),
    },
    {
      name: "Horas Extras",
      type: "line",
      data: chartData.extraMinutes.map((min) => Number.parseFloat((min / 60).toFixed(2))),
    },
    {
      name: "Faltas",
      type: "bar",
      data: chartData.absences.map((absence) => absence * 8), // Multiplicar por 8 para representar um dia de trabalho
    },
  ]

  // Nome do mês
  const monthName = new Date(year, month).toLocaleDateString("pt-BR", { month: "long" })

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-3 mb-4">Horas Trabalhadas em {monthName}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="mt-4">
          <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} />
        </div>
      )}
    </div>
  )
}

export default MonthlyChart

