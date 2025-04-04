"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { type Shift, ShiftType, type User } from "@prisma/client"
import { getUsersByCompany } from "@/services/userService"
import { getShiftsByDateRange, createShift, updateShift, deleteShift } from "@/services/shiftService"
import { useAuth } from "@/hooks/useAuth"
import ConfirmationModal from "@/components/common/ConfirmationModal"

interface ShiftDragDropBoardProps {
  companyId?: string
  month?: number
  year?: number
}

interface ShiftWithUser extends Shift {
  user: User
}

interface DragInfo {
  shiftId: string | null
  userId: string | null
  date: Date | null
}

const ShiftDragDropBoard = ({ companyId, month: propMonth, year: propYear }: ShiftDragDropBoardProps) => {
  const { user: authUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [shifts, setShifts] = useState<ShiftWithUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estado para o mês e ano atual
  const currentDate = new Date()
  const [month, setMonth] = useState<number>(propMonth || currentDate.getMonth())
  const [year, setYear] = useState<number>(propYear || currentDate.getFullYear())

  // Estado para arrastar e soltar
  const [draggedShift, setDraggedShift] = useState<DragInfo>({
    shiftId: null,
    userId: null,
    date: null,
  })

  // Estado para o modal de criação/edição de plantão
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [shiftType, setShiftType] = useState<ShiftType>(ShiftType.REGULAR)
  const [startTime, setStartTime] = useState<string>("08:00")
  const [endTime, setEndTime] = useState<string>("17:00")
  const [notes, setNotes] = useState<string>("")

  // Estado para o modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null)

  // Referência para o elemento sendo arrastado
  const draggedElementRef = useRef<HTMLDivElement | null>(null)

  // Gerar dias do mês
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days = []

    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }

    return days
  }

  const daysInMonth = getDaysInMonth(year, month)

  // Carregar usuários da empresa
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const targetCompanyId = companyId || authUser?.companyId
        if (!targetCompanyId) {
          setError("ID da empresa não disponível")
          return
        }

        const response = await getUsersByCompany(targetCompanyId)
        setUsers(response.data)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar usuários")
      }
    }

    loadUsers()
  }, [companyId, authUser])

  // Carregar plantões do mês
  useEffect(() => {
    const loadShifts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)

        const shiftsData = await getShiftsByDateRange(startDate, endDate)

        // Adicionar informações do usuário a cada plantão
        const shiftsWithUser = await Promise.all(
          shiftsData.map(async (shift) => {
            try {
              // Encontrar o usuário na lista já carregada
              const user = users.find((u) => u.id === shift.userId)

              if (user) {
                return { ...shift, user }
              } else {
                // Se não encontrar, retornar um usuário vazio
                return {
                  ...shift,
                  user: {
                    id: shift.userId,
                    name: "Usuário não encontrado",
                    email: "",
                    role: "EMPLOYEE",
                    active: true,
                    companyId: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    password: "",
                    scheduleGroupId: null,
                  },
                }
              }
            } catch (err) {
              console.error("Erro ao buscar usuário:", err)
              return {
                ...shift,
                user: {
                  id: shift.userId,
                  name: "Erro ao carregar usuário",
                  email: "",
                  role: "EMPLOYEE",
                  active: true,
                  companyId: "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  password: "",
                  scheduleGroupId: null,
                },
              }
            }
          }),
        )

        setShifts(shiftsWithUser)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar plantões")
      } finally {
        setIsLoading(false)
      }
    }

    if (users.length > 0) {
      loadShifts()
    }
  }, [month, year, users])

  // Mudar para o mês anterior
  const previousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  // Mudar para o próximo mês
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", weekday: "short" })
  }

  // Verificar se é fim de semana
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // 0 = domingo, 6 = sábado
  }

  // Obter plantões para um usuário e data específicos
  const getShiftsForUserAndDate = (userId: string, date: Date) => {
    const dateString = date.toISOString().split("T")[0]

    return shifts.filter(
      (shift) => shift.userId === userId && new Date(shift.date).toISOString().split("T")[0] === dateString,
    )
  }

  // Iniciar arrastar
  const handleDragStart = (e: React.DragEvent, shiftId: string | null, userId: string, date: Date) => {
    setDraggedShift({
      shiftId,
      userId,
      date,
    })

    // Armazenar referência ao elemento sendo arrastado
    if (e.currentTarget instanceof HTMLDivElement) {
      draggedElementRef.current = e.currentTarget

      // Adicionar classe para estilização durante o arrasto
      e.currentTarget.classList.add("opacity-50")
    }

    // Definir dados para transferência
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        shiftId,
        userId,
        date: date.toISOString(),
      }),
    )

    // Definir efeito de cópia se for um novo plantão (shiftId === null)
    e.dataTransfer.effectAllowed = shiftId === null ? "copy" : "move"
  }

  // Finalizar arrastar
  const handleDragEnd = (e: React.DragEvent) => {
    // Remover classe de estilização
    if (draggedElementRef.current) {
      draggedElementRef.current.classList.remove("opacity-50")
      draggedElementRef.current = null
    }

    // Resetar estado
    setDraggedShift({
      shiftId: null,
      userId: null,
      date: null,
    })
  }

  // Permitir soltar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()

    // Definir efeito visual de acordo com o tipo de operação
    if (draggedShift.shiftId === null) {
      e.dataTransfer.dropEffect = "copy" // Novo plantão
    } else {
      e.dataTransfer.dropEffect = "move" // Mover plantão existente
    }
  }

  // Processar soltar
  const handleDrop = async (e: React.DragEvent, targetUserId: string, targetDate: Date) => {
    e.preventDefault()

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain")) as DragInfo

      // Se for o mesmo local, não fazer nada
      if (
        data.userId === targetUserId &&
        data.date &&
        new Date(data.date).toDateString() === targetDate.toDateString()
      ) {
        return
      }

      if (data.shiftId) {
        // Mover plantão existente
        const shiftToMove = shifts.find((s) => s.id === data.shiftId)

        if (shiftToMove) {
          const updatedShift = await updateShift(data.shiftId, {
            userId: targetUserId,
            date: targetDate,
          })

          // Atualizar estado local
          setShifts(
            shifts.map((s) =>
              s.id === data.shiftId ? { ...updatedShift, user: users.find((u) => u.id === targetUserId) || s.user } : s,
            ),
          )

          setSuccess("Plantão movido com sucesso!")
        }
      } else {
        // Criar novo plantão
        openShiftModal(null, targetUserId, targetDate)
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar operação de arrastar e soltar")
    }
  }

  // Abrir modal para criar/editar plantão
  const openShiftModal = (shift: Shift | null, userId: string | null, date: Date | null) => {
    if (shift) {
      // Editar plantão existente
      setEditingShift(shift)
      setSelectedUserId(shift.userId)
      setSelectedDate(new Date(shift.date))
      setShiftType(shift.shiftType as ShiftType)
      setStartTime(shift.startTime)
      setEndTime(shift.endTime)
      setNotes(shift.notes || "")
    } else {
      // Criar novo plantão
      setEditingShift(null)
      setSelectedUserId(userId)
      setSelectedDate(date)
      setShiftType(ShiftType.REGULAR)
      setStartTime("08:00")
      setEndTime("17:00")
      setNotes("")
    }

    setShowShiftModal(true)
  }

  // Salvar plantão
  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !selectedDate) {
      setError("Usuário e data são obrigatórios")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (editingShift) {
        // Atualizar plantão existente
        const updatedShift = await updateShift(editingShift.id, {
          shiftType,
          startTime,
          endTime,
          notes,
          date: selectedDate,
          userId: selectedUserId,
        })

        // Atualizar estado local
        setShifts(
          shifts.map((s) =>
            s.id === editingShift.id
              ? { ...updatedShift, user: users.find((u) => u.id === selectedUserId) || s.user }
              : s,
          ),
        )

        setSuccess("Plantão atualizado com sucesso!")
      } else {
        // Criar novo plantão
        const newShift = await createShift({
          userId: selectedUserId,
          date: selectedDate,
          shiftType,
          startTime,
          endTime,
          notes,
        })

        // Adicionar ao estado local
        const user = users.find((u) => u.id === selectedUserId)
        if (user) {
          setShifts([...shifts, { ...newShift, user }])
        }

        setSuccess("Plantão criado com sucesso!")
      }

      // Fechar modal
      setShowShiftModal(false)
    } catch (err: any) {
      setError(err.message || "Erro ao salvar plantão")
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmar exclusão de plantão
  const handleDeleteConfirm = async () => {
    if (!shiftToDelete) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteShift(shiftToDelete.id)

      // Remover do estado local
      setShifts(shifts.filter((s) => s.id !== shiftToDelete.id))

      setSuccess("Plantão excluído com sucesso!")
      setShowDeleteModal(false)
      setShiftToDelete(null)
    } catch (err: any) {
      setError(err.message || "Erro ao excluir plantão")
    } finally {
      setIsLoading(false)
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

  // Obter cor de fundo para o tipo de plantão
  const getShiftTypeColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.REGULAR:
        return "bg-blue-100 border-blue-300 text-blue-800"
      case ShiftType.NIGHT:
        return "bg-purple-100 border-purple-300 text-purple-800"
      case ShiftType.TWELVE_THIRTY_SIX:
        return "bg-green-100 border-green-300 text-green-800"
      case ShiftType.TWENTY_FOUR_FORTY_EIGHT:
        return "bg-amber-100 border-amber-300 text-amber-800"
      case ShiftType.CUSTOM:
        return "bg-gray-100 border-gray-300 text-gray-800"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-heading-2 mb-2 md:mb-0">Quadro de Plantões</h2>

        <div className="flex items-center space-x-4">
          <button onClick={previousMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-body-1 font-medium">
            {new Date(year, month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>

          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

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

      {isLoading && users.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10">
                  Funcionário
                </th>
                {daysInMonth.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`border px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] ${
                      isWeekend(day) ? "bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    {formatDate(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border px-4 py-2 text-sm font-medium text-gray-900 bg-white sticky left-0 z-10">
                    {user.name}
                  </td>
                  {daysInMonth.map((day) => {
                    const userShifts = getShiftsForUserAndDate(user.id, day)

                    return (
                      <td
                        key={day.toISOString()}
                        className={`border px-2 py-2 text-sm text-gray-500 ${
                          isWeekend(day) ? "bg-gray-50" : "bg-white"
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, user.id, day)}
                      >
                        <div className="min-h-[60px]">
                          {userShifts.length > 0 ? (
                            <div className="space-y-1">
                              {userShifts.map((shift) => (
                                <div
                                  key={shift.id}
                                  className={`p-1 rounded border text-xs cursor-move ${getShiftTypeColor(shift.shiftType as ShiftType)}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, shift.id, user.id, day)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => openShiftModal(shift, null, null)}
                                >
                                  <div className="flex justify-between items-center">
                                    <span>{formatShiftType(shift.shiftType as ShiftType)}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setShiftToDelete(shift)
                                        setShowDeleteModal(true)
                                      }}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                  <div>
                                    {shift.startTime} - {shift.endTime}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="h-full w-full flex items-center justify-center text-gray-400 cursor-pointer"
                              onClick={() => openShiftModal(null, user.id, day)}
                              draggable
                              onDragStart={(e) => handleDragStart(e, null, user.id, day)}
                              onDragEnd={handleDragEnd}
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
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para criar/editar plantão */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-heading-3 mb-4">{editingShift ? "Editar Plantão" : "Novo Plantão"}</h3>

              <form onSubmit={handleSaveShift}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="userId" className="block text-body-2 font-medium mb-1">
                      Funcionário
                    </label>
                    <select
                      id="userId"
                      value={selectedUserId || ""}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Selecione um funcionário</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-body-2 font-medium mb-1">
                      Data
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="shiftType" className="block text-body-2 font-medium mb-1">
                      Tipo de Plantão
                    </label>
                    <select
                      id="shiftType"
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value as ShiftType)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      {Object.values(ShiftType).map((type) => (
                        <option key={type} value={type}>
                          {formatShiftType(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && shiftToDelete && (
        <ConfirmationModal
          title="Excluir Plantão"
          message="Tem certeza que deseja excluir este plantão? Esta ação não pode ser desfeita."
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          confirmButtonClass="bg-red-600 hover:bg-red-800"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false)
            setShiftToDelete(null)
          }}
        />
      )}
    </div>
  )
}

export default ShiftDragDropBoard

