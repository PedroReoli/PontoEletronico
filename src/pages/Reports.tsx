"use client"

import { useState, useEffect, useMemo } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import { useAuth } from "../hooks/useAuth"
import Layout from "../components/Layout"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, ChevronUp, Download, FileText, Filter, Search, X, BarChart2, Clock, CalendarIcon, List, Grid, Printer, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { Chart } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

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
  const {} = useAuth() // Removendo user não utilizado
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<TimeEntryReport[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [view, setView] = useState<'table' | 'calendar' | 'chart'>('table')
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{key: keyof TimeEntryReport, direction: 'asc' | 'desc'}>({
    key: 'date',
    direction: 'asc'
  })
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    status: null,
    searchTerm: ''
  })
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [showExportOptions, setShowExportOptions] = useState(false)

  // Buscar relatórios com base nos filtros
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        
        // Construir parâmetros de consulta
        const params = new URLSearchParams()
        params.append('month', month.toString())
        params.append('year', year.toString())
        
        if (filters.startDate) {
          params.append('startDate', filters.startDate)
        }
        
        if (filters.endDate) {
          params.append('endDate', filters.endDate)
        }
        
        if (filters.status) {
          params.append('status', filters.status)
        }
        
        const response = await api.get(`/reports/time-entries?${params.toString()}`)
        
        // Adicionar status aos relatórios se não existir
        const reportsWithStatus = response.data.map((report: TimeEntryReport) => {
          if (!report.status) {
            if (!report.clockIn && !report.clockOut) {
              return { ...report, status: isWeekend(parseISO(report.date)) ? 'weekend' : 'absent' }
            } else if (!report.clockOut) {
              return { ...report, status: 'incomplete' }
            } else {
              return { ...report, status: 'complete' }
            }
          }
          return report
        })
        
        setReports(reportsWithStatus)
        calculateSummary(reportsWithStatus)
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
    const workDays = reportData.filter(r => r.status !== 'weekend' && r.status !== 'holiday').length
    const completeDays = reportData.filter(r => r.status === 'complete').length
    const incompleteDays = reportData.filter(r => r.status === 'incomplete').length
    const absentDays = reportData.filter(r => r.status === 'absent').length
    
    // Calcular tempo total trabalhado
    let totalMinutes = 0
    reportData.forEach(report => {
      if (report.totalWorked) {
        const [hours, minutes] = report.totalWorked.split(':').map(Number)
        totalMinutes += hours * 60 + minutes
      }
    })
    
    // Calcular saldo total
    let balanceMinutes = 0
    reportData.forEach(report => {
      if (report.balance) {
        const isNegative = report.balance.startsWith('-')
        const [hours, minutes] = report.balance.replace('-', '').split(':').map(Number)
        const mins = hours * 60 + minutes
        balanceMinutes += isNegative ? -mins : mins
      }
    })
    
    // Formatar tempos
    const formatTime = (minutes: number) => {
      const absMinutes = Math.abs(minutes)
      const hours = Math.floor(absMinutes / 60)
      const mins = absMinutes % 60
      const sign = minutes < 0 ? '-' : ''
      return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
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
      totalBalance
    })
  }

  // Filtrar relatórios com base no termo de pesquisa
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
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
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date.split('/').reverse().join('-'))
        const dateB = new Date(b.date.split('/').reverse().join('-'))
        return sortConfig.direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime()
      }
      
      if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1
      if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1
      
      const valueA = a[sortConfig.key] || ''
      const valueB = b[sortConfig.key] || ''
      
      return sortConfig.direction === 'asc'
        ? valueA.localeCompare(valueB.toString())
        : valueB.localeCompare(valueA.toString())
    })
  }, [filteredReports, sortConfig])

  // Função para alternar a ordenação
  const requestSort = (key: keyof TimeEntryReport) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    const labels = sortedReports.map(report => report.date)
    
    // Converter horas:minutos para decimal
    const timeToDecimal = (timeStr: string | null) => {
      if (!timeStr) return 0
      const [hours, minutes] = timeStr.replace('-', '').split(':').map(Number)
      return parseFloat((hours + minutes / 60).toFixed(2))
    }
    
    const workedData = sortedReports.map(report => timeToDecimal(report.totalWorked))
    
    const balanceData = sortedReports.map(report => {
      const value = timeToDecimal(report.balance)
      return report.balance?.startsWith('-') ? -value : value
    })
    
    return {
      labels,
      datasets: [
        {
          label: 'Horas Trabalhadas',
          data: workedData,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Saldo',
          data: balanceData,
          backgroundColor: balanceData.map(value => 
            value < 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.5)'
          ),
          borderColor: balanceData.map(value => 
            value < 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(75, 192, 192, 1)'
          ),
          borderWidth: 1
        }
      ]
    }
  }, [sortedReports])

  // Opções do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Horas'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Data'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Horas Trabalhadas e Saldo'
      },
    },
  }

  // Preparar dados para a visualização de calendário
  const calendarData = useMemo(() => {
    if (!month || !year) return []
    
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))
    
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    return days.map(day => {
      const dateStr = format(day, 'dd/MM/yyyy')
      const report = reports.find(r => r.date === dateStr) || {
        id: `empty-${dateStr}`,
        date: dateStr,
        clockIn: null,
        breakStart: null,
        breakEnd: null,
        clockOut: null,
        totalWorked: '00:00',
        totalBreak: '00:00',
        balance: '00:00',
        status: isWeekend(day) ? 'weekend' : 'absent'
      }
      
      return report
    })
  }, [month, year, reports])

  // Preparar cabeçalhos para exportação
  const exportHeaders = {
    date: "Data",
    clockIn: "Entrada",
    breakStart: "Início Intervalo",
    breakEnd: "Fim Intervalo",
    clockOut: "Saída",
    totalWorked: "Total Trabalhado",
    totalBreak: "Tempo de Intervalo",
    balance: "Saldo",
    status: "Status",
    notes: "Observações"
  }

  // Gerar nome do arquivo para exportação
  const getExportFilename = () => {
    const monthName = format(new Date(year, month - 1), "MMMM", { locale: ptBR })
    return `relatorio-ponto-${monthName}-${year}.${exportFormat}`
  }

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = Object.values(exportHeaders).join(',')
    
    const rows = sortedReports.map(report => {
      return [
        report.date,
        report.clockIn || '',
        report.breakStart || '',
        report.breakEnd || '',
        report.clockOut || '',
        report.totalWorked,
        report.totalBreak,
        report.balance,
        report.status || '',
        report.notes || ''
      ].map(value => `"${value}"`).join(',')
    })
    
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', getExportFilename())
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Exportar para PDF
  const exportToPDF = async () => {
    try {
      const response = await api.post('/reports/export-pdf', {
        reports: sortedReports,
        month,
        year,
        summary
      }, { responseType: 'blob' })
      
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', getExportFilename())
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
    if (exportFormat === 'csv') {
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
      searchTerm: ''
    })
  }

  // Função para obter classe de status
  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'complete': return 'status-complete'
      case 'incomplete': return 'status-incomplete'
      case 'absent': return 'status-absent'
      case 'weekend': return 'status-weekend'
      case 'holiday': return 'status-holiday'
      default: return ''
    }
  }

  // Função para obter ícone de status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'complete': 
        return <CheckCircle size={16} className="status-icon complete" />
      case 'incomplete': 
        return <AlertCircle size={16} className="status-icon incomplete" />
      case 'absent': 
        return <X size={16} className="status-icon absent" />
      case 'weekend': 
        return <Calendar size={16} className="status-icon weekend" />
      case 'holiday': 
        return <Calendar size={16} className="status-icon holiday" />
      default: 
        return <HelpCircle size={16} className="status-icon" />
    }
  }

  // Função para obter texto de status
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'complete': return 'Completo'
      case 'incomplete': return 'Incompleto'
      case 'absent': return 'Ausente'
      case 'weekend': return 'Final de Semana'
      case 'holiday': return 'Feriado'
      default: return 'Desconhecido'
    }
  }

  // Componentes de animação
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <Layout>
      <div className="reports-container">
        <motion.div 
          className="reports-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Relatórios de Ponto</h1>

          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`view-button ${view === 'table' ? 'active' : ''}`} 
                onClick={() => setView('table')}
                title="Visualização em Tabela"
              >
                <List size={20} />
              </button>
              <button 
                className={`view-button ${view === 'calendar' ? 'active' : ''}`} 
                onClick={() => setView('calendar')}
                title="Visualização em Calendário"
              >
                <Grid size={20} />
              </button>
              <button 
                className={`view-button ${view === 'chart' ? 'active' : ''}`} 
                onClick={() => setView('chart')}
                title="Visualização em Gráfico"
              >
                <BarChart2 size={20} />
              </button>
            </div>

            <div className="reports-actions">
              <button 
                className="btn-filter" 
                onClick={() => setShowFilters(!showFilters)}
                title={showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
              >
                <Filter size={20} />
                <span>Filtros</span>
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <div className="export-container">
                <button 
                  className="btn-export" 
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  title="Exportar Relatório"
                >
                  <Download size={20} />
                  <span>Exportar</span>
                  <ChevronDown size={16} />
                </button>

                {showExportOptions && (
                  <motion.div 
                    className="export-options"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <button 
                      className="export-option" 
                      onClick={() => { setExportFormat('csv'); handleExport(); }}
                    >
                      <FileText size={16} />
                      <span>Exportar CSV</span>
                    </button>
                    <button 
                      className="export-option" 
                      onClick={() => { setExportFormat('pdf'); handleExport(); }}
                    >
                      <FileText size={16} />
                      <span>Exportar PDF</span>
                    </button>
                    <button 
                      className="export-option" 
                      onClick={handlePrint}
                    >
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="filters-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filters-content">
                <div className="filter-group">
                  <label htmlFor="month">Mês:</label>
                  <select 
                    id="month" 
                    value={month} 
                    onChange={(e) => setMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(2021, i, 1), "MMMM", { locale: ptBR })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="year">Ano:</label>
                  <select 
                    id="year" 
                    value={year} 
                    onChange={(e) => setYear(Number(e.target.value))}
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

                <div className="filter-group">
                  <label htmlFor="startDate">Data Inicial:</label>
                  <input 
                    type="date" 
                    id="startDate"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value || null})}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="endDate">Data Final:</label>
                  <input 
                    type="date" 
                    id="endDate"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value || null})}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="status">Status:</label>
                  <select 
                    id="status"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({...filters, status: e.target.value || null})}
                  >
                    <option value="">Todos</option>
                    <option value="complete">Completo</option>
                    <option value="incomplete">Incompleto</option>
                    <option value="absent">Ausente</option>
                    <option value="weekend">Final de Semana</option>
                    <option value="holiday">Feriado</option>
                  </select>
                </div>

                <div className="filter-group search-group">
                  <div className="search-input-container">
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Buscar..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    />
                    {filters.searchTerm && (
                      <button 
                        className="clear-search" 
                        onClick={() => setFilters({...filters, searchTerm: ''})}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <button className="btn-clear-filters" onClick={clearFilters}>
                  Limpar Filtros
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {summary && (
          <motion.div 
            className="reports-summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="summary-card">
              <div className="summary-icon">
                <Clock size={20} />
              </div>
              <div className="summary-content">
                <h3>Total Trabalhado</h3>
                <p>{summary.totalWorkedTime}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <CalendarIcon size={20} />
              </div>
              <div className="summary-content">
                <h3>Dias Trabalhados</h3>
                <p>{summary.completeDays} de {summary.workDays}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Clock size={20} />
              </div>
              <div className="summary-content">
                <h3>Média Diária</h3>
                <p>{summary.averageWorkedTime}</p>
              </div>
            </div>

            <div className={`summary-card ${summary.totalBalance.startsWith('-') ? 'negative' : 'positive'}`}>
              <div className="summary-icon">
                <BarChart2 size={20} />
              </div>
              <div className="summary-content">
                <h3>Saldo Total</h3>
                <p>{summary.totalBalance}</p>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <motion.div 
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="loading-spinner"></div>
            <p>Carregando relatórios...</p>
          </motion.div>
        ) : sortedReports.length === 0 ? (
          <motion.div 
            className="no-data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="no-data-icon">
              <Calendar size={48} />
            </div>
            <p>Nenhum registro encontrado para o período selecionado.</p>
          </motion.div>
        ) : (
          <>
            {/* Visualização em Tabela */}
            {view === 'table' && (
              <motion.div 
                className="reports-table-container"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th 
                        className={sortConfig.key === 'date' ? `sorted ${sortConfig.direction}` : ''}
                        onClick={() => requestSort('date')}
                      >
                        Data
                        {sortConfig.key === 'date' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Entrada</th>
                      <th>Início Intervalo</th>
                      <th>Fim Intervalo</th>
                      <th>Saída</th>
                      <th 
                        className={sortConfig.key === 'totalWorked' ? `sorted ${sortConfig.direction}` : ''}
                        onClick={() => requestSort('totalWorked')}
                      >
                        Total Trabalhado
                        {sortConfig.key === 'totalWorked' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Intervalo</th>
                      <th 
                        className={sortConfig.key === 'balance' ? `sorted ${sortConfig.direction}` : ''}
                        onClick={() => requestSort('balance')}
                      >
                        Saldo
                        {sortConfig.key === 'balance' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={sortConfig.key === 'status' ? `sorted ${sortConfig.direction}` : ''}
                        onClick={() => requestSort('status')}
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReports.map((report) => (
                      <>
                        <motion.tr 
                          key={report.id}
                          variants={item}
                          className={`${getStatusClass(report.status)} ${expandedRow === report.id ? 'expanded' : ''}`}
                          onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}
                        >
                          <td>{report.date}</td>
                          <td>{report.clockIn || "-"}</td>
                          <td>{report.breakStart || "-"}</td>
                          <td>{report.breakEnd || "-"}</td>
                          <td>{report.clockOut || "-"}</td>
                          <td>{report.totalWorked}</td>
                          <td>{report.totalBreak}</td>
                          <td className={report.balance.startsWith("-") ? "negative-balance" : "positive-balance"}>
                            {report.balance}
                          </td>
                          <td className="status-cell">
                            {getStatusIcon(report.status)}
                            <span>{getStatusText(report.status)}</span>
                          </td>
                          <td>
                            <button 
                              className="btn-expand"
                              title={expandedRow === report.id ? "Ocultar detalhes" : "Mostrar detalhes"}
                            >
                              {expandedRow === report.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </motion.tr>
                        {expandedRow === report.id && (
                          <motion.tr 
                            className="details-row"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={10}>
                              <div className="report-details">
                                <div className="details-section">
                                  <h4>Detalhes do Registro</h4>
                                  <div className="details-grid">
                                    <div className="detail-item">
                                      <span className="detail-label">Data:</span>
                                      <span className="detail-value">{report.date}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Status:</span>
                                      <span className="detail-value status-value">
                                        {getStatusIcon(report.status)}
                                        {getStatusText(report.status)}
                                      </span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Entrada:</span>
                                      <span className="detail-value">{report.clockIn || "Não registrado"}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Início do Intervalo:</span>
                                      <span className="detail-value">{report.breakStart || "Não registrado"}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Fim do Intervalo:</span>
                                      <span className="detail-value">{report.breakEnd || "Não registrado"}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Saída:</span>
                                      <span className="detail-value">{report.clockOut || "Não registrado"}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Total Trabalhado:</span>
                                      <span className="detail-value">{report.totalWorked}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Tempo de Intervalo:</span>
                                      <span className="detail-value">{report.totalBreak}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Saldo:</span>
                                      <span className={`detail-value ${report.balance.startsWith("-") ? "negative-balance" : "positive-balance"}`}>
                                        {report.balance}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="details-section">
                                  <h4>Observações</h4>
                                  <p className="report-notes">{report.notes || "Nenhuma observação registrada."}</p>
                                </div>
                                
                                <div className="details-actions">
                                  <button className="btn-detail-action">
                                    <FileText size={16} />
                                    <span>Solicitar Ajuste</span>
                                  </button>
                                  <button className="btn-detail-action">
                                    <Printer size={16} />
                                    <span>Imprimir</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Visualização em Calendário */}
            {view === 'calendar' && (
              <motion.div 
                className="calendar-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="calendar-header">
                  <div className="weekday">Dom</div>
                  <div className="weekday">Seg</div>
                  <div className="weekday">Ter</div>
                  <div className="weekday">Qua</div>
                  <div className="weekday">Qui</div>
                  <div className="weekday">Sex</div>
                  <div className="weekday">Sáb</div>
                </div>
                <div className="calendar-grid">
                  {calendarData.map((day, index) => {
                    const dayOfWeek = new Date(day.date.split('/').reverse().join('-')).getDay()
                    const firstDayStyle = index === 0 ? { gridColumnStart: dayOfWeek + 1 } : {}
                    
                    return (
                      <motion.div 
                        key={day.id}
                        className={`calendar-day ${getStatusClass(day.status)}`}
                        style={firstDayStyle}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setExpandedRow(expandedRow === day.id ? null : day.id)}
                      >
                        <div className="day-header">
                          <span className="day-number">{day.date.split('/')[0]}</span>
                          {getStatusIcon(day.status)}
                        </div>
                        <div className="day-content">
                          {day.clockIn && (
                            <div className="day-entry">
                              <span className="entry-label">Entrada:</span>
                              <span className="entry-time">{day.clockIn}</span>
                            </div>
                          )}
                          {day.clockOut && (
                            <div className="day-entry">
                              <span className="entry-label">Saída:</span>
                              <span className="entry-time">{day.clockOut}</span>
                            </div>
                          )}
                          <div className="day-total">
                            <span className="total-label">Total:</span>
                            <span className="total-time">{day.totalWorked}</span>
                          </div>
                        </div>
                        
                        {expandedRow === day.id && (
                          <div className="day-details">
                            <div className="details-overlay" onClick={(e) => e.stopPropagation()}>
                              <div className="details-header">
                                <h4>{day.date}</h4>
                                <button 
                                  className="close-details"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setExpandedRow(null)
                                  }}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <div className="details-content">
                                <div className="detail-row">
                                  <span className="detail-label">Entrada:</span>
                                  <span className="detail-value">{day.clockIn || "Não registrado"}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Início Intervalo:</span>
                                  <span className="detail-value">{day.breakStart || "Não registrado"}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Fim Intervalo:</span>
                                  <span className="detail-value">{day.breakEnd || "Não registrado"}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Saída:</span>
                                  <span className="detail-value">{day.clockOut || "Não registrado"}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Total Trabalhado:</span>
                                  <span className="detail-value">{day.totalWorked}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Intervalo:</span>
                                  <span className="detail-value">{day.totalBreak}</span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Saldo:</span>
                                  <span className={`detail-value ${day.balance.startsWith("-") ? "negative-balance" : "positive-balance"}`}>
                                    {day.balance}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <span className="detail-label">Status:</span>
                                  <span className="detail-value status-value">
                                    {getStatusIcon(day.status)}
                                    {getStatusText(day.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Visualização em Gráfico */}
            {view === 'chart' && (
              <motion.div 
                className="chart-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="chart-container">
                  <Chart type='bar' data={chartData} options={chartOptions} />
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(54, 162, 235, 0.5)'}}></div>
                    <span>Horas Trabalhadas</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(75, 192, 192, 0.5)'}}></div>
                    <span>Saldo Positivo</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(255, 99, 132, 0.5)'}}></div>
                    <span>Saldo Negativo</span>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default Reports