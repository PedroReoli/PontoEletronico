"use client"

import { useState, useEffect } from "react"
import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import { getPunchRecords } from "@/services/punchRecordService"
import { calculateWorkHours } from "@/utils/timeCalculations"

interface WeeklyChartProps {
  userId?: string
  startDate?: Date
  endDate?: Date
}

const WeeklyChart = ({ userId, startDate: propStartDate, endDate: propEndDate }: WeeklyChartProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<{
    hours: number[]
    lateMinutes: number[]
    extraMinutes: number[]
    absences: number[]
  }>({
    hours: [0, 0, 0, 0, 0, 0, 0],
    lateMinutes: [0, 0, 0, 0, 0, 0, 0],
    extraMinutes: [0, 0, 0, 0, 0, 0, 0],
    absences: [0, 0, 0, 0, 0, 0, 0],
  })

  // Definir datas de início e fim da semana atual se não fornecidas
  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = domingo, 1 = segunda, ...

    // Calcular o primeiro dia da semana (domingo)
    const firstDay = new Date(today)
    firstDay.setDate(today.getDate() - currentDay)
    firstDay.setHours(0, 0, 0, 0)

    // Calcular o último dia da semana (sábado)
    const lastDay = new Date(firstDay)
    lastDay.setDate(firstDay.getDate() + 6)
    lastDay.setHours(23, 59, 59, 999)

    return { startDate: firstDay, endDate: lastDay }
  }

  const { startDate, endDate } =
    propStartDate && propEndDate ? { startDate: propStartDate, endDate: propEndDate } : getWeekDates()

  // Carregar dados de ponto para a semana
  useEffect(() => {
    const loadWeeklyData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Obter registros de ponto para o período
        const response = await getPunchRecords({
          startDate,
          endDate,
          userId,
          limit: 1000, // Valor alto para garantir que todos os registros sejam retornados
        })

        // Processar dados para o gráfico
        const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
        const hours = Array(7).fill(0)
        const lateMinutes = Array(7).fill(0)
        const extraMinutes = Array(7).fill(0)
        const absences = Array(7).fill(0)

        // Agrupar registros por dia da semana
        const recordsByDay = response.data.reduce(
          (acc, record) => {
            const date = new Date(record.timestamp)
            const dayOfWeek = date.getDay() // 0 = domingo, 1 = segunda, ...

            if (!acc[dayOfWeek]) {
              acc[dayOfWeek] = []
            }

            acc[dayOfWeek].push(record)
            return acc
          },
          {} as Record<number, any[]>,
        )

        // Calcular horas trabalhadas, atrasos, extras e faltas para cada dia
        for (let i = 0; i < 7; i++) {
          const dayRecords = recordsByDay[i] || []

          if (dayRecords.length > 0) {
            // Calcular horas trabalhadas
            const {
              totalWorkedHours,
              lateMinutes: dayLateMinutes,
              extraMinutes: dayExtraMinutes,
            } = calculateWorkHours(dayRecords)

            hours[i] = Number.parseFloat(totalWorkedHours.toFixed(2))
            lateMinutes[i] = dayLateMinutes
            extraMinutes[i] = dayExtraMinutes
          } else {
            // Verificar se é dia útil (segunda a sexta)
            if (i > 0 && i < 6) {
              absences[i] = 1 // Marcar como falta
            }
          }
        }

        setChartData({ hours, lateMinutes, extraMinutes, absences })
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados semanais")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadWeeklyData()
  }, [userId, startDate, endDate])

  // Opções do gráfico
  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
      title: {
        text: "Dias da Semana",
      },
    },
    yaxis: {
      title: {
        text: "Horas",
      },
    },
    fill: {
      opacity: 1,
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
  }

  // Séries do gráfico
  const chartSeries = [
    {
      name: "Horas Trabalhadas",
      data: chartData.hours,
    },
    {
      name: "Atrasos (h)",
      data: chartData.lateMinutes.map((min) => Number.parseFloat((min / 60).toFixed(2))),
    },
    {
      name: "Horas Extras",
      data: chartData.extraMinutes.map((min) => Number.parseFloat((min / 60).toFixed(2))),
    },
    {
      name: "Faltas",
      data: chartData.absences.map((absence) => absence * 8), // Multiplicar por 8 para representar um dia de trabalho
    },
  ]

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-3 mb-4">Horas Trabalhadas na Semana</h2>

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
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
        </div>
      )}
    </div>
  )
}

export default WeeklyChart

