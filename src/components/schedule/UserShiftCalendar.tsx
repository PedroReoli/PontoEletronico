"use client"

import { useState, useEffect } from "react"
import { type Shift, ShiftType } from "@prisma/client"
import { getUserShiftsForMonth } from "@/services/shiftService"
import { useAuth } from "@/hooks/useAuth"

interface UserShiftCalendarProps {
  userId?: string // Se não fornecido, usa o usuário atual
  month?: number
  year?: number
}

const UserShiftCalendar = ({ userId, month: propMonth, year: propYear }: UserShiftCalendarProps) => {
  const { user: authUser } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para o mês e ano atual
  const currentDate = new Date()
  const [month, setMonth] = useState<number>(propMonth || currentDate.getMonth())
  const [year, setYear] = useState<number>(propYear || currentDate.getFullYear())

  // Carregar plantões do usuário para o mês selecionado
  useEffect(() => {
    const loadShifts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const targetUserId = userId || authUser?.id
        if (!targetUserId) {
          setError("ID do usuário não disponível")
          return
        }

        const shiftsData = await getUserShiftsForMonth(targetUserId, year, month)
        setShifts(shiftsData)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar plantões")
      } finally {
        setIsLoading(false)
      }
    }

    loadShifts()
  }, [userId, authUser, month, year])

  // Mudar para o mês anterior
  const previousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  // Mudar para o próximo mês
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // Gerar dias do mês
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days = []

    // Adicionar dias do mês anterior para completar a primeira semana
    const firstDay = date.getDay() // 0 = domingo, 1 = segunda, ...
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
      })
    }

    // Adicionar dias do mês atual
    while (date.getMonth() === month) {
      days.push({
        date: new Date(date),
        isCurrentMonth: true,
      })
      date.setDate(date.getDate() + 1)
    }

    // Adicionar dias do próximo mês para completar a última semana
    const lastDay = days[days.length - 1].date.getDay() // 0 = domingo, 6 = sábado
    for (let i = 1; i <= 6 - lastDay; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
      })
    }

    return days
  }

  const calendarDays = getDaysInMonth(year, month)

  // Verificar se é hoje
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Verificar se é fim de semana
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 = domingo, 6 = sábado
  }

  // Obter plantões para uma data específica
  const getShiftsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]

    return shifts.filter((shift) => new Date(shift.date).toISOString().split("T")[0] === dateString)
  }

  // Formatar o tipo de plantão para exibição
  const formatShiftType = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return "Regular"
      case ShiftType.NIGHT:
        return "Noturno"
      case ShiftType.TWELVE_THIRTY_SIX:
        return "12x36"
      case ShiftType.TWENTY_FOUR_FORTY_EIGHT:
        return "24x48"
      case ShiftType.CUSTOM:
        return "Personalizado"
      default:
        return type
    }
  }

  // Obter cor de fundo para o tipo de plantão
  const getShiftTypeColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return "bg-blue-100 border-blue-300 text-blue-800"
      case ShiftType.NIGHT:
        return "bg-purple-100 border-purple-300 text-purple-800"
      case ShiftType.TWELVE_THIRTY_SIX:
        return "bg-green-100 border-green-300 text-green-800"
      case ShiftType.TWENTY_FOUR_FORTY_EIGHT:
        return "bg-amber-100 border-amber-300 text-amber-800"
      case ShiftType.CUSTOM:
        return "bg-gray-100 border-gray-300 text-gray-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-heading-2 mb-2 md:mb-0">Meus Plantões</h2>

        <div className="flex items-center space-x-4">
          <button onClick={previousMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-body-1 font-medium">
            {new Date(year, month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>

          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Cabeçalho dos dias da semana */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, index) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {/* Dias do calendário */}
          {calendarDays.map(({ date, isCurrentMonth }) => {
            const dayShifts = getShiftsForDate(date)
            const hasShift = dayShifts.length > 0

            return (
              <div
                key={date.toISOString()}
                className={`border rounded-lg p-1 min-h-[100px] ${
                  !isCurrentMonth
                    ? "bg-gray-100 text-gray-400"
                    : isToday(date)
                      ? "bg-blue-50 border-blue-300"
                      : isWeekend(date)
                        ? "bg-gray-50"
                        : "bg-white"
                }`}
              >
                <div className="text-right text-sm font-medium p-1">{date.getDate()}</div>

                <div className="space-y-1 mt-1">
                  {hasShift
                    ? dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={`p-1 rounded border text-xs ${getShiftTypeColor(shift.shiftType as ShiftType)}`}
                        >
                          <div>{formatShiftType(shift.shiftType as ShiftType)}</div>
                          <div>
                            {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                      ))
                    : isCurrentMonth && <div className="text-center text-xs text-gray-400 py-2">Sem plantão</div>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserShiftCalendar

