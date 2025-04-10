"use client"

import { useState, useEffect, useMemo } from "react"
import { format, subDays, parseISO, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import api from "../services/api"
import Layout from "../components/Layout"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Download, Filter, Search, Bell, ChevronDown, ChevronUp, MapPin, MessageSquare, Eye, Check, X, AlertTriangle, Coffee, UserCheck, UserX, ClockIcon, BarChart2, CalendarIcon, Settings, Users, FileText, Sliders, RefreshCw } from 'lucide-react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
// import './manager-dashboard.css'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface TeamMember {
  id: string
  name: string
  email: string
  status: "PRESENT" | "ABSENT" | "BREAK" | "NOT_STARTED"
  lastEntry?: {
    type: string
    timestamp: string
  }
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  department?: string
  position?: string
  avatar?: string
  workSchedule?: {
    start: string
    end: string
  }
  stats?: {
    onTimePercentage: number
    attendancePercentage: number
    averageHoursPerDay: number
  }
}

interface AdjustmentRequest {
  id: string
  userId: string
  userName: string
  date: string
  type: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  reason?: string
  requestedTime?: string
}

interface Notification {
  id: string
  type: "ALERT" | "INFO" | "WARNING"
  message: string
  timestamp: string
  read: boolean
  relatedUserId?: string
  relatedUserName?: string
}

interface AttendanceData {
  date: string
  present: number
  absent: number
  late: number
}

interface DepartmentStats {
  department: string
  presentPercentage: number
  absentPercentage: number
  latePercentage: number
}

function ManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingAdjustments, setPendingAdjustments] = useState<AdjustmentRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceData[]>([])
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [currentDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'adjustments' | 'analytics'>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMemberDetails, setShowMemberDetails] = useState(false)
  const [showAdjustmentDetails, setShowAdjustmentDetails] = useState<string | null>(null)

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [
          teamResponse, 
          adjustmentsResponse, 
          notificationsResponse,
          attendanceResponse,
          departmentsResponse
        ] = await Promise.all([
          api.get("/manager/team"),
          api.get("/manager/adjustments?status=PENDING"),
          api.get("/manager/notifications"),
          api.get("/manager/attendance/history?days=14"),
          api.get("/manager/departments/stats")
        ])

        setTeamMembers(teamResponse.data)
        setPendingAdjustments(adjustmentsResponse.data)
        setNotifications(notificationsResponse.data)
        setAttendanceHistory(attendanceResponse.data)
        setDepartmentStats(departmentsResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Função para atualizar dados
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const [
        teamResponse, 
        adjustmentsResponse, 
        notificationsResponse
      ] = await Promise.all([
        api.get("/manager/team"),
        api.get("/manager/adjustments?status=PENDING"),
        api.get("/manager/notifications")
      ])

      setTeamMembers(teamResponse.data)
      setPendingAdjustments(adjustmentsResponse.data)
      setNotifications(notificationsResponse.data)
    } catch (error) {
      console.error("Erro ao atualizar dados:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filtrar membros da equipe
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = !statusFilter || member.status === statusFilter
      const matchesDepartment = !departmentFilter || member.department === departmentFilter
      
      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [teamMembers, searchTerm, statusFilter, departmentFilter])

  // Obter departamentos únicos para o filtro
  const departments = useMemo(() => {
    const depts = new Set<string>()
    teamMembers.forEach(member => {
      if (member.department) {
        depts.add(member.department)
      }
    })
    return Array.from(depts)
  }, [teamMembers])

  // Marcar notificação como lida
  const markNotificationAsRead = async (id: string) => {
    try {
      await api.put(`/manager/notifications/${id}/read`)
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  // Aprovar ajuste
  const approveAdjustment = async (id: string) => {
    try {
      await api.put(`/manager/adjustments/${id}/approve`)
      setPendingAdjustments(prev => prev.filter(adjustment => adjustment.id !== id))
    } catch (error) {
      console.error("Erro ao aprovar ajuste:", error)
    }
  }

  // Rejeitar ajuste
  const rejectAdjustment = async (id: string) => {
    try {
      await api.put(`/manager/adjustments/${id}/reject`)
      setPendingAdjustments(prev => prev.filter(adjustment => adjustment.id !== id))
    } catch (error) {
      console.error("Erro ao rejeitar ajuste:", error)
    }
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "status-present"
      case "ABSENT":
        return "status-absent"
      case "BREAK":
        return "status-break"
      case "NOT_STARTED":
        return "status-not-started"
      default:
        return ""
    }
  }

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "Presente"
      case "ABSENT":
        return "Ausente"
      case "BREAK":
        return "Em intervalo"
      case "NOT_STARTED":
        return "Não iniciou"
      default:
        return status
    }
  }

  // Obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <UserCheck size={16} />
      case "ABSENT":
        return <UserX size={16} />
      case "BREAK":
        return <Coffee size={16} />
      case "NOT_STARTED":
        return <ClockIcon size={16} />
      default:
        return null
    }
  }

  // Obter ícone do tipo de notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ALERT":
        return <AlertTriangle size={16} className="notification-icon alert" />
      case "WARNING":
        return <AlertTriangle size={16} className="notification-icon warning" />
      case "INFO":
        return <Bell size={16} className="notification-icon info" />
      default:
        return <Bell size={16} className="notification-icon" />
    }
  }

  // Dados para o gráfico de presença
  const attendanceChartData = {
    labels: attendanceHistory.map(day => format(parseISO(day.date), "dd/MM")),
    datasets: [
      {
        label: 'Presentes',
        data: attendanceHistory.map(day => day.present),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Ausentes',
        data: attendanceHistory.map(day => day.absent),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      },
      {
        label: 'Atrasados',
        data: attendanceHistory.map(day => day.late),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4
      }
    ]
  }

  // Dados para o gráfico de departamentos
  const departmentChartData = {
    labels: departmentStats.map(dept => dept.department),
    datasets: [
      {
        label: 'Presentes (%)',
        data: departmentStats.map(dept => dept.presentPercentage),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
      {
        label: 'Ausentes (%)',
        data: departmentStats.map(dept => dept.absentPercentage),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: 'Atrasados (%)',
        data: departmentStats.map(dept => dept.latePercentage),
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
      }
    ]
  }

  // Dados para o gráfico de distribuição de status
  const statusDistributionData = {
    labels: ['Presentes', 'Ausentes', 'Em Intervalo', 'Não Iniciaram'],
    datasets: [
      {
        data: [
          teamMembers.filter(m => m.status === 'PRESENT').length,
          teamMembers.filter(m => m.status === 'ABSENT').length,
          teamMembers.filter(m => m.status === 'BREAK').length,
          teamMembers.filter(m => m.status === 'NOT_STARTED').length
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(201, 203, 207, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  }

  // Animações
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  }

  return (
    <Layout>
      <div className="manager-dashboard">
        <div className="dashboard-header">
          <motion.div
            className="header-content"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Dashboard do Gestor</h1>
            <p className="header-date">{format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </motion.div>

          <motion.div
            className="header-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="notification-container">
              <button 
                className={`btn-notification ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="notifications-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="notifications-header">
                      <h3>Notificações</h3>
                      <button className="btn-text">Marcar todas como lidas</button>
                    </div>
                    
                    <div className="notifications-list">
                      {notifications.length === 0 ? (
                        <div className="empty-notifications">
                          <Bell size={24} />
                          <p>Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            {getNotificationIcon(notification.type)}
                            <div className="notification-content">
                              <p className="notification-message">{notification.message}</p>
                              <span className="notification-time">
                                {isToday(parseISO(notification.timestamp)) 
                                  ? format(parseISO(notification.timestamp), "'Hoje,' HH:mm") 
                                  : format(parseISO(notification.timestamp), "dd/MM/yyyy, HH:mm")}
                              </span>
                            </div>
                            {!notification.read && <div className="unread-indicator"></div>}
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 5 && (
                      <div className="notifications-footer">
                        <button className="btn-text">Ver todas ({notifications.length})</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`} 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw size={20} />
            </button>
            
            <button className="btn-primary">
              <FileText size={18} />
              <span>Relatório</span>
            </button>
          </motion.div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart2 size={18} />
            <span>Visão Geral</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={18} />
            <span>Equipe</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'adjustments' ? 'active' : ''}`}
            onClick={() => setActiveTab('adjustments')}
          >
            <Sliders size={18} />
            <span>Ajustes</span>
            {pendingAdjustments.length > 0 && (
              <span className="tab-badge">{pendingAdjustments.length}</span>
            )}
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={18} />
            <span>Análises</span>
          </button>
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <>
            <motion.div className="stats-overview" variants={container} initial="hidden" animate="show">
              <motion.div className="stat-card" variants={item}>
                <div className="stat-icon present">
                  <UserCheck size={24} />
                </div>
                <div className="stat-info">
                  <h3>Presentes</h3>
                  <p className="stat-value">{teamMembers.filter((member) => member.status === "PRESENT").length}</p>
                </div>
                <div className="stat-progress">
                  <div
                    className="progress-bar present"
                    style={{
                      width: `${(teamMembers.filter((member) => member.status === "PRESENT").length / teamMembers.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </motion.div>

              <motion.div className="stat-card" variants={item}>
                <div className="stat-icon break">
                  <Coffee size={24} />
                </div>
                <div className="stat-info">
                  <h3>Em Intervalo</h3>
                  <p className="stat-value">{teamMembers.filter((member) => member.status === "BREAK").length}</p>
                </div>
                <div className="stat-progress">
                  <div
                    className="progress-bar break"
                    style={{
                      width: `${(teamMembers.filter((member) => member.status === "BREAK").length / teamMembers.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </motion.div>

              <motion.div className="stat-card" variants={item}>
                <div className="stat-icon absent">
                  <UserX size={24} />
                </div>
                <div className="stat-info">
                  <h3>Ausentes</h3>
                  <p className="stat-value">{teamMembers.filter((member) => member.status === "ABSENT").length}</p>
                </div>
                <div className="stat-progress">
                  <div
                    className="progress-bar absent"
                    style={{
                      width: `${(teamMembers.filter((member) => member.status === "ABSENT").length / teamMembers.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </motion.div>

              <motion.div className="stat-card" variants={item}>
                <div className="stat-icon not-started">
                  <ClockIcon size={24} />
                </div>
                <div className="stat-info">
                  <h3>Não Iniciaram</h3>
                  <p className="stat-value">{teamMembers.filter((member) => member.status === "NOT_STARTED").length}</p>
                </div>
                <div className="stat-progress">
                  <div
                    className="progress-bar not-started"
                    style={{
                      width: `${(teamMembers.filter((member) => member.status === "NOT_STARTED").length / teamMembers.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </motion.div>
            </motion.div>

            <div className="dashboard-grid">
              <motion.div
                className="dashboard-card team-status"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <h2>Status da Equipe</h2>
                    <span className="card-subtitle">Visão geral da sua equipe</span>
                  </div>
                  <div className="card-actions">
                    <div className="search-container">
                      <Search size={16} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Buscar membro..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button className="btn-export">
                      <Download size={18} />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-container">
                    <div className="loading-animation">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p>Carregando dados da equipe...</p>
                  </div>
                ) : (
                  <div className="team-list">
                    {filteredTeamMembers.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <Users size={48} />
                        </div>
                        <p>Nenhum membro encontrado</p>
                        <button className="btn-add">Adicionar Membros</button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="team-table">
                          <thead>
                            <tr>
                              <th>Funcionário</th>
                              <th>Status</th>
                              <th>Último Registro</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTeamMembers.slice(0, 5).map((member, index) => (
                              <motion.tr
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <td className="member-info">
                                  <div className="member-avatar">
                                    {member.avatar ? (
                                      <img src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    ) : (
                                      member.name.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="member-details">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-email">{member.email}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`status-badge ${getStatusColor(member.status)}`}>
                                    {getStatusIcon(member.status)}
                                    {getStatusText(member.status)}
                                  </span>
                                </td>
                                <td>
                                  {member.lastEntry ? (
                                    <div className="last-entry">
                                      <span className="entry-time">
                                        {format(new Date(member.lastEntry.timestamp), "HH:mm")}
                                      </span>
                                      <span className="entry-type">
                                        {member.lastEntry.type === "CLOCK_IN" && "Entrada"}
                                        {member.lastEntry.type === "BREAK_START" && "Início do Intervalo"}
                                        {member.lastEntry.type === "BREAK_END" && "Fim do Intervalo"}
                                        {member.lastEntry.type === "CLOCK_OUT" && "Saída"}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="no-entry">Nenhum registro</span>
                                  )}
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <motion.button
                                      className="btn-icon"
                                      title="Ver detalhes"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => {
                                        setSelectedMember(member)
                                        setShowMemberDetails(true)
                                      }}
                                    >
                                      <Eye size={18} />
                                    </motion.button>
                                    <motion.button
                                      className="btn-icon"
                                      title="Enviar mensagem"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <MessageSquare size={18} />
                                    </motion.button>
                                    {member.location && (
                                      <motion.button
                                        className="btn-icon"
                                        title="Ver localização"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <MapPin size={18} />
                                      </motion.button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {filteredTeamMembers.length > 5 && (
                      <div className="view-more">
                        <button className="btn-text" onClick={() => setActiveTab('team')}>
                          Ver todos os membros ({filteredTeamMembers.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div
                className="dashboard-card pending-adjustments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <h2>Ajustes Pendentes</h2>
                    <span className="card-subtitle">Solicitações aguardando aprovação</span>
                  </div>
                  <button className="btn-primary" onClick={() => setActiveTab('adjustments')}>
                    Ver Todos
                  </button>
                </div>

                {loading ? (
                  <div className="loading-container">
                    <div className="loading-animation">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p>Carregando ajustes pendentes...</p>
                  </div>
                ) : (
                  <>
                    {pendingAdjustments.length > 0 ? (
                      <div className="adjustments-list">
                        {pendingAdjustments.slice(0, 5).map((adjustment, index) => (
                          <motion.div
                            key={adjustment.id}
                            className="adjustment-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="adjustment-info">
                              <div className="adjustment-user">{adjustment.userName}</div>
                              <div className="adjustment-details">
                                <span className="adjustment-date">{format(new Date(adjustment.date), "dd/MM/yyyy")}</span>
                                <span className="adjustment-type">
                                  {adjustment.type === "CLOCK_IN" && "Entrada"}
                                  {adjustment.type === "BREAK_START" && "Início do Intervalo"}
                                  {adjustment.type === "BREAK_END" && "Fim do Intervalo"}
                                  {adjustment.type === "CLOCK_OUT" && "Saída"}
                                </span>
                                {adjustment.requestedTime && (
                                  <span className="adjustment-time">{adjustment.requestedTime}</span>
                                )}
                              </div>
                            </div>
                            <div className="adjustment-actions">
                              <motion.button
                                className="btn-icon approve"
                                title="Aprovar"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => approveAdjustment(adjustment.id)}
                              >
                                <Check size={18} />
                              </motion.button>
                              <motion.button
                                className="btn-icon reject"
                                title="Rejeitar"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => rejectAdjustment(adjustment.id)}
                              >
                                <X size={18} />
                              </motion.button>
                              <motion.button
                                className="btn-icon"
                                title="Ver detalhes"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowAdjustmentDetails(adjustment.id)}
                              >
                                <Eye size={18} />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                        {pendingAdjustments.length > 5 && (
                          <div className="view-more">
                            <button className="btn-text" onClick={() => setActiveTab('adjustments')}>
                              Ver mais {pendingAdjustments.length - 5} ajustes pendentes
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <Check size={48} />
                        </div>
                        <p>Nenhum ajuste pendente</p>
                        <span className="empty-subtitle">Tudo em dia!</span>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>

            <motion.div 
              className="dashboard-card attendance-chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="card-header">
                <div className="card-title">
                  <h2>Tendência de Presença</h2>
                  <span className="card-subtitle">Últimos 14 dias</span>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(75, 192, 192, 0.7)'}}></div>
                    <span>Presentes</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(255, 99, 132, 0.7)'}}></div>
                    <span>Ausentes</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(255, 159, 64, 0.7)'}}></div>
                    <span>Atrasados</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-animation">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <Line 
                    data={attendanceChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Número de funcionários'
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Aba Equipe */}
        {activeTab === 'team' && (
          <motion.div 
            className="dashboard-card full-width"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="card-header">
              <div className="card-title">
                <h2>Gerenciamento de Equipe</h2>
                <span className="card-subtitle">Todos os membros da sua equipe</span>
              </div>
              <div className="card-actions">
                <div className="search-container">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Buscar membro..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-container">
                  <button className="btn-filter">
                    <Filter size={16} />
                    <span>Filtrar</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="filter-dropdown">
                    <div className="filter-group">
                      <label>Status</label>
                      <select 
                        value={statusFilter || ''} 
                        onChange={(e) => setStatusFilter(e.target.value || null)}
                      >
                        <option value="">Todos</option>
                        <option value="PRESENT">Presentes</option>
                        <option value="ABSENT">Ausentes</option>
                        <option value="BREAK">Em Intervalo</option>
                        <option value="NOT_STARTED">Não Iniciaram</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Departamento</label>
                      <select 
                        value={departmentFilter || ''} 
                        onChange={(e) => setDepartmentFilter(e.target.value || null)}
                      >
                        <option value="">Todos</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button className="btn-export">
                  <Download size={18} />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-animation">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <p>Carregando dados da equipe...</p>
              </div>
            ) : (
              <div className="team-list">
                {filteredTeamMembers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Users size={48} />
                    </div>
                    <p>Nenhum membro encontrado</p>
                    <button className="btn-add">Adicionar Membros</button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="team-table">
                      <thead>
                        <tr>
                          <th>Funcionário</th>
                          <th>Departamento</th>
                          <th>Status</th>
                          <th>Horário</th>
                          <th>Último Registro</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeamMembers.map((member, index) => (
                          <motion.tr
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                          >
                            <td className="member-info">
                              <div className="member-avatar">
                                {member.avatar ? (
                                  <img src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                ) : (
                                  member.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="member-details">
                                <span className="member-name">{member.name}</span>
                                <span className="member-email">{member.email}</span>
                              </div>
                            </td>
                            <td>
                              <span className="department-badge">
                                {member.department || "Não definido"}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${getStatusColor(member.status)}`}>
                                {getStatusIcon(member.status)}
                                {getStatusText(member.status)}
                              </span>
                            </td>
                            <td>
                              {member.workSchedule ? (
                                <span className="work-schedule">
                                  {member.workSchedule.start} - {member.workSchedule.end}
                                </span>
                              ) : (
                                <span className="no-schedule">Não definido</span>
                              )}
                            </td>
                            <td>
                              {member.lastEntry ? (
                                <div className="last-entry">
                                  <span className="entry-time">
                                    {format(new Date(member.lastEntry.timestamp), "HH:mm")}
                                  </span>
                                  <span className="entry-type">
                                    {member.lastEntry.type === "CLOCK_IN" && "Entrada"}
                                    {member.lastEntry.type === "BREAK_START" && "Início do Intervalo"}
                                    {member.lastEntry.type === "BREAK_END" && "Fim do Intervalo"}
                                    {member.lastEntry.type === "CLOCK_OUT" && "Saída"}
                                  </span>
                                </div>
                              ) : (
                                <span className="no-entry">Nenhum registro</span>
                              )}
                            </td>
                            <td>
                              <div className="action-buttons">
                                <motion.button
                                  className="btn-icon"
                                  title="Ver detalhes"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setSelectedMember(member)
                                    setShowMemberDetails(true)
                                  }}
                                >
                                  <Eye size={18} />
                                </motion.button>
                                <motion.button
                                  className="btn-icon"
                                  title="Enviar mensagem"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <MessageSquare size={18} />
                                </motion.button>
                                {member.location && (
                                  <motion.button
                                    className="btn-icon"
                                    title="Ver localização"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <MapPin size={18} />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Aba Ajustes */}
        {activeTab === 'adjustments' && (
          <motion.div 
            className="dashboard-card full-width"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="card-header">
              <div className="card-title">
                <h2>Solicitações de Ajuste</h2>
                <span className="card-subtitle">Gerenciar solicitações de ajuste de ponto</span>
              </div>
              <div className="card-actions">
                <div className="search-container">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Buscar solicitação..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-export">
                  <Download size={18} />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="loading-animation">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <p>Carregando solicitações de ajuste...</p>
              </div>
            ) : (
              <div className="adjustments-table-container">
                {pendingAdjustments.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Check size={48} />
                    </div>
                    <p>Nenhum ajuste pendente</p>
                    <span className="empty-subtitle">Tudo em dia!</span>
                  </div>
                ) : (
                  <table className="adjustments-table">
                    <thead>
                      <tr>
                        <th>Funcionário</th>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Horário Solicitado</th>
                        <th>Motivo</th>
                        <th>Solicitado em</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAdjustments.map((adjustment, index) => (
                        <motion.tr
                          key={adjustment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <td>{adjustment.userName}</td>
                          <td>{format(new Date(adjustment.date), "dd/MM/yyyy")}</td>
                          <td>
                            <span className="adjustment-type-badge">
                              {adjustment.type === "CLOCK_IN" && "Entrada"}
                              {adjustment.type === "BREAK_START" && "Início do Intervalo"}
                              {adjustment.type === "BREAK_END" && "Fim do Intervalo"}
                              {adjustment.type === "CLOCK_OUT" && "Saída"}
                            </span>
                          </td>
                          <td>{adjustment.requestedTime || "Não especificado"}</td>
                          <td>
                            <div className="reason-cell">
                              {adjustment.reason ? (
                                adjustment.reason.length > 30 ? 
                                  `${adjustment.reason.substring(0, 30)}...` : 
                                  adjustment.reason
                              ) : (
                                "Não especificado"
                              )}
                            </div>
                          </td>
                          <td>{format(new Date(adjustment.createdAt), "dd/MM/yyyy HH:mm")}</td>
                          <td>
                            <div className="action-buttons">
                              <motion.button
                                className="btn-icon approve"
                                title="Aprovar"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => approveAdjustment(adjustment.id)}
                              >
                                <Check size={18} />
                              </motion.button>
                              <motion.button
                                className="btn-icon reject"
                                title="Rejeitar"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => rejectAdjustment(adjustment.id)}
                              >
                                <X size={18} />
                              </motion.button>
                              <motion.button
                                className="btn-icon"
                                title="Ver detalhes"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowAdjustmentDetails(adjustment.id)}
                              >
                                <Eye size={18} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Aba Análises */}
        {activeTab === 'analytics' && (
          <div className="analytics-grid">
            <motion.div 
              className="dashboard-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card-header">
                <div className="card-title">
                  <h2>Distribuição de Status</h2>
                  <span className="card-subtitle">Status atual da equipe</span>
                </div>
              </div>
              <div className="chart-container donut-chart">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-animation">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <Doughnut 
                    data={statusDistributionData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </motion.div>

            <motion.div 
              className="dashboard-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-header">
                <div className="card-title">
                  <h2>Análise por Departamento</h2>
                  <span className="card-subtitle">Comparativo entre departamentos</span>
                </div>
              </div>
              <div className="chart-container">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-animation">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <Bar 
                    data={departmentChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Porcentagem (%)'
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </motion.div>

            <motion.div 
              className="dashboard-card full-width"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card-header">
                <div className="card-title">
                  <h2>Tendência de Presença</h2>
                  <span className="card-subtitle">Últimos 14 dias</span>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(75, 192, 192, 0.7)'}}></div>
                    <span>Presentes</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(255, 99, 132, 0.7)'}}></div>
                    <span>Ausentes</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: 'rgba(255, 159, 64, 0.7)'}}></div>
                    <span>Atrasados</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-animation">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <p>Carregando dados...</p>
                  </div>
                ) : (
                  <Line 
                    data={attendanceChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Número de funcionários'
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Detalhes do Membro */}
        <AnimatePresence>
          {showMemberDetails && selectedMember && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemberDetails(false)}
            >
              <motion.div 
                className="modal-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Detalhes do Funcionário</h2>
                  <button className="btn-close" onClick={() => setShowMemberDetails(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="member-profile">
                    <div className="member-profile-header">
                      <div className="member-avatar large">
                        {selectedMember.avatar ? (
                          <img src={selectedMember.avatar || "/placeholder.svg"} alt={selectedMember.name} />
                        ) : (
                          selectedMember.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="member-profile-info">
                        <h3>{selectedMember.name}</h3>
                        <p className="member-email">{selectedMember.email}</p>
                        <div className="member-meta">
                          <span className="member-department">{selectedMember.department || "Sem departamento"}</span>
                          <span className="member-position">{selectedMember.position || "Cargo não definido"}</span>
                        </div>
                        <span className={`status-badge ${getStatusColor(selectedMember.status)}`}>
                          {getStatusIcon(selectedMember.status)}
                          {getStatusText(selectedMember.status)}
                        </span>
                      </div>
                    </div>

                    <div className="member-stats">
                      <div className="stat-item">
                        <div className="stat-icon">
                          <Clock size={20} />
                        </div>
                        <div className="stat-content">
                          <h4>Pontualidade</h4>
                          <p>{selectedMember.stats?.onTimePercentage || 0}%</p>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon">
                          <CalendarIcon size={20} />
                        </div>
                        <div className="stat-content">
                          <h4>Presença</h4>
                          <p>{selectedMember.stats?.attendancePercentage || 0}%</p>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon">
                          <ClockIcon size={20} />
                        </div>
                        <div className="stat-content">
                          <h4>Média Diária</h4>
                          <p>{selectedMember.stats?.averageHoursPerDay || 0}h</p>
                        </div>
                      </div>
                    </div>

                    {selectedMember.location && (
                      <div className="member-location">
                        <h4>Última Localização</h4>
                        <p className="location-address">
                          <MapPin size={16} />
                          {selectedMember.location.address}
                        </p>
                        <div className="location-map">
                          {/* Aqui seria renderizado um mapa com a localização */}
                          <div className="map-placeholder">
                            <MapPin size={24} />
                            <span>Mapa de localização</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowMemberDetails(false)}>
                    Fechar
                  </button>
                  <button className="btn-primary">
                    <MessageSquare size={16} />
                    <span>Enviar Mensagem</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes do Ajuste */}
        <AnimatePresence>
          {showAdjustmentDetails && (
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdjustmentDetails(null)}
            >
              <motion.div 
                className="modal-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Detalhes da Solicitação</h2>
                  <button className="btn-close" onClick={() => setShowAdjustmentDetails(null)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  {pendingAdjustments.filter(adj => adj.id === showAdjustmentDetails).map(adjustment => (
                    <div key={adjustment.id} className="adjustment-details">
                      <div className="detail-row">
                        <span className="detail-label">Funcionário:</span>
                        <span className="detail-value">{adjustment.userName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Data:</span>
                        <span className="detail-value">{format(new Date(adjustment.date), "dd/MM/yyyy")}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Tipo:</span>
                        <span className="detail-value">
                          {adjustment.type === "CLOCK_IN" && "Entrada"}
                          {adjustment.type === "BREAK_START" && "Início do Intervalo"}
                          {adjustment.type === "BREAK_END" && "Fim do Intervalo"}
                          {adjustment.type === "CLOCK_OUT" && "Saída"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Horário Solicitado:</span>
                        <span className="detail-value">{adjustment.requestedTime || "Não especificado"}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Solicitado em:</span>
                        <span className="detail-value">{format(new Date(adjustment.createdAt), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                      <div className="detail-section">
                        <span className="detail-label">Motivo:</span>
                        <div className="detail-reason">
                          {adjustment.reason || "Nenhum motivo especificado."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowAdjustmentDetails(null)}>
                    Cancelar
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      rejectAdjustment(showAdjustmentDetails)
                      setShowAdjustmentDetails(null)
                    }}
                  >
                    <X size={16} />
                    <span>Rejeitar</span>
                  </button>
                  <button 
                    className="btn-success"
                    onClick={() => {
                      approveAdjustment(showAdjustmentDetails)
                      setShowAdjustmentDetails(null)
                    }}
                  >
                    <Check size={16} />
                    <span>Aprovar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}

export default ManagerDashboard