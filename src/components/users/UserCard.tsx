"use client"

import type { User, UserRole } from "@prisma/client"
import { Link } from "react-router-dom"

interface UserCardProps {
  user: User
  showActions?: boolean
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onToggleActive?: (user: User) => void
}

const UserCard = ({ user, showActions = false, onEdit, onDelete, onToggleActive }: UserCardProps) => {
  // Função para formatar o papel do usuário
  const formatRole = (role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      ADMIN: "Administrador",
      MANAGER: "Gerente",
      EMPLOYEE: "Funcionário",
    }
    return roleMap[role] || role
  }

  // Função para obter a cor do badge de papel
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      case "MANAGER":
        return "bg-blue-100 text-blue-800"
      case "EMPLOYEE":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Gerar iniciais para avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${!user.active ? "opacity-75" : ""}`}>
      <div className="p-5">
        <div className="flex items-center">
          {/* Avatar com iniciais */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {getInitials(user.name)}
            </div>
          </div>

          {/* Informações do usuário */}
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                {formatRole(user.role)}
              </span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {user.active ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>

        {/* Ações */}
        {showActions && (
          <div className="mt-5 flex justify-end space-x-2">
            <Link to={`/users/${user.id}`} className="text-primary hover:text-primary-dark">
              Ver
            </Link>

            {onEdit && (
              <button onClick={() => onEdit(user)} className="text-primary hover:text-primary-dark">
                Editar
              </button>
            )}

            {onToggleActive && (
              <button
                onClick={() => onToggleActive(user)}
                className={`${user.active ? "text-amber-600 hover:text-amber-800" : "text-green-600 hover:text-green-800"}`}
              >
                {user.active ? "Desativar" : "Ativar"}
              </button>
            )}

            {onDelete && (
              <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-800">
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCard

