"use client"

import React from "react"

import { useState, useEffect, useMemo } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import Layout from "../components/Layout"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Filter,
  Search,
  X,
  BarChart2,
  Clock,
  List,
  Grid,
  Printer,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"

// Tipos
interface TimeEntryReport {
  id: string
  date: string
  clockIn: string | null
  breakStart: string | null
  breakEnd: string | null
  clockOut: string | null
  totalWorked: string
  totalBreak: string
  balance: string
  status?: "complete" | "incomplete" | "absent" | "weekend" | "holiday"
  notes?: string
}

interface ReportSummary {
  totalDays: number
  workDays: number
  completeDays: number
  incompleteDays: number
  absentDays: number
  totalWorkedTime: string
  averageWorkedTime: string
  totalBalance: string
}

interface FilterOptions {
  startDate: string | null
  endDate: string | null
  status: string | null
  searchTerm: string
}

function Reports() {
  // Estados
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<TimeEntryReport[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [view, setView] = useState<"table" | "calendar" | "chart">("table")
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof TimeEntryReport; direction: "asc" | "desc" }>({
    key: "date",
    direction: "asc",
  })
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    status: null,
    searchTerm: "",
  })
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
  const [showExportOptions, setShowExportOptions] = useState(false)

  // Buscar relatórios com base nos filtros
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)

        // Construir parâmetros de consulta
        const params = new URLSearchParams()
        params.append("month", month.toString())
        params.append("year", year.toString())

        if (filters.startDate) params.append("startDate", filters.startDate)
        if (filters.endDate) params.append("endDate", filters.endDate)
        if (filters.status) params.append("status", filters.status)

        try {
          const response = await api.get(`/reports/time-entries?${params.toString()}`)

          // Adicionar status aos relatórios se não existir
          const reportsWithStatus = response.data.map((report: TimeEntryReport) => {
            if (!report.status) {
              if (!report.clockIn && !report.clockOut) {
                return { ...report, status: isWeekend(parseISO(report.date)) ? "weekend" : "absent" }
              } else if (!report.clockOut) {
                return { ...report, status: "incomplete" }
              } else {
                return { ...report, status: "complete" }
              }
            }
            return report
          })

          setReports(reportsWithStatus)
          calculateSummary(reportsWithStatus)
        } catch (error) {
          console.error("Erro ao buscar relatórios:", error)
          // Dados mockados poderiam ser adicionados aqui
          setReports([])
        }
      } catch (error) {
        console.error("Erro ao buscar relatórios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [month, year, filters.startDate, filters.endDate, filters.status])

  // Calcular resumo dos relatórios
  const calculateSummary = (reportData: TimeEntryReport[]) => {
    const totalDays = reportData.length
    const workDays = reportData.filter((r) => r.status !== "weekend" && r.status !== "holiday").length
    const completeDays = reportData.filter((r) => r.status === "complete").length
    const incompleteDays = reportData.filter((r) => r.status === "incomplete").length
    const absentDays = reportData.filter((r) => r.status === "absent").length

    // Calcular tempo total trabalhado
    let totalMinutes = 0
    reportData.forEach((report) => {
      if (report.totalWorked) {
        const [hours, minutes] = report.totalWorked.split(":").map(Number)
        totalMinutes += hours * 60 + minutes
      }
    })

    // Calcular saldo total
    let balanceMinutes = 0
    reportData.forEach((report) => {
      if (report.balance) {
        const isNegative = report.balance.startsWith("-")
        const [hours, minutes] = report.balance.replace("-", "").split(":").map(Number)
        const mins = hours * 60 + minutes
        balanceMinutes += isNegative ? -mins : mins
      }
    })

    // Formatar tempos
    const formatTime = (minutes: number) => {
      const absMinutes = Math.abs(minutes)
      const hours = Math.floor(absMinutes / 60)
      const mins = absMinutes % 60
      const sign = minutes < 0 ? "-" : ""
      return `${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
    }

    const totalWorkedTime = formatTime(totalMinutes)
    const averageWorkedTime = formatTime(workDays > 0 ? Math.round(totalMinutes / workDays) : 0)
    const totalBalance = formatTime(balanceMinutes)

    setSummary({
      totalDays,
      workDays,
      completeDays,
      incompleteDays,
      absentDays,
      totalWorkedTime,
      averageWorkedTime,
      totalBalance,
    })
  }

  // Filtrar relatórios com base no termo de pesquisa
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (!filters.searchTerm) return true

      const searchTerm = filters.searchTerm.toLowerCase()
      return (
        report.date.toLowerCase().includes(searchTerm) ||
        (report.totalWorked && report.totalWorked.toLowerCase().includes(searchTerm)) ||
        (report.balance && report.balance.toLowerCase().includes(searchTerm)) ||
        (report.notes && report.notes.toLowerCase().includes(searchTerm))
      )
    })
  }, [reports, filters.searchTerm])

  // Ordenar relatórios
  const sortedReports = useMemo(() => {
    const sortableReports = [...filteredReports]

    return sortableReports.sort((a, b) => {
      if (sortConfig.key === "date") {
        const dateA = new Date(a.date.split("/").reverse().join("-"))
        const dateB = new Date(b.date.split("/").reverse().join("-"))
        return sortConfig.direction === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
      }

      if (a[sortConfig.key] === null) return sortConfig.direction === "asc" ? 1 : -1
      if (b[sortConfig.key] === null) return sortConfig.direction === "asc" ? -1 : 1

      const valueA = a[sortConfig.key] || ""
      const valueB = b[sortConfig.key] || ""

      return sortConfig.direction === "asc"
        ? valueA.localeCompare(valueB.toString())
        : valueB.localeCompare(valueA.toString())
    })
  }, [filteredReports, sortConfig])

  // Função para alternar a ordenação
  const requestSort = (key: keyof TimeEntryReport) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Preparar dados para o calendário
  const calendarData = useMemo(() => {
    if (!month || !year) return []

    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map((day) => {
      const dateStr = format(day, "dd/MM/yyyy")
      const report = reports.find((r) => r.date === dateStr) || {
        id: `empty-${dateStr}`,
        date: dateStr,
        clockIn: null,
        breakStart: null,
        breakEnd: null,
        clockOut: null,
        totalWorked: "00:00",
        totalBreak: "00:00",
        balance: "00:00",
        status: isWeekend(day) ? "weekend" : "absent",
      }

      return report
    })
  }, [month, year, reports])

  // Gerar nome do arquivo para exportação
  const getExportFilename = () => {
    const monthName = format(new Date(year, month - 1), "MMMM", { locale: ptBR })
    return `relatorio-ponto-${monthName}-${year}.${exportFormat}`
  }

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = [
      "Data",
      "Entrada",
      "Início Intervalo",
      "Fim Intervalo",
      "Saída",
      "Total Trabalhado",
      "Tempo de Intervalo",
      "Saldo",
      "Status",
      "Observações",
    ].join(",")

    const rows = sortedReports.map((report) => {
      return [
        report.date,
        report.clockIn || "",
        report.breakStart || "",
        report.breakEnd || "",
        report.clockOut || "",
        report.totalWorked,
        report.totalBreak,
        report.balance,
        getStatusText(report.status) || "",
        report.notes || "",
      ]
        .map((value) => `"${value}"`)
        .join(",")
    })

    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", getExportFilename())
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Exportar para PDF
  const exportToPDF = async () => {
    try {
      const response = await api.post(
        "/reports/export-pdf",
        {
          reports: sortedReports,
          month,
          year,
          summary,
        },
        { responseType: "blob" },
      )

      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", getExportFilename())
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      alert("Erro ao gerar PDF. Tente novamente.")
    }
  }

  // Função para exportar relatório
  const handleExport = () => {
    if (exportFormat === "csv") {
      exportToCSV()
    } else {
      exportToPDF()
    }
    setShowExportOptions(false)
  }

  // Função para imprimir relatório
  const handlePrint = () => {
    window.print()
  }

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      status: null,
      searchTerm: "",
    })
  }

  // Função para obter texto de status
  const getStatusText = (status?: string) => {
    switch (status) {
      case "complete":
        return "Completo"
      case "incomplete":
        return "Incompleto"
      case "absent":
        return "Ausente"
      case "weekend":
        return "Final de Semana"
      case "holiday":
        return "Feriado"
      default:
        return "Desconhecido"
    }
  }

  // Função para obter ícone de status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle size={16} className="text-green-500" />
      case "incomplete":
        return <AlertCircle size={16} className="text-amber-500" />
      case "absent":
        return <X size={16} className="text-red-500" />
      case "weekend":
        return <Calendar size={16} className="text-gray-500" />
      case "holiday":
        return <Calendar size={16} className="text-blue-500" />
      default:
        return <HelpCircle size={16} className="text-gray-500" />
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
          <h1 className="text-2xl font-bold text-gray-800">Relatórios de Ponto</h1>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                className={`p-2 ${view === "table" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                onClick={() => setView("table")}
                title="Visualização em Tabela"
              >
                <List size={18} />
              </button>
              <button
                className={`p-2 ${view === "calendar" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                onClick={() => setView("calendar")}
                title="Visualização em Calendário"
              >
                <Grid size={18} />
              </button>
              <button
                className={`p-2 ${view === "chart" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                onClick={() => setView("chart")}
                title="Visualização em Gráfico"
              >
                <BarChart2 size={18} />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
            >
              Filtros
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
                leftIcon={<Download size={16} />}
              >
                Exportar
                <ChevronDown size={16} />
              </Button>

              {showExportOptions && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setExportFormat("csv")
                        handleExport()
                      }}
                    >
                      <FileText size={16} className="mr-2" />
                      <span>Exportar CSV</span>
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setExportFormat("pdf")
                        handleExport()
                      }}
                    >
                      <FileText size={16} className="mr-2" />
                      <span>Exportar PDF</span>
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handlePrint}
                    >
                      <Printer size={16} className="mr-2" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                        Mês:
                      </label>
                      <select
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status:
                      </label>
                      <select
                        id="status"
                        value={filters.status || ""}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Todos</option>
                        <option value="complete">Completo</option>
                        <option value="incomplete">Incompleto</option>
                        <option value="absent">Ausente</option>
                        <option value="weekend">Final de Semana</option>
                        <option value="holiday">Feriado</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buscar:</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={filters.searchTerm}
                          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                          className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {filters.searchTerm && (
                          <button
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setFilters({ ...filters, searchTerm: "" })}
                          >
                            <X size={16} className="text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {summary && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Trabalhado</p>
                  <p className="text-lg font-semibold">{summary.totalWorkedTime}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dias Trabalhados</p>
                  <p className="text-lg font-semibold">
                    {summary.completeDays} de {summary.workDays}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Média Diária</p>
                  <p className="text-lg font-semibold">{summary.averageWorkedTime}</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`bg-white ${summary.totalBalance.startsWith("-") ? "border-red-200" : "border-green-200"}`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${summary.totalBalance.startsWith("-") ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
                >
                  <BarChart2 size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Saldo Total</p>
                  <p
                    className={`text-lg font-semibold ${summary.totalBalance.startsWith("-") ? "text-red-600" : "text-green-600"}`}
                  >
                    {summary.totalBalance}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Carregando relatórios...</p>
          </div>
        ) : sortedReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <Calendar size={48} className="text-gray-300" />
              </div>
              <p className="text-gray-500">Nenhum registro encontrado para o período selecionado.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Visualização em Tabela */}
            {view === "table" && (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortConfig.key === "date" ? "bg-gray-100" : ""}`}
                          onClick={() => requestSort("date")}
                        >
                          <div className="flex items-center">
                            Data
                            {sortConfig.key === "date" && (
                              <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Entrada
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Saída
                        </th>
                        <th
                          scope="col"
                          className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortConfig.key === "totalWorked" ? "bg-gray-100" : ""}`}
                          onClick={() => requestSort("totalWorked")}
                        >
                          <div className="flex items-center">
                            Total
                            {sortConfig.key === "totalWorked" && (
                              <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortConfig.key === "balance" ? "bg-gray-100" : ""}`}
                          onClick={() => requestSort("balance")}
                        >
                          <div className="flex items-center">
                            Saldo
                            {sortConfig.key === "balance" && (
                              <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortConfig.key === "status" ? "bg-gray-100" : ""}`}
                          onClick={() => requestSort("status")}
                        >
                          <div className="flex items-center">
                            Status
                            {sortConfig.key === "status" && (
                              <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedReports.map((report) => (
                        <React.Fragment key={report.id}>
                          <tr
                            className={`hover:bg-gray-50 cursor-pointer ${
                              report.status === "weekend"
                                ? "bg-gray-50"
                                : report.status === "holiday"
                                  ? "bg-blue-50"
                                  : report.status === "absent"
                                    ? "bg-red-50"
                                    : ""
                            }`}
                            onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}
                          >
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {report.clockIn || "-"}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {report.clockOut || "-"}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {report.totalWorked}
                            </td>
                            <td
                              className={`px-3 py-2 whitespace-nowrap text-sm font-medium ${report.balance.startsWith("-") ? "text-red-600" : "text-green-600"}`}
                            >
                              {report.balance}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(report.status)}
                                <span className="ml-1.5 text-sm text-gray-700">{getStatusText(report.status)}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedRow(expandedRow === report.id ? null : report.id)
                                }}
                              >
                                {expandedRow === report.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>

                          {expandedRow === report.id && (
                            <tr>
                              <td colSpan={7} className="px-3 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detalhes do Registro</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className="text-gray-500">Entrada:</p>
                                        <p className="font-medium">{report.clockIn || "Não registrado"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Início Intervalo:</p>
                                        <p className="font-medium">{report.breakStart || "Não registrado"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Fim Intervalo:</p>
                                        <p className="font-medium">{report.breakEnd || "Não registrado"}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Saída:</p>
                                        <p className="font-medium">{report.clockOut || "Não registrado"}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Observações</h4>
                                    <p className="text-sm text-gray-600">
                                      {report.notes || "Nenhuma observação registrada."}
                                    </p>

                                    <div className="flex gap-2 mt-3">
                                      <Button size="sm" variant="outline" leftIcon={<FileText size={14} />}>
                                        Solicitar Ajuste
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Visualização em Calendário */}
            {view === "calendar" && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarData.map((day, index) => {
                      const dayOfWeek = new Date(day.date.split("/").reverse().join("-")).getDay()
                      const firstDayStyle = index === 0 ? { gridColumnStart: dayOfWeek + 1 } : {}

                      return (
                        <div
                          key={day.id}
                          style={firstDayStyle}
                          className={`p-1 rounded-md border ${
                            day.status === "weekend"
                              ? "bg-gray-50 border-gray-200"
                              : day.status === "holiday"
                                ? "bg-blue-50 border-blue-200"
                                : day.status === "absent"
                                  ? "bg-red-50 border-red-200"
                                  : day.status === "incomplete"
                                    ? "bg-amber-50 border-amber-200"
                                    : day.status === "complete"
                                      ? "bg-green-50 border-green-200"
                                      : "bg-white border-gray-200"
                          } hover:shadow-sm transition-shadow cursor-pointer`}
                          onClick={() => setExpandedRow(expandedRow === day.id ? null : day.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium">{day.date.split("/")[0]}</span>
                            {getStatusIcon(day.status)}
                          </div>

                          {day.clockIn && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">E:</span> {day.clockIn.substring(0, 5)}
                            </div>
                          )}

                          {day.clockOut && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">S:</span> {day.clockOut.substring(0, 5)}
                            </div>
                          )}

                          <div
                            className={`text-xs font-medium mt-1 ${day.balance.startsWith("-") ? "text-red-600" : "text-green-600"}`}
                          >
                            {day.balance}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default Reports
