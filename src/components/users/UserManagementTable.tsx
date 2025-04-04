"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User, UserRole, Company, ScheduleGroup } from "@prisma/client"
import { getUsers, activateUser, deactivateUser, deleteUser } from "@/services/userService"
import { getCompanies } from "@/services/companyService"
import { getScheduleGroupsByCompany } from "@/services/scheduleGroupService"
import UserFormModal from "./UserFormModal"
import ConfirmationModal from "@/components/common/ConfirmationModal"

interface UserManagementTableProps {
  companyId?: string // Se fornecido, filtra usuários por empresa
  canManageUsers?: boolean // Controla permissões de gerenciamento
}

const UserManagementTable = ({ companyId, canManageUsers = false }: UserManagementTableProps) => {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId || "")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showUserModal, setShowUserModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("")
  const [statusFilter, setStatusFilter] = useState<boolean | "">("")

  // Carregar empresas
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        if (!companyId) {
          const response = await getCompanies()
          setCompanies(response.data)
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar empresas")
      }
    }

    loadCompanies()
  }, [companyId])

  // Carregar grupos de jornada quando uma empresa é selecionada
  useEffect(() => {
    const loadScheduleGroups = async () => {
      if (selectedCompanyId) {
        try {
          const groups = await getScheduleGroupsByCompany(selectedCompanyId)
          setScheduleGroups(groups)
        } catch (err: any) {
          setError(err.message || "Erro ao carregar grupos de jornada")
        }
      } else {
        setScheduleGroups([])
      }
    }

    loadScheduleGroups()
  }, [selectedCompanyId])

  // Carregar usuários com filtros
  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters = {
        companyId: selectedCompanyId || companyId,
        role: roleFilter || undefined,
        active: statusFilter === "" ? undefined : statusFilter,
        search: searchTerm || undefined,
        page: currentPage,
        limit: 10,
      }

      const response = await getUsers(filters)
      setUsers(response.data)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar usuários")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar usuários quando os filtros mudarem
  useEffect(() => {
    loadUsers()
  }, [selectedCompanyId, roleFilter, statusFilter, currentPage, companyId])

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setCurrentPage(1) // Resetar para a primeira página
    loadUsers()
  }

  // Função para lidar com a mudança de empresa
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompanyId(e.target.value)
    setCurrentPage(1) // Resetar para a primeira página
  }

  // Função para abrir o modal de edição de usuário
  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  // Função para abrir o modal de criação de usuário
  const handleAddUser = () => {
    setSelectedUser(null)
    setShowUserModal(true)
  }

  // Função para confirmar exclusão de usuário
  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id)
        loadUsers() // Recarregar a lista após exclusão
        setShowDeleteModal(false)
      } catch (err: any) {
        setError(err.message || "Erro ao excluir usuário")
      }
    }
  }

  // Função para confirmar ativação/desativação de usuário
  const handleToggleActiveStatus = async () => {
    if (selectedUser) {
      try {
        if (selectedUser.active) {
          await deactivateUser(selectedUser.id)
        } else {
          await activateUser(selectedUser.id)
        }
        loadUsers() // Recarregar a lista após alteração
        setShowDeactivateModal(false)
      } catch (err: any) {
        setError(err.message || "Erro ao alterar status do usuário")
      }
    }
  }

  // Função para formatar o papel do usuário
  const formatRole = (role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      ADMIN: "Administrador",
      MANAGER: "Gerente",
      EMPLOYEE: "Funcionário",
    }
    return roleMap[role] || role
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-2 mb-6">Gerenciamento de Usuários</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Filtro de empresa (apenas se não for fornecido companyId) */}
        {!companyId && (
          <div>
            <label htmlFor="companyFilter" className="block text-body-2 font-medium mb-1">
              Empresa
            </label>
            <select
              id="companyFilter"
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas as empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro de papel */}
        <div>
          <label htmlFor="roleFilter" className="block text-body-2 font-medium mb-1">
            Papel
          </label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os papéis</option>
            <option value="ADMIN">Administrador</option>
            <option value="MANAGER">Gerente</option>
            <option value="EMPLOYEE">Funcionário</option>
          </select>
        </div>

        {/* Filtro de status */}
        <div>
          <label htmlFor="statusFilter" className="block text-body-2 font-medium mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            value={String(statusFilter)}
            onChange={(e) => {
              const value = e.target.value
              setStatusFilter(value === "" ? "" : value === "true")
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        {/* Campo de pesquisa */}
        <div>
          <label htmlFor="searchTerm" className="block text-body-2 font-medium mb-1">
            Pesquisar
          </label>
          <div className="flex">
            <input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou email"
              className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Botão de adicionar usuário */}
      {canManageUsers && (
        <div className="mb-4">
          <button
            onClick={handleAddUser}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Usuário
          </button>
        </div>
      )}

      {/* Tabela de usuários */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {canManageUsers && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={canManageUsers ? 5 : 4} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={canManageUsers ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={!user.active ? "bg-gray-100" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "MANAGER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {canManageUsers && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeactivateModal(true)
                        }}
                        className={`${user.active ? "text-amber-600 hover:text-amber-800" : "text-green-600 hover:text-green-800"} mr-3`}
                      >
                        {user.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal de formulário de usuário */}
      {showUserModal && (
        <UserFormModal
          user={selectedUser}
          companies={companies}
          scheduleGroups={scheduleGroups}
          companyId={companyId || selectedCompanyId}
          onClose={() => setShowUserModal(false)}
          onSave={() => {
            setShowUserModal(false)
            loadUsers()
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <ConfirmationModal
          title="Excluir Usuário"
          message={`Tem certeza que deseja excluir o usuário ${selectedUser?.name}? Esta ação não pode ser desfeita.`}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          confirmButtonClass="bg-red-600 hover:bg-red-800"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Modal de confirmação de ativação/desativação */}
      {showDeactivateModal && (
        <ConfirmationModal
          title={selectedUser?.active ? "Desativar Usuário" : "Ativar Usuário"}
          message={`Tem certeza que deseja ${selectedUser?.active ? "desativar" : "ativar"} o usuário ${selectedUser?.name}?`}
          confirmButtonText={selectedUser?.active ? "Desativar" : "Ativar"}
          cancelButtonText="Cancelar"
          confirmButtonClass={
            selectedUser?.active ? "bg-amber-600 hover:bg-amber-800" : "bg-green-600 hover:bg-green-800"
          }
          onConfirm={handleToggleActiveStatus}
          onCancel={() => setShowDeactivateModal(false)}
        />
      )}
    </div>
  )
}

export default UserManagementTable

