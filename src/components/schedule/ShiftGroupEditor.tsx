"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ShiftType, type User } from "@prisma/client"
import { getUsersByCompany } from "@/services/userService"
import { createBulkShifts } from "@/services/shiftService"
import { useAuth } from "@/hooks/useAuth"

interface ShiftGroupEditorProps {
  companyId?: string
  onShiftsCreated?: () => void
}

const ShiftGroupEditor = ({ companyId, onShiftsCreated }: ShiftGroupEditorProps) => {
  const { user: authUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estado para o formulário de plantão
  const [shiftType, setShiftType] = useState<ShiftType>(ShiftType.REGULAR)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("08:00")
  const [endTime, setEndTime] = useState<string>("17:00")
  const [notes, setNotes] = useState<string>("")

  // Carregar usuários da empresa
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const targetCompanyId = companyId || authUser?.companyId
        if (!targetCompanyId) {
          setError("ID da empresa não disponível")
          setIsLoading(false)
          return
        }

        const response = await getUsersByCompany(targetCompanyId)
        setUsers(response.data)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar usuários")
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [companyId, authUser])

  // Alternar seleção de usuário
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Selecionar todos os usuários
  const selectAllUsers = () => {
    setSelectedUsers(users.map((user) => user.id))
  }

  // Desselecionar todos os usuários
  const deselectAllUsers = () => {
    setSelectedUsers([])
  }

  // Criar plantões em massa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedUsers.length === 0) {
      setError("Selecione pelo menos um usuário")
      return
    }

    if (!startDate || !endDate) {
      setError("Selecione as datas de início e fim")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Gerar datas entre startDate e endDate
      const start = new Date(startDate)
      const end = new Date(endDate)
      const dates: Date[] = []

      const currentDate = new Date(start)
      while (currentDate <= end) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Criar array de plantões para cada usuário e cada data
      const shifts = selectedUsers.flatMap((userId) =>
        dates.map((date) => ({
          userId,
          date,
          shiftType,
          startTime,
          endTime,
          notes,
        })),
      )

      // Enviar para a API
      await createBulkShifts(shifts)

      // Mostrar mensagem de sucesso
      setSuccess(`${shifts.length} plantões criados com sucesso!`)

      // Limpar formulário
      setSelectedUsers([])
      setStartDate("")
      setEndDate("")
      setNotes("")

      // Notificar componente pai
      if (onShiftsCreated) {
        onShiftsCreated()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar plantões")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formatar o tipo de plantão para exibição
  const formatShiftType = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return "Regular"
      case ShiftType.NIGHT:
        return "Noturno"
      case ShiftType.TWELVE_THIRTY_SIX:
        return "12x36"
      case ShiftType.TWENTY_FOUR_FORTY_EIGHT:
        return "24x48"
      case ShiftType.CUSTOM:
        return "Personalizado"
      default:
        return type
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-2 mb-6">Editor de Grupos de Plantão</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{success}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuração do plantão */}
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-heading-4 mb-4">Configuração do Plantão</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="shiftType" className="block text-body-2 font-medium mb-1">
                Tipo de Plantão
              </label>
              <select
                id="shiftType"
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as ShiftType)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.values(ShiftType).map((type) => (
                  <option key={type} value={type}>
                    {formatShiftType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startTime" className="block text-body-2 font-medium mb-1">
                  Hora Início
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-body-2 font-medium mb-1">
                  Hora Fim
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startDate" className="block text-body-2 font-medium mb-1">
                Data Início
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-body-2 font-medium mb-1">
                Data Fim
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-body-2 font-medium mb-1">
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          </div>
        </div>

        {/* Seleção de usuários */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-heading-4">Selecionar Funcionários</h3>

            <div className="flex space-x-2">
              <button type="button" onClick={selectAllUsers} className="text-sm text-primary hover:underline">
                Selecionar todos
              </button>
              <button type="button" onClick={deselectAllUsers} className="text-sm text-gray-500 hover:underline">
                Limpar seleção
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum funcionário encontrado.</div>
          ) : (
            <div className="max-h-64 overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Selecionar
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`${selectedUsers.includes(user.id) ? "bg-blue-50" : ""} hover:bg-gray-50 cursor-pointer`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">{selectedUsers.length} funcionários selecionados</div>
        </div>

        {/* Botão de submissão */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            disabled={isSubmitting || selectedUsers.length === 0}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Criando plantões...
              </span>
            ) : (
              "Criar Plantões"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ShiftGroupEditor

