"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  Building,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  ChevronRight,
  BarChart2,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Tipos
interface AdminMetrics {
  totalUsers: number
  activeUsers: number
  totalCompanies: number
  pendingApprovals: number
  systemAlerts: number
  newUsersToday: number
  userGrowthRate: number
  activeSessionsNow: number
  systemStatus: {
    api: "online" | "degraded" | "offline"
    database: "online" | "degraded" | "offline"
    services: "online" | "degraded" | "offline"
  }
  recentAlerts: Array<{
    id: string
    type: "error" | "warning" | "info"
    message: string
    timestamp: string
  }>
}

function AdminDashboard() {
  // Estados
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  // Efeito para buscar dados
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const metricsResponse = await api.get("/admin/metrics")
          setMetrics(metricsResponse.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados para desenvolvimento
          const mockMetrics: AdminMetrics = {
            totalUsers: 156,
            activeUsers: 124,
            totalCompanies: 8,
            pendingApprovals: 5,
            systemAlerts: 2,
            newUsersToday: 3,
            userGrowthRate: 2.4,
            activeSessionsNow: 42,
            systemStatus: {
              api: "online",
              database: "online",
              services: "online",
            },
            recentAlerts: [
              {
                id: "alert-1",
                type: "warning",
                message: "Uso de CPU acima de 80% nos últimos 15 minutos",
                timestamp: "2025-04-11T14:23:00",
              },
              {
                id: "alert-2",
                type: "info",
                message: "Backup diário concluído com sucesso",
                timestamp: "2025-04-11T03:00:00",
              },
            ],
          }

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

  // Links rápidos para seções administrativas
  const adminLinks = [
    {
      icon: <Users size={16} />,
      label: "Usuários",
      path: "/admin/users",
      color: "bg-blue-100 text-blue-600",
      description: "Gerenciar contas e permissões",
    },
    {
      icon: <Building size={16} />,
      label: "Empresas",
      path: "/admin/companies",
      color: "bg-purple-100 text-purple-600",
      description: "Cadastro e configurações",
    },
    {
      icon: <Clock size={16} />,
      label: "Turnos",
      path: "/admin/shift-types",
      color: "bg-green-100 text-green-600",
      description: "Tipos de jornada",
    },
    {
      icon: <Calendar size={16} />,
      label: "Grupos",
      path: "/admin/shift-groups",
      color: "bg-amber-100 text-amber-600",
      description: "Escalas e grupos de trabalho",
    },
    {
      icon: <Settings size={16} />,
      label: "Configurações",
      path: "/admin/settings",
      color: "bg-gray-100 text-gray-600",
      description: "Parâmetros do sistema",
    },
    {
      icon: <Shield size={16} />,
      label: "Segurança",
      path: "/admin/security",
      color: "bg-red-100 text-red-600",
      description: "Logs e controles de acesso",
    },
  ]

  // Função para renderizar indicador de status
  const renderStatusIndicator = (status: string) => {
    switch (status) {
      case "online":
        return (
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>Online
          </span>
        )
      case "degraded":
        return (
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>Degradado
          </span>
        )
      case "offline":
        return (
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>Offline
          </span>
        )
      default:
        return (
          <span className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1"></span>Desconhecido
          </span>
        )
    }
  }

  // Função para renderizar ícone de alerta
  const renderAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle size={14} className="text-red-500" />
      case "warning":
        return <AlertTriangle size={14} className="text-amber-500" />
      case "info":
        return <Info size={14} className="text-blue-500" />
      default:
        return <Info size={14} className="text-gray-500" />
    }
  }

  // Função para formatar timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
          <div className="flex gap-2">
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertTriangle size={12} />
              <span>{metrics?.systemAlerts || 0} Alertas</span>
            </Badge>
            <Badge variant="info" className="flex items-center gap-1">
              <Activity size={12} />
              <span>{metrics?.activeSessionsNow || 0} Sessões ativas</span>
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Métricas Principais */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Card className="bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">Usuários</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-lg font-semibold">{metrics.totalUsers}</p>
                          <div className="flex items-center text-xs text-green-600">
                            <TrendingUp size={12} />
                            <span>+{metrics.newUsersToday}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{metrics.activeUsers} ativos</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-blue-100 text-blue-600`}>
                        <Users size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">Empresas</p>
                        <p className="text-lg font-semibold">{metrics.totalCompanies}</p>
                        <div className="flex items-center text-xs">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                          <span>Todas ativas</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg bg-purple-100 text-purple-600`}>
                        <Building size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">Aprovações</p>
                        <p className="text-lg font-semibold">{metrics.pendingApprovals}</p>
                        <p className="text-xs text-amber-600">Pendentes</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-amber-100 text-amber-600`}>
                        <FileText size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">Crescimento</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-lg font-semibold">{metrics.userGrowthRate}%</p>
                          <span className="text-xs text-green-600">mensal</span>
                        </div>
                        <div className="flex items-center text-xs text-green-600">
                          <TrendingUp size={12} />
                          <span>Positivo</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg bg-green-100 text-green-600`}>
                        <BarChart2 size={18} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Acesso Rápido */}
              <div className="md:col-span-2">
                <Card className="bg-white shadow-sm">
                  <div className="px-3 py-2 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-sm font-medium">Acesso Rápido</h2>
                  </div>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-100">
                      {adminLinks.map((link, index) => (
                        <Link key={index} to={link.path} className="bg-white p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className={`p-2 rounded-lg ${link.color} flex-shrink-0`}>{link.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900">{link.label}</h3>
                              <p className="text-xs text-gray-500 truncate">{link.description}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status do Sistema e Alertas */}
              <div className="md:col-span-1">
                <div className="space-y-3">
                  {/* Status do Sistema */}
                  <Card className="bg-white shadow-sm">
                    <div className="px-3 py-2 bg-gray-50 border-b">
                      <h2 className="text-sm font-medium">Status do Sistema</h2>
                    </div>
                    <CardContent className="p-3">
                      {metrics && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">API</span>
                            <span className="text-xs font-medium">
                              {renderStatusIndicator(metrics.systemStatus.api)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Banco de Dados</span>
                            <span className="text-xs font-medium">
                              {renderStatusIndicator(metrics.systemStatus.database)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Serviços</span>
                            <span className="text-xs font-medium">
                              {renderStatusIndicator(metrics.systemStatus.services)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Alertas Recentes */}
                  <Card className="bg-white shadow-sm">
                    <div className="px-3 py-2 bg-gray-50 border-b flex justify-between items-center">
                      <h2 className="text-sm font-medium">Alertas Recentes</h2>
                      <Link to="/admin/alerts" className="text-xs text-blue-600 hover:underline">
                        Ver todos
                      </Link>
                    </div>
                    <CardContent className="p-0">
                      {metrics && metrics.recentAlerts.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {metrics.recentAlerts.map((alert) => (
                            <div key={alert.id} className="p-3">
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">{renderAlertIcon(alert.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-900 line-clamp-2">{alert.message}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{formatTimestamp(alert.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-gray-500">
                          <CheckCircle size={16} className="mx-auto mb-1 text-green-500" />
                          <p>Nenhum alerta recente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default AdminDashboard
