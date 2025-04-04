import { PunchType, type PunchRecord } from "@prisma/client"

// Calcular horas trabalhadas, atrasos e horas extras a partir dos registros de ponto
export const calculateWorkHours = (records: PunchRecord[]) => {
  // Ordenar registros por timestamp
  const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  let totalWorkedMinutes = 0
  let totalBreakMinutes = 0
  let lateMinutes = 0
  let extraMinutes = 0

  let lastEntryTime: Date | null = null
  let lastBreakStartTime: Date | null = null

  // Horário padrão de trabalho (8h às 17h com 1h de almoço)
  const standardEntryTime = 8 * 60 // 8:00 em minutos
  const standardExitTime = 17 * 60 // 17:00 em minutos
  const standardWorkMinutes = 8 * 60 // 8 horas em minutos

  // Processar registros
  for (let i = 0; i < sortedRecords.length; i++) {
    const record = sortedRecords[i]
    const timestamp = new Date(record.timestamp)
    const timeInMinutes = timestamp.getHours() * 60 + timestamp.getMinutes()

    switch (record.type) {
      case PunchType.ENTRY:
        lastEntryTime = timestamp

        // Verificar atraso
        if (timeInMinutes > standardEntryTime) {
          lateMinutes += timeInMinutes - standardEntryTime
        }
        break

      case PunchType.BREAK_START:
        if (lastEntryTime) {
          // Adicionar tempo trabalhado até o intervalo
          totalWorkedMinutes += (timestamp.getTime() - lastEntryTime.getTime()) / 60000
          lastEntryTime = null
        }
        lastBreakStartTime = timestamp
        break

      case PunchType.BREAK_END:
        if (lastBreakStartTime) {
          // Calcular duração do intervalo
          totalBreakMinutes += (timestamp.getTime() - lastBreakStartTime.getTime()) / 60000
          lastBreakStartTime = null
        }
        lastEntryTime = timestamp
        break

      case PunchType.EXIT:
        if (lastEntryTime) {
          // Adicionar tempo trabalhado até a saída
          totalWorkedMinutes += (timestamp.getTime() - lastEntryTime.getTime()) / 60000
          lastEntryTime = null

          // Verificar horas extras
          if (timeInMinutes > standardExitTime) {
            extraMinutes += timeInMinutes - standardExitTime
          }
        }
        break
    }
  }

  // Se ainda estiver trabalhando, adicionar o tempo até agora
  if (lastEntryTime) {
    totalWorkedMinutes += (new Date().getTime() - lastEntryTime.getTime()) / 60000
  }

  // Converter minutos para horas
  const totalWorkedHours = totalWorkedMinutes / 60

  return {
    totalWorkedHours,
    totalWorkedMinutes,
    totalBreakMinutes,
    lateMinutes,
    extraMinutes,
  }
}

// Calcular estatísticas mensais
export const calculateMonthlyStats = (records: PunchRecord[], startDate: Date, endDate: Date) => {
  // Agrupar registros por dia
  const recordsByDay = records.reduce(
    (acc, record) => {
      const date = new Date(record.timestamp)
      const dateString = date.toISOString().split("T")[0]

      if (!acc[dateString]) {
        acc[dateString] = []
      }

      acc[dateString].push(record)
      return acc
    },
    {} as Record<string, PunchRecord[]>,
  )

  let totalHours = 0
  let totalLateMinutes = 0
  let totalExtraMinutes = 0
  let totalAbsences = 0

  // Calcular dias úteis no período
  const workingDays = getWorkingDaysInRange(startDate, endDate)
  const expectedHours = workingDays * 8 // 8 horas por dia útil

  // Processar cada dia
  for (const dateString in recordsByDay) {
    const dayRecords = recordsByDay[dateString]
    const { totalWorkedHours, lateMinutes, extraMinutes } = calculateWorkHours(dayRecords)

    totalHours += totalWorkedHours
    totalLateMinutes += lateMinutes
    totalExtraMinutes += extraMinutes
  }

  // Calcular faltas (dias úteis sem registros)
  const daysWithRecords = Object.keys(recordsByDay).length
  totalAbsences = Math.max(0, workingDays - daysWithRecords)

  // Calcular porcentagem de conclusão
  const completionPercentage = (totalHours / expectedHours) * 100

  return {
    totalHours,
    totalLateMinutes,
    totalExtraMinutes,
    totalAbsences,
    expectedHours,
    completionPercentage,
  }
}

// Função auxiliar para calcular dias úteis em um intervalo de datas
export const getWorkingDaysInRange = (startDate: Date, endDate: Date) => {
  let workingDays = 0
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek > 0 && dayOfWeek < 6) {
      // 1-5 = segunda a sexta
      workingDays++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return workingDays
}

