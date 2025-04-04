"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User, ScheduleGroup, UserRole } from "@prisma/client"
import { getUserById, updateUser, changeUserPassword } from "@/services/userService"
import { getScheduleGroupById } from "@/services/scheduleGroupService"
import { useAuth } from "@/hooks/useAuth"

interface UserProfileProps {
  userId?: string // Se não fornecido, usa o usuário atual
  canEdit?: boolean // Se true, permite edição
}

const UserProfile = ({ userId, canEdit = false }: UserProfileProps) => {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [scheduleGroup, setScheduleGroup] = useState<ScheduleGroup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Campos de edição
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Campos de senha
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Determinar qual ID de usuário usar
  const targetUserId = userId || authUser?.id

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!targetUserId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const userData = await getUserById(targetUserId)
        setUser(userData)
        setName(userData.name)
        setEmail(userData.email)

        // Carregar grupo de jornada se existir
        if (userData.scheduleGroupId) {
          try {
            const groupData = await getScheduleGroupById(userData.scheduleGroupId)
            setScheduleGroup(groupData)
          } catch (err) {
            console.error("Erro ao carregar grupo de jornada:", err)
          }
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do usuário")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [targetUserId])

  // Função para salvar alterações do perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const updatedUser = await updateUser(user.id, { name, email })
      setUser(updatedUser)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para validar e alterar senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validar senhas
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres")
      return
    }

    setIsLoading(true)
    setPasswordError(null)
    setError(null)

    try {
      await changeUserPassword(user.id, currentPassword, newPassword)
      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordError(err.message || "Erro ao alterar senha")
    } finally {
      setIsLoading(false)
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

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-heading-2 mb-2 md:mb-0">Perfil do Usuário</h2>

        {canEdit && !isEditing && !isChangingPassword && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Editar Perfil
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Alterar Senha
            </button>
          </div>
        )}
      </div>

      {/* Visualização do perfil */}
      {!isEditing && !isChangingPassword && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-heading-4 mb-4">Informações Pessoais</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="text-body-1">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-body-1">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Papel</p>
                <p className="text-body-1">{formatRole(user.role)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-heading-4 mb-4">Jornada de Trabalho</h3>
            {scheduleGroup ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Grupo</p>
                  <p className="text-body-1">{scheduleGroup.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="text-body-1">
                    {scheduleGroup.entryTime} - {scheduleGroup.exitTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intervalo</p>
                  <p className="text-body-1">{scheduleGroup.breakDuration} minutos</p>
                </div>
              </div>
            ) : (
              <p className="text-body-2 text-gray-500">Nenhum grupo de jornada atribuído</p>
            )}
          </div>
        </div>
      )}

      {/* Formulário de edição de perfil */}
      {isEditing && (
        <form onSubmit={handleSaveProfile}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-body-2 font-medium mb-1">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-body-2 font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      {/* Formulário de alteração de senha */}
      {isChangingPassword && (
        <form onSubmit={handleChangePassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-body-2 font-medium mb-1">
                Senha Atual
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-body-2 font-medium mb-1">
                Nova Senha
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={8}
              />
              <p className="text-small text-muted mt-1">A senha deve ter pelo menos 8 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-body-2 font-medium mb-1">
                Confirmar Nova Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  passwordError ? "border-red-500" : ""
                }`}
                required
              />
              {passwordError && <p className="text-small text-red-500 mt-1">{passwordError}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(false)
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setPasswordError(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UserProfile

