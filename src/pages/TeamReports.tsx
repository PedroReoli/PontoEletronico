"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Download, Calendar, ArrowLeft, Filter, Search, X } from "lucide-react"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipos
interface TeamMember {
  id: string
  name: string
  department?: string
}

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  department?: string
  date: string
  clockIn: string | null
  clockOut: string | null
  totalHours: string
  status: "complete" | "incomplete" | "absent" | "weekend" | "holiday"
}

interface ReportSummary {
  totalEmployees: number
  totalWorkDays: number
  averageAttendance: string
  onTimePercentage: string
  latePercentage: string
  absentPercentage: string
}

function TeamReports() {
  // Estados
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedEmployee, setSelectedEmployee] = useState<string | "all">("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Efeito para buscar dados
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const [teamResponse, recordsResponse, summaryResponse] = await Promise.all([
            api.get("/manager/team"),
            api.get(
              `/manager/attendance?month=${month}&year=${year}&employee=${selectedEmployee !== "all" ? selectedEmployee : ""}&department=${selectedDepartment !== "all" ? selectedDepartment : ""}`,
            ),
            api.get(`/manager/attendance/summary?month=${month}&year=${year}`),
          ])

          setTeamMembers(teamResponse.data)
          setAttendanceRecords(recordsResponse.data)
          setSummary(summaryResponse.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados para desenvolvimento
          const mockTeamMembers: TeamMember[] = [
            { id: "user-1", name: "Ana Silva", department: "Desenvolvimento" },
            { id: "user-2", name: "Carlos Mendes", department: "Desenvolvimento" },
            { id: "user-3", name: "Juliana Lima", department: "Design" },
            { id: "user-4", name: "Roberto Alves", department: "Análise" },
            { id: "user-5", name: "Fernanda Costa", department: "Produto" },
          ]

          // Gerar registros de presença para o mês atual
          const startDate = startOfMonth(new Date(year, month - 1))
          const endDate = endOfMonth(new Date(year, month - 1))
          const days = eachDayOfInterval({ start: startDate, end: endDate })

          const mockRecords: AttendanceRecord[] = []

          days.forEach((day) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6
            const isHoliday = day.getDate() === 15 // Exemplo: dia 15 é feriado

            mockTeamMembers.forEach((member) => {
              // Gerar status aleatório para dias úteis
              let status: AttendanceRecord["status"] = "complete"
              if (isWeekend) {
                status = "weekend"
              } else if (isHoliday) {
                status = "holiday"
              } else {
                const random = Math.random()
                if (random < 0.7) {
                  status = "complete"
                } else if (random < 0.85) {
                  status = "incomplete"
                } else {
                  status = "absent"
                }
              }

              // Gerar horários para dias completos e incompletos
              let clockIn = null
              let clockOut = null
              let totalHours = "00:00"

              if (status === "complete") {
                const randomMinutes = Math.floor(Math.random() * 30)
                clockIn = `08:${randomMinutes.toString().padStart(2, "0")}`
                clockOut = `17:${randomMinutes.toString().padStart(2, "0")}`
                totalHours = "08:00"
              } else if (status === "incomplete") {
                const randomMinutes = Math.floor(Math.random() * 30)
                clockIn = `08:${randomMinutes.toString().padStart(2, "0")}`
                totalHours = "04:00"
              }

              mockRecords.push({
                id: `record-${member.id}-${format(day, "yyyy-MM-dd")}`,
                employeeId: member.id,
                employeeName: member.name,
                department: member.department,
                date: format(day, "dd/MM/yyyy"),
                clockIn,
                clockOut,
                totalHours,
                status,
              })
            })
          })

          const mockSummary: ReportSummary = {
            totalEmployees: mockTeamMembers.length,
            totalWorkDays: days.filter((day) => day.getDay() !== 0 && day.getDay() !== 6).length,
            averageAttendance: "92%",
            onTimePercentage: "85%",
            latePercentage: "10%",
            absentPercentage: "5%",
          }

          setTeamMembers(mockTeamMembers)
          setAttendanceRecords(mockRecords)
          setSummary(mockSummary)
        }
      } catch (error) {
        console.error("Erro ao buscar dados de relatórios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [month, year, selectedEmployee, selectedDepartment])

  // Obter departamentos únicos
  const departments = Array.from(new Set(teamMembers.map((member) => member.department).filter(Boolean)))

  // Filtrar registros com base no termo de busca
  const filteredRecords = attendanceRecords.filter((record) => {
    if (!searchTerm) return true

    return (
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.department && record.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      record.date.includes(searchTerm)
    )
  })

  // Função para exportar relatório
  const handleExport = () => {
    // Implementação da exportação
    console.log("Exportando relatório...")
  }

  // Função para obter classe de status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800"
      case "incomplete":
        return "bg-amber-100 text-amber-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "weekend":
        return "bg-gray-100 text-gray-800"
      case "holiday":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Função para obter texto de status
  const getStatusText = (status: string) => {
    switch (status) {
      case "complete":
        return "Completo"
      case "incomplete":
        return "Incompleto"
      case "absent":
        return "Ausente"
      case "weekend":
        return "Fim de Semana"
      case "holiday":
        return "Feriado"
      default:
        return status
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" as={Link} to="/manager-dashboard" leftIcon={<ArrowLeft size={16} />}>
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Relatórios da Equipe</h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download size={16} />} onClick={handleExport}>
              Exportar
            </Button>
          </div>
        </motion.div>

        {/* Filtros */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                    Mês:
                  </label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(2021, i, 1), "MMMM", { locale: ptBR })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Ano:
                  </label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const yearValue = new Date().getFullYear() - 2 + i
                      return (
                        <option key={yearValue} value={yearValue}>
                          {yearValue}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
                    Funcionário:
                  </label>
                  <select
                    id="employee"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">Todos</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento:
                  </label>
                  <select
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">Todos</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Buscar por nome, departamento ou data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Total de Funcionários</div>
                <div className="text-lg font-semibold">{summary.totalEmployees}</div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Dias Úteis</div>
                <div className="text-lg font-semibold">{summary.totalWorkDays}</div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Presença Média</div>
                <div className="text-lg font-semibold">{summary.averageAttendance}</div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">No Horário</div>
                <div className="text-lg font-semibold text-green-600">{summary.onTimePercentage}</div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Atrasos</div>
                <div className="text-lg font-semibold text-amber-600">{summary.latePercentage}</div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1">Ausências</div>
                <div className="text-lg font-semibold text-red-600">{summary.absentPercentage}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Card>
            <CardHeader className="px-4 py-3 bg-gray-50">
              <div className="flex items-center">
                <Calendar size={18} className="text-blue-500 mr-2" />
                <h2 className="text-lg font-medium">Registros de Presença</h2>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 compact-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Funcionário
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Departamento
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Entrada
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Saída
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{record.employeeName}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {record.department || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{record.clockIn || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{record.clockOut || "-"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.totalHours}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className={getStatusClass(record.status)}>{getStatusText(record.status)}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-sm text-gray-500">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export default TeamReports
