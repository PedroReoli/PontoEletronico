"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  Clock,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import { Alert } from "@/components/ui/Alert"
import { Avatar } from "@/components/ui/Avatar"

// Tipos
interface AdjustmentRequest {
  id: string
  date: string
  requestDate: string
  type: "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END" | "ABSENCE" | "OTHER"
  status: "PENDING" | "APPROVED" | "REJECTED"
  reason: string
  requestedTime?: string
  managerComment?: string
  managerName?: string
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

function AdjustmentRequests() {
  // Estados
  const [requests, setRequests] = useState<AdjustmentRequest[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof AdjustmentRequest; direction: "asc" | "desc" }>({
    key: "requestDate",
    direction: "desc",
  })
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "CLOCK_IN",
    requestedTime: "",
    reason: "",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"my-requests" | "pending-approvals">("my-requests")
  const [isManager, setIsManager] = useState(true) // Simulando que o usuário é gestor

  // Efeito para buscar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const [requestsResponse, pendingResponse] = await Promise.all([
            api.get("/adjustment-requests"),
            api.get("/manager/pending-requests"),
          ])
          setRequests(requestsResponse.data)
          setPendingRequests(pendingResponse.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados para desenvolvimento
          const mockRequests: AdjustmentRequest[] = [
            {
              id: "req-1",
              date: "2025-04-05",
              requestDate: "2025-04-06",
              type: "CLOCK_IN",
              status: "PENDING",
              reason: "Esqueci de registrar a entrada às 08:00",
              requestedTime: "08:00",
            },
            {
              id: "req-2",
              date: "2025-04-03",
              requestDate: "2025-04-03",
              type: "CLOCK_OUT",
              status: "APPROVED",
              reason: "Sistema fora do ar no momento da saída",
              requestedTime: "18:00",
              managerComment: "Confirmado com o suporte de TI",
              managerName: "Carlos Mendes",
            },
            {
              id: "req-3",
              date: "2025-04-01",
              requestDate: "2025-04-02",
              type: "ABSENCE",
              status: "REJECTED",
              reason: "Consulta médica",
              managerComment: "Favor apresentar atestado médico",
              managerName: "Carlos Mendes",
            },
            {
              id: "req-4",
              date: "2025-03-28",
              requestDate: "2025-03-29",
              type: "BREAK_START",
              status: "APPROVED",
              reason: "Esqueci de registrar o início do intervalo",
              requestedTime: "12:00",
              managerName: "Carlos Mendes",
            },
          ]

          const mockPendingRequests: PendingRequest[] = [
            {
              id: "req-p1",
              type: "adjustment",
              employeeName: "Ana Silva",
              employeeAvatar: "https://i.pravatar.cc/150?img=1",
              date: "10/04/2025",
              status: "pending",
              description: "Ajuste de ponto: esqueci de registrar saída às 18:00",
            },
            {
              id: "req-p2",
              type: "absence",
              employeeName: "Roberto Alves",
              employeeAvatar: "https://i.pravatar.cc/150?img=7",
              date: "12/04/2025",
              status: "pending",
              description: "Consulta médica das 14:00 às 16:00",
            },
            {
              id: "req-p3",
              type: "overtime",
              employeeName: "Carlos Mendes",
              employeeAvatar: "https://i.pravatar.cc/150?img=4",
              date: "09/04/2025",
              status: "pending",
              description: "Horas extras: 2h para finalização do projeto",
            },
          ]

          setRequests(mockRequests)
          setPendingRequests(mockPendingRequests)
        }
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar solicitações
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.managerComment && request.managerComment.toLowerCase().includes(searchTerm.toLowerCase())) ||
      format(new Date(request.date), "dd/MM/yyyy").includes(searchTerm)

    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesType = !typeFilter || request.type === typeFilter
    const matchesDate = !dateFilter || request.date.includes(dateFilter)

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  // Ordenar solicitações - Corrigindo os erros TypeScript
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const valueA = a[sortConfig.key]
    const valueB = b[sortConfig.key]

    if (valueA === undefined && valueB === undefined) return 0
    if (valueA === undefined) return sortConfig.direction === "asc" ? -1 : 1
    if (valueB === undefined) return sortConfig.direction === "asc" ? 1 : -1

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortConfig.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    }

    // Fallback para outros tipos
    return 0
  })

  // Função para alternar a ordenação
  const requestSort = (key: keyof AdjustmentRequest) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Função para enviar nova solicitação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validação básica
    if (!formData.date || !formData.type || !formData.reason) {
      setFormError("Preencha todos os campos obrigatórios")
      return
    }

    if (formData.type !== "ABSENCE" && formData.type !== "OTHER" && !formData.requestedTime) {
      setFormError("Informe o horário solicitado")
      return
    }

    try {
      // Aqui seria a chamada real à API
      // const response = await api.post("/adjustment-requests", formData)

      // Simulação de resposta
      const newRequest: AdjustmentRequest = {
        id: `req-${Date.now()}`,
        date: formData.date,
        requestDate: format(new Date(), "yyyy-MM-dd"),
        type: formData.type as any,
        status: "PENDING",
        reason: formData.reason,
        requestedTime: formData.requestedTime,
      }

      // Atualizar a lista de solicitações
      setRequests([newRequest, ...requests])

      // Limpar formulário e fechar modal
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        type: "CLOCK_IN",
        requestedTime: "",
        reason: "",
      })
      setShowModal(false)

      // Mostrar mensagem de sucesso
      setSuccessMessage("Solicitação enviada com sucesso!")
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error)
      setFormError("Erro ao enviar solicitação. Tente novamente.")
    }
  }

  // Função para cancelar solicitação
  const handleCancelRequest = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta solicitação?")) return

    try {
      // Aqui seria a chamada real à API
      // await api.delete(`/adjustment-requests/${id}`)

      // Atualização otimista da UI
      setRequests(requests.filter((req) => req.id !== id))
      setSuccessMessage("Solicitação cancelada com sucesso!")
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error("Erro ao cancelar solicitação:", error)
      alert("Erro ao cancelar solicitação. Tente novamente.")
    }
  }

  // Função para aprovar solicitação
  const handleApproveRequest = async (id: string) => {
    try {
      // Aqui seria a chamada real à API
      // await api.post(`/manager/requests/${id}/approve`)

      // Atualização otimista da UI
      setPendingRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req)))
      setSuccessMessage("Solicitação aprovada com sucesso!")
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error)
      alert("Erro ao aprovar solicitação. Tente novamente.")
    }
  }

  // Função para rejeitar solicitação
  const handleRejectRequest = async (id: string) => {
    try {
      // Aqui seria a chamada real à API
      // await api.post(`/manager/requests/${id}/reject`)

      // Atualização otimista da UI
      setPendingRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "rejected" } : req)))
      setSuccessMessage("Solicitação rejeitada com sucesso!")
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error)
      alert("Erro ao rejeitar solicitação. Tente novamente.")
    }
  }

  // Função para obter texto do tipo de solicitação
  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
        return "Entrada"
      case "CLOCK_OUT":
        return "Saída"
      case "BREAK_START":
        return "Início Intervalo"
      case "BREAK_END":
        return "Fim Intervalo"
      case "ABSENCE":
        return "Ausência"
      case "OTHER":
        return "Outro"
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

  // Função para obter ícone do tipo de solicitação
  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "CLOCK_IN":
      case "CLOCK_OUT":
      case "BREAK_START":
      case "BREAK_END":
      case "adjustment":
      case "overtime":
        return <Clock size={16} />
      case "ABSENCE":
      case "absence":
        return <Calendar size={16} />
      case "OTHER":
        return <FileText size={16} />
      default:
        return <FileText size={16} />
    }
  }

  // Função para obter classe de status
  const getStatusVariant = (status: string): "default" | "success" | "warning" | "error" => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return "success"
      case "PENDING":
      case "pending":
        return "warning"
      case "REJECTED":
      case "rejected":
        return "error"
      default:
        return "default"
    }
  }

  // Função para obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return <CheckCircle size={16} />
      case "PENDING":
      case "pending":
        return <AlertCircle size={16} />
      case "REJECTED":
      case "rejected":
        return <XCircle size={16} />
      default:
        return null
    }
  }

  // Função para obter texto de status
  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return "Aprovado"
      case "PENDING":
      case "pending":
        return "Pendente"
      case "REJECTED":
      case "rejected":
        return "Rejeitado"
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
          <h1 className="text-2xl font-bold text-gray-800">Solicitações de Ajuste</h1>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
            >
              Filtros
              {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </Button>
            <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={16} />}>
              Nova Solicitação
            </Button>
          </div>
        </motion.div>

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <option value="PENDING">Pendente</option>
                      <option value="APPROVED">Aprovado</option>
                      <option value="REJECTED">Rejeitado</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo:
                    </label>
                    <select
                      id="type"
                      value={typeFilter || ""}
                      onChange={(e) => setTypeFilter(e.target.value || null)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="CLOCK_IN">Entrada</option>
                      <option value="CLOCK_OUT">Saída</option>
                      <option value="BREAK_START">Início Intervalo</option>
                      <option value="BREAK_END">Fim Intervalo</option>
                      <option value="ABSENCE">Ausência</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Data:
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={dateFilter || ""}
                      onChange={(e) => setDateFilter(e.target.value || null)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
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
                        placeholder="Buscar..."
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
                      setTypeFilter(null)
                      setDateFilter(null)
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

        {/* Tabs para gestores */}
        {isManager && (
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "my-requests"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("my-requests")}
              >
                Minhas Solicitações
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "pending-approvals"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("pending-approvals")}
              >
                Aprovações Pendentes
                {pendingRequests.filter((req) => req.status === "pending").length > 0 && (
                  <Badge variant="error" className="ml-2 px-1.5 py-0.5">
                    {pendingRequests.filter((req) => req.status === "pending").length}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Solicitações */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : activeTab === "my-requests" ? (
          <Card>
            <CardHeader className="px-4 py-3 bg-gray-50">
              <div className="flex items-center">
                <FileText size={18} className="text-blue-500 mr-2" />
                <h2 className="text-lg font-medium">Minhas Solicitações</h2>
              </div>
            </CardHeader>

            {sortedRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("type")}
                      >
                        <div className="flex items-center">
                          Tipo
                          {sortConfig.key === "type" && (
                            <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Motivo
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                    {sortedRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(request.date), "dd/MM/yyyy")}
                          </div>
                          <div className="text-xs text-gray-500">
                            Solicitado em: {format(new Date(request.requestDate), "dd/MM/yyyy")}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1.5">{getRequestTypeIcon(request.type)}</span>
                            <span className="text-sm text-gray-900">{getRequestTypeText(request.type)}</span>
                          </div>
                          {request.requestedTime && (
                            <div className="text-xs text-gray-500 mt-0.5">Horário: {request.requestedTime}</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-900 line-clamp-2">{request.reason}</div>
                          {request.managerComment && (
                            <div className="mt-1 text-xs text-gray-500 italic">
                              <span className="font-medium">{request.managerName}:</span> {request.managerComment}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(request.status)}
                            <span>{getStatusText(request.status)}</span>
                          </Badge>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === "PENDING" && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Nenhuma solicitação encontrada</p>
              </div>
            )}
          </Card>
        ) : (
          // Aprovações Pendentes (para gestores)
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

                      <Badge variant={getStatusVariant(request.status)}>{getStatusText(request.status)}</Badge>
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

        {/* Modal de Nova Solicitação */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Solicitação de Ajuste">
          <form onSubmit={handleSubmit}>
            {formError && (
              <Alert variant="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Data do Registro *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ajuste *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="CLOCK_IN">Entrada</option>
                  <option value="CLOCK_OUT">Saída</option>
                  <option value="BREAK_START">Início Intervalo</option>
                  <option value="BREAK_END">Fim Intervalo</option>
                  <option value="ABSENCE">Ausência</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              {formData.type !== "ABSENCE" && formData.type !== "OTHER" && (
                <div>
                  <label htmlFor="requestedTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Correto *
                  </label>
                  <input
                    type="time"
                    id="requestedTime"
                    value={formData.requestedTime}
                    onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Descreva o motivo da solicitação de ajuste..."
                  required
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Enviar Solicitação</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default AdjustmentRequests
