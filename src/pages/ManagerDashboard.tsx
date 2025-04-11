"use client"

import { useMemo } from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Users,
  Clock,
  Calendar,
  FileText,
  UserCheck,
  UserX,
  Coffee,
  CheckCircle,
  Eye,
  MessageSquare,
  MapPin,
} from "lucide-react"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { SummaryItem } from "@/components/ui/SummaryItem"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Tipos
interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  position?: string
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
  workSchedule?: {
    start: string
    end: string
  }
}

interface PendingRequest {
  id: string
  type: "adjustment" | "absence" | "overtime"
  employeeName: string
  employeeAvatar?: string
  date: string
  status: "pending" | "approved" | "rejected"
  description: string
}

interface TeamMetrics {
  totalMembers: number
  presentToday: number
  onBreak: number
  absent: number
  lateToday: number
  averageHours: string
  pendingRequests: number
}

function ManagerDashboard() {
  // Estados
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"team" | "requests">("team")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [currentDate] = useState(new Date())

  // Efeito para buscar dados
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const [teamResponse, requestsResponse, metricsResponse] = await Promise.all([
            api.get("/manager/team"),
            api.get("/manager/pending-requests"),
            api.get("/manager/metrics"),
          ])

          setTeamMembers(teamResponse.data)
          setPendingRequests(requestsResponse.data)
          setMetrics(metricsResponse.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados para desenvolvimento
          const mockTeamMembers: TeamMember[] = [
            {
              id: "user-1",
              name: "Ana Silva",
              email: "ana.silva@empresa.com",
              avatar: "https://i.pravatar.cc/150?img=1",
              position: "Desenvolvedora Frontend",
              status: "PRESENT",
              department: "Desenvolvimento",
              lastEntry: {
                type: "CLOCK_IN",
                timestamp: "2025-04-11T08:05:00",
              },
            },
            {
              id: "user-2",
              name: "Carlos Mendes",
              email: "carlos.mendes@empresa.com",
              avatar: "https://i.pravatar.cc/150?img=4",
              position: "Desenvolvedor Backend",
              status: "BREAK",
              department: "Desenvolvimento",
              lastEntry: {
                type: "BREAK_START",
                timestamp: "2025-04-11T12:00:00",
              },
            },
            {
              id: "user-3",
              name: "Juliana Lima",
              email: "juliana.lima@empresa.com",
              avatar: "https://i.pravatar.cc/150?img=5",
              position: "Designer UX/UI",
              status: "PRESENT",
              department: "Design",
              lastEntry: {
                type: "BREAK_END",
                timestamp: "2025-04-11T13:05:00",
              },
            },
            {
              id: "user-4",
              name: "Roberto Alves",
              email: "roberto.alves@empresa.com",
              avatar: "https://i.pravatar.cc/150?img=7",
              position: "Analista de Dados",
              status: "PRESENT",
              department: "Análise",
              lastEntry: {
                type: "CLOCK_IN",
                timestamp: "2025-04-11T09:45:00",
              },
            },
            {
              id: "user-5",
              name: "Fernanda Costa",
              email: "fernanda.costa@empresa.com",
              avatar: "https://i.pravatar.cc/150?img=10",
              position: "Gerente de Produto",
              status: "ABSENT",
              department: "Produto",
            },
          ]

          const mockPendingRequests: PendingRequest[] = [
            {
              id: "req-1",
              type: "adjustment",
              employeeName: "Ana Silva",
              employeeAvatar: "https://i.pravatar.cc/150?img=1",
              date: "10/04/2025",
              status: "pending",
              description: "Ajuste de ponto: esqueci de registrar saída às 18:00",
            },
            {
              id: "req-2",
              type: "absence",
              employeeName: "Roberto Alves",
              employeeAvatar: "https://i.pravatar.cc/150?img=7",
              date: "12/04/2025",
              status: "pending",
              description: "Consulta médica das 14:00 às 16:00",
            },
            {
              id: "req-3",
              type: "overtime",
              employeeName: "Carlos Mendes",
              employeeAvatar: "https://i.pravatar.cc/150?img=4",
              date: "09/04/2025",
              status: "pending",
              description: "Horas extras: 2h para finalização do projeto",
            },
          ]

          const mockMetrics: TeamMetrics = {
            totalMembers: 5,
            presentToday: 3,
            onBreak: 1,
            absent: 1,
            lateToday: 1,
            averageHours: "07:45",
            pendingRequests: 3,
          }

          setTeamMembers(mockTeamMembers)
          setPendingRequests(mockPendingRequests)
          setMetrics(mockMetrics)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Filtrar membros da equipe
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = !statusFilter || member.status === statusFilter
      const matchesDepartment = !departmentFilter || member.department === departmentFilter

      return matchesSearch && matchesStatus && matchesDepartment
    })
  }, [teamMembers, searchTerm, statusFilter, departmentFilter])

  // Obter departamentos únicos para o filtro
  const departments = useMemo(() => {
    const depts = new Set<string>()
    teamMembers.forEach((member) => {
      if (member.department) {
        depts.add(member.department)
      }
    })
    return Array.from(depts)
  }, [teamMembers])

  // Função para aprovar solicitação
  const handleApproveRequest = async (id: string) => {
    try {
      // Aqui seria a chamada real à API
      // await api.post(`/manager/requests/${id}/approve`)

      // Atualização otimista da UI
      setPendingRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req)))
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error)
    }
  }

  // Função para rejeitar solicitação
  const handleRejectRequest = async (id: string) => {
    try {
      // Aqui seria a chamada real à API
      // await api.post(`/manager/requests/${id}/reject`)

      // Atualização otimista da UI
      setPendingRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req)))
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error)
    }
  }

  // Função para obter classe de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500"
      case "ABSENT":
        return "bg-red-500"
      case "BREAK":
        return "bg-blue-500"
      case "NOT_STARTED":
        return "bg-gray-400"
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-400"
    }
  }

  // Função para obter texto de status
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
      case "pending":
        return "Pendente"
      case "approved":
        return "Aprovado"
      case "rejected":
        return "Rejeitado"
      default:
        return status
    }
  }

  // Função para obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <UserCheck size={16} className="text-green-500" />
      case "ABSENT":
        return <UserX size={16} className="text-red-500" />
      case "BREAK":
        return <Coffee size={16} className="text-blue-500" />
      case "NOT_STARTED":
        return <Clock size={16} className="text-gray-500" />
      default:
        return null
    }
  }

  // Função para obter ícone de tipo de solicitação
  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "adjustment":
        return <Clock size={16} className="text-blue-500" />
      case "absence":
        return <Calendar size={16} className="text-purple-500" />
      case "overtime":
        return <Clock size={16} className="text-amber-500" />
      default:
        return <FileText size={16} className="text-gray-500" />
    }
  }

  // Função para obter texto de tipo de solicitação
  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "adjustment":
        return "Ajuste de Ponto"
      case "absence":
        return "Ausência"
      case "overtime":
        return "Hora Extra"
      default:
        return type
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard do Gestor</h1>
            <p className="text-gray-500 text-sm mt-1">
              {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<FileText size={16} />} as={Link} to="/team-reports">
              Relatórios
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Métricas da Equipe */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <SummaryItem
                      icon={<Users size={18} />}
                      label="Equipe"
                      value={`${metrics.presentToday}/${metrics.totalMembers}`}
                      iconColor="text-blue-500"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <SummaryItem
                      icon={<Coffee size={18} />}
                      label="Em Intervalo"
                      value={metrics.onBreak.toString()}
                      iconColor="text-blue-500"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <SummaryItem
                      icon={<Clock size={18} />}
                      label="Média de Horas"
                      value={metrics.averageHours}
                      iconColor="text-green-500"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <SummaryItem
                      icon={<FileText size={18} />}
                      label="Solicitações"
                      value={metrics.pendingRequests.toString()}
                      iconColor="text-purple-500"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "team"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("team")}
              >
                Equipe
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("requests")}
              >
                Solicitações
                {pendingRequests.filter((req) => req.status === "pending").length > 0 && (
                  <Badge variant="error" className="ml-2 px-1.5 py-0.5">
                    {pendingRequests.filter((req) => req.status === "pending").length}
                  </Badge>
                )}
              </button>
            </div>

            {/* Conteúdo da Tab */}
            {activeTab === "team" ? (
              <Card>
                <CardHeader className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center">
                    <Users size={18} className="text-blue-500 mr-2" />
                    <h2 className="text-lg font-medium">Status da Equipe</h2>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar membro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-sm px-3 py-1.5 border border-gray-300 rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </CardHeader>
                <div className="divide-y divide-gray-100">
                  {filteredTeamMembers.length > 0 ? (
                    filteredTeamMembers.map((member) => (
                      <div key={member.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar src={member.avatar} alt={member.name} className="w-10 h-10" />
                          <div>
                            <h3 className="font-medium text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.position || member.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="hidden md:block text-sm text-gray-500">
                            {member.lastEntry
                              ? `${
                                  member.lastEntry.type === "CLOCK_IN"
                                    ? "Entrada"
                                    : member.lastEntry.type === "BREAK_START"
                                      ? "Início do Intervalo"
                                      : member.lastEntry.type === "BREAK_END"
                                        ? "Fim do Intervalo"
                                        : "Saída"
                                } às ${format(new Date(member.lastEntry.timestamp), "HH:mm")}`
                              : "Sem registros hoje"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(member.status)}`}></div>
                            <span className="text-sm font-medium text-gray-700">{getStatusText(member.status)}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                              title="Enviar mensagem"
                            >
                              <MessageSquare size={16} />
                            </button>
                            {member.location && (
                              <button
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                title="Ver localização"
                              >
                                <MapPin size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Users size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Nenhum membro encontrado</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader className="px-4 py-3 bg-gray-50">
                  <div className="flex items-center">
                    <FileText size={18} className="text-blue-500 mr-2" />
                    <h2 className="text-lg font-medium">Solicitações Pendentes</h2>
                  </div>
                </CardHeader>
                <div className="divide-y divide-gray-100">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((request) => (
                      <div key={request.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar src={request.employeeAvatar} alt={request.employeeName} className="w-8 h-8" />
                            <div>
                              <h3 className="font-medium text-gray-900">{request.employeeName}</h3>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                {getRequestTypeIcon(request.type)}
                                <span>{getRequestTypeText(request.type)}</span>
                                <span>•</span>
                                <span>{request.date}</span>
                              </div>
                            </div>
                          </div>

                          <Badge
                            variant={
                              request.status === "approved"
                                ? "success"
                                : request.status === "rejected"
                                  ? "error"
                                  : "warning"
                            }
                          >
                            {getStatusText(request.status)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>

                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              leftIcon={<UserX size={14} />}
                            >
                              Rejeitar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              leftIcon={<UserCheck size={14} />}
                            >
                              Aprovar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                      <p>Não há solicitações pendentes</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default ManagerDashboard
