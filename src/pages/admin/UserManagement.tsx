"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronDown,
  X,
  UserPlus,
  Download,
  Upload,
} from "lucide-react"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import Modal from "@/components/ui/Modal"

// Tipos
interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MANAGER" | "EMPLOYEE"
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  company?: string
  department?: string
  avatar?: string
  createdAt: string
}

function UserManagement() {
  // Estados
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Efeito para buscar dados
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const response = await api.get("/admin/users")
          setUsers(response.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados para desenvolvimento
          const mockUsers: User[] = [
            {
              id: "user-1",
              name: "Ana Silva",
              email: "ana.silva@empresa.com",
              role: "ADMIN",
              status: "ACTIVE",
              company: "Empresa Principal",
              department: "TI",
              avatar: "https://i.pravatar.cc/150?img=1",
              createdAt: "2024-12-10T14:30:00",
            },
            {
              id: "user-2",
              name: "Carlos Mendes",
              email: "carlos.mendes@empresa.com",
              role: "MANAGER",
              status: "ACTIVE",
              company: "Empresa Principal",
              department: "Desenvolvimento",
              avatar: "https://i.pravatar.cc/150?img=4",
              createdAt: "2025-01-15T09:20:00",
            },
            {
              id: "user-3",
              name: "Juliana Lima",
              email: "juliana.lima@empresa.com",
              role: "EMPLOYEE",
              status: "ACTIVE",
              company: "Filial Norte",
              department: "Design",
              avatar: "https://i.pravatar.cc/150?img=5",
              createdAt: "2025-02-05T11:45:00",
            },
            {
              id: "user-4",
              name: "Roberto Alves",
              email: "roberto.alves@empresa.com",
              role: "EMPLOYEE",
              status: "INACTIVE",
              company: "Empresa Principal",
              department: "Análise",
              avatar: "https://i.pravatar.cc/150?img=7",
              createdAt: "2025-01-20T16:10:00",
            },
            {
              id: "user-5",
              name: "Fernanda Costa",
              email: "fernanda.costa@empresa.com",
              role: "MANAGER",
              status: "PENDING",
              company: "Filial Sul",
              department: "Produto",
              avatar: "https://i.pravatar.cc/150?img=10",
              createdAt: "2025-03-01T08:30:00",
            },
          ]

          setUsers(mockUsers)
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filtrar usuários
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Função para obter classe de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Ativo</Badge>
      case "INACTIVE":
        return <Badge variant="error">Inativo</Badge>
      case "PENDING":
        return <Badge variant="warning">Pendente</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Função para obter texto de cargo
  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "MANAGER":
        return "Gestor"
      case "EMPLOYEE":
        return "Funcionário"
      default:
        return role
    }
  }

  // Função para confirmar exclusão
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  // Função para excluir usuário
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      // Aqui seria a chamada real à API
      // await api.delete(`/admin/users/${selectedUser.id}`)

      // Atualização otimista da UI
      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setShowDeleteModal(false)
      setSelectedUser(null)

      // Mostrar mensagem de sucesso
      alert("Usuário excluído com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      alert("Erro ao excluir usuário. Tente novamente.")
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 px-2 py-1 text-xs" as={Link} to="/admin">
              <ArrowLeft size={14} className="mr-1" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Gerenciar Usuários</h1>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 py-1 text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} className="mr-1" />
              Filtros
              {showFilters ? (
                <ChevronDown size={14} className="ml-1 rotate-180" />
              ) : (
                <ChevronDown size={14} className="ml-1" />
              )}
            </Button>

            <Button size="sm" className="h-7 px-2 py-1 text-xs" as={Link} to="/admin/users/new">
              <UserPlus size={14} className="mr-1" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="mb-3 shadow-sm">
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                    Cargo:
                  </label>
                  <select
                    id="role"
                    value={roleFilter || ""}
                    onChange={(e) => setRoleFilter(e.target.value || null)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
                  >
                    <option value="">Todos</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="MANAGER">Gestor</option>
                    <option value="EMPLOYEE">Funcionário</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                    Status:
                  </label>
                  <select
                    id="status"
                    value={statusFilter || ""}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                    <option value="PENDING">Pendente</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                    Buscar:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      placeholder="Nome, email, empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
                    />
                    {searchTerm && (
                      <button
                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                        onClick={() => setSearchTerm("")}
                      >
                        <X size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">{filteredUsers.length} usuários encontrados</div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 py-0 text-xs"
                    onClick={() => {
                      setRoleFilter(null)
                      setStatusFilter(null)
                      setSearchTerm("")
                    }}
                  >
                    Limpar
                  </Button>

                  <Button variant="outline" size="sm" className="h-6 px-2 py-0 text-xs">
                    <Download size={12} className="mr-1" />
                    Exportar
                  </Button>

                  <Button variant="outline" size="sm" className="h-6 px-2 py-0 text-xs">
                    <Upload size={12} className="mr-1" />
                    Importar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Usuários */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardHeader className="px-3 py-2 bg-gray-50 flex items-center">
              <Users size={16} className="text-blue-500 mr-2" />
              <h2 className="text-sm font-medium">Lista de Usuários</h2>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Usuário</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Email</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Cargo</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Empresa</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Status</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5">
                        <div className="flex items-center">
                          <Avatar src={user.avatar} alt={user.name} className="w-6 h-6 mr-2" />
                          <div className="font-medium text-gray-900">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-gray-500">{user.email}</td>
                      <td className="px-2 py-1.5 text-gray-500">{getRoleText(user.role)}</td>
                      <td className="px-2 py-1.5 text-gray-500">{user.company || "-"}</td>
                      <td className="px-2 py-1.5">{getStatusBadge(user.status)}</td>
                      <td className="px-2 py-1.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                            title="Excluir"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Users size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Exclusão" size="sm">
          <div className="p-2">
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir o usuário <span className="font-medium">{selectedUser?.name}</span>? Esta
              ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={14} className="mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default UserManagement
