"use client"

import { useMemo } from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Users,
  Clock,
  FileText,
  UserCheck,
  UserX,
  Coffee,
  Eye,
  MessageSquare,
  MapPin,
  Filter,
  Search,
  X,
} from "lucide-react"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
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
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [currentDate] = useState(new Date())
  const [showFilters, setShowFilters] = useState(false)

  // Efeito para buscar dados
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const [teamResponse, metricsResponse] = await Promise.all([
            api.get("/manager/team"),
            api.get("/manager/metrics"),
          ])

          setTeamMembers(teamResponse.data)
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
            >
              Filtros
            </Button>
            <Button variant="outline" size="sm" leftIcon={<FileText size={16} />} as={Link} to="/team-reports">
              Relatórios
            </Button>
            <Button variant="outline" size="sm" leftIcon={<FileText size={16} />} as={Link} to="/adjustments">
              Solicitações
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

            {/* Filtros */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status:
                        </label>
                        <select
                          id="status"
                          value={statusFilter || ""}
                          onChange={(e) => setStatusFilter(e.target.value || null)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Todos</option>
                          <option value="PRESENT">Presente</option>
                          <option value="ABSENT">Ausente</option>
                          <option value="BREAK">Em intervalo</option>
                          <option value="NOT_STARTED">Não iniciou</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                          Departamento:
                        </label>
                        <select
                          id="department"
                          value={departmentFilter || ""}
                          onChange={(e) => setDepartmentFilter(e.target.value || null)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Todos</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
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
                            placeholder="Buscar membro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatusFilter(null)
                          setDepartmentFilter(null)
                          setSearchTerm("")
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Status da Equipe */}
            <Card>
              <CardHeader className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center">
                  <Users size={18} className="text-blue-500 mr-2" />
                  <h2 className="text-lg font-medium">Status da Equipe</h2>
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
          </>
        )}
      </div>
    </Layout>
  )
}

export default ManagerDashboard
