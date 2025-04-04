"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type User, UserRole, type Company, type ScheduleGroup } from "@prisma/client"
import { createUser, updateUser } from "@/services/userService"
import { getScheduleGroupsByCompany } from "@/services/scheduleGroupService"

interface UserFormModalProps {
  user: User | null // Se null, é um novo usuário
  companies: Company[]
  scheduleGroups: ScheduleGroup[]
  companyId?: string // Se fornecido, pré-seleciona a empresa
  onClose: () => void
  onSave: () => void
}

const UserFormModal = ({
  user,
  companies,
  scheduleGroups: initialScheduleGroups,
  companyId,
  onClose,
  onSave,
}: UserFormModalProps) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE)
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [selectedScheduleGroupId, setSelectedScheduleGroupId] = useState("")
  const [active, setActive] = useState(true)
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(initialScheduleGroups)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Inicializar o formulário com os dados do usuário (se estiver editando)
  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setSelectedCompanyId(user.companyId)
      setSelectedScheduleGroupId(user.scheduleGroupId || "")
      setActive(user.active)
    } else {
      // Valores padrão para novo usuário
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setRole(UserRole.EMPLOYEE)
      setSelectedCompanyId(companyId || "")
      setSelectedScheduleGroupId("")
      setActive(true)
    }
  }, [user, companyId])

  // Carregar grupos de jornada quando a empresa é alterada
  useEffect(() => {
    const loadScheduleGroups = async () => {
      if (selectedCompanyId) {
        try {
          const groups = await getScheduleGroupsByCompany(selectedCompanyId)
          setScheduleGroups(groups)

          // Se o grupo atual não pertence à empresa selecionada, limpar a seleção
          if (groups.length > 0 && !groups.some((g) => g.id === selectedScheduleGroupId)) {
            setSelectedScheduleGroupId("")
          }
        } catch (err) {
          console.error("Erro ao carregar grupos de jornada:", err)
        }
      } else {
        setScheduleGroups([])
        setSelectedScheduleGroupId("")
      }
    }

    loadScheduleGroups()
  }, [selectedCompanyId, selectedScheduleGroupId])

  // Validar senha
  const validatePassword = () => {
    // Só validar senha se for um novo usuário ou se a senha foi preenchida
    if (!user || password) {
      if (password !== confirmPassword) {
        setPasswordError("As senhas não coincidem")
        return false
      }

      if (!user && password.length < 8) {
        setPasswordError("A senha deve ter pelo menos 8 caracteres")
        return false
      }
    }

    setPasswordError(null)
    return true
  }

  // Salvar usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePassword()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (user) {
        // Atualizar usuário existente
        await updateUser(user.id, {
          name,
          email,
          role,
          companyId: selectedCompanyId,
          scheduleGroupId: selectedScheduleGroupId || null,
          active,
        })
      } else {
        // Criar novo usuário
        await createUser({
          name,
          email,
          password,
          role,
          companyId: selectedCompanyId,
          scheduleGroupId: selectedScheduleGroupId || undefined,
          active,
        })
      }

      onSave()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-heading-3 mb-4">{user ? "Editar Usuário" : "Novo Usuário"}</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
              <span className="block sm:inline">{error}</span>
              <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                <span className="text-xl">&times;</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nome */}
            <div className="mb-4">
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

            {/* Email */}
            <div className="mb-4">
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

            {/* Senha (apenas para novos usuários) */}
            {!user && (
              <>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-body-2 font-medium mb-1">
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required={!user}
                    minLength={8}
                  />
                  <p className="text-small text-muted mt-1">A senha deve ter pelo menos 8 caracteres</p>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-body-2 font-medium mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      passwordError ? "border-red-500" : ""
                    }`}
                    required={!user}
                  />
                  {passwordError && <p className="text-small text-red-500 mt-1">{passwordError}</p>}
                </div>
              </>
            )}

            {/* Papel */}
            <div className="mb-4">
              <label htmlFor="role" className="block text-body-2 font-medium mb-1">
                Papel
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value={UserRole.ADMIN}>Administrador</option>
                <option value={UserRole.MANAGER}>Gerente</option>
                <option value={UserRole.EMPLOYEE}>Funcionário</option>
              </select>
            </div>

            {/* Empresa */}
            <div className="mb-4">
              <label htmlFor="companyId" className="block text-body-2 font-medium mb-1">
                Empresa
              </label>
              <select
                id="companyId"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={!!companyId} // Desabilitar se a empresa já estiver definida
              >
                <option value="" disabled>
                  Selecione uma empresa
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupo de Jornada */}
            <div className="mb-4">
              <label htmlFor="scheduleGroupId" className="block text-body-2 font-medium mb-1">
                Grupo de Jornada
              </label>
              <select
                id="scheduleGroupId"
                value={selectedScheduleGroupId}
                onChange={(e) => setSelectedScheduleGroupId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Nenhum</option>
                {scheduleGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (apenas para edição) */}
            {user && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-body-2">Usuário ativo</span>
                </label>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
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
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserFormModal

