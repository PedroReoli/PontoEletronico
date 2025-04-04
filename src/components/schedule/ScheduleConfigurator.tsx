"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { ScheduleGroup } from "@prisma/client"
import {
  getScheduleGroups,
  createScheduleGroup,
  updateScheduleGroup,
  deleteScheduleGroup,
} from "@/services/scheduleService"
import { getCompanies } from "@/services/companyService"
import ConfirmationModal from "@/components/common/ConfirmationModal"

interface ScheduleConfiguratorProps {
  companyId?: string
  onScheduleGroupChange?: () => void
}

const ScheduleConfigurator = ({ companyId, onScheduleGroupChange }: ScheduleConfiguratorProps) => {
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([])
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId || "")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para o formulário
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [editingGroup, setEditingGroup] = useState<ScheduleGroup | null>(null)
  const [name, setName] = useState<string>("")
  const [entryTime, setEntryTime] = useState<string>("09:00")
  const [exitTime, setExitTime] = useState<string>("18:00")
  const [breakDuration, setBreakDuration] = useState<number>(60)

  // Estado para confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [groupToDelete, setGroupToDelete] = useState<ScheduleGroup | null>(null)

  // Carregar empresas se não for fornecido um companyId
  useEffect(() => {
    if (!companyId) {
      const loadCompanies = async () => {
        try {
          const response = await getCompanies()
          setCompanies(response.data)
        } catch (err: any) {
          setError(err.message || "Erro ao carregar empresas")
        }
      }

      loadCompanies()
    }
  }, [companyId])

  // Carregar grupos de jornada
  useEffect(() => {
    const loadScheduleGroups = async () => {
      if (!selectedCompanyId && !companyId) {
        setScheduleGroups([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const groups = await getScheduleGroups(selectedCompanyId || companyId)
        setScheduleGroups(groups)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar grupos de jornada")
      } finally {
        setIsLoading(false)
      }
    }

    loadScheduleGroups()
  }, [selectedCompanyId, companyId])

  // Resetar o formulário
  const resetForm = () => {
    setName("")
    setEntryTime("09:00")
    setExitTime("18:00")
    setBreakDuration(60)
    setEditingGroup(null)
  }

  // Abrir formulário para edição
  const handleEdit = (group: ScheduleGroup) => {
    setEditingGroup(group)
    setName(group.name)
    setEntryTime(group.entryTime)
    setExitTime(group.exitTime)
    setBreakDuration(group.breakDuration)
    setIsFormOpen(true)
  }

  // Abrir formulário para criação
  const handleCreate = () => {
    resetForm()
    setIsFormOpen(true)
  }

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteScheduleGroup(groupToDelete.id)

      // Atualizar a lista
      setScheduleGroups(scheduleGroups.filter((group) => group.id !== groupToDelete.id))

      // Notificar mudança
      if (onScheduleGroupChange) {
        onScheduleGroupChange()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao excluir grupo de jornada")
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
      setGroupToDelete(null)
    }
  }

  // Salvar grupo de jornada (criar ou atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompanyId && !companyId) {
      setError("Selecione uma empresa")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (editingGroup) {
        // Atualizar grupo existente
        const updatedGroup = await updateScheduleGroup(editingGroup.id, {
          name,
          entryTime,
          exitTime,
          breakDuration,
        })

        // Atualizar a lista
        setScheduleGroups(scheduleGroups.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)))
      } else {
        // Criar novo grupo
        const newGroup = await createScheduleGroup({
          name,
          entryTime,
          exitTime,
          breakDuration,
          companyId: selectedCompanyId || companyId || "",
        })

        // Adicionar à lista
        setScheduleGroups([...scheduleGroups, newGroup])
      }

      // Fechar formulário e resetar
      setIsFormOpen(false)
      resetForm()

      // Notificar mudança
      if (onScheduleGroupChange) {
        onScheduleGroupChange()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar grupo de jornada")
    } finally {
      setIsLoading(false)
    }
  }

  // Formatar duração do intervalo para exibição
  const formatBreakDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}min`
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-2 mb-6">Configuração de Jornadas</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Seletor de empresa (se não for fornecido companyId) */}
      {!companyId && (
        <div className="mb-6">
          <label htmlFor="companySelect" className="block text-body-2 font-medium mb-1">
            Empresa
          </label>
          <select
            id="companySelect"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione uma empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botão para adicionar novo grupo */}
      <div className="mb-6">
        <button
          onClick={handleCreate}
          disabled={!selectedCompanyId && !companyId}
          className={`bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center ${
            !selectedCompanyId && !companyId ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
          Adicionar Grupo de Jornada
        </button>
      </div>

      {/* Lista de grupos de jornada */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : scheduleGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {selectedCompanyId || companyId
            ? "Nenhum grupo de jornada encontrado. Crie um novo grupo."
            : "Selecione uma empresa para ver os grupos de jornada."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduleGroups.map((group) => (
            <div key={group.id} className="border rounded-lg p-4 bg-white">
              <h3 className="text-heading-4 mb-2">{group.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Horário:</span>
                  <span className="text-body-2 font-medium">
                    {group.entryTime} - {group.exitTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Intervalo:</span>
                  <span className="text-body-2 font-medium">{formatBreakDuration(group.breakDuration)}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => handleEdit(group)} className="text-primary hover:text-primary-dark">
                  Editar
                </button>
                <button
                  onClick={() => {
                    setGroupToDelete(group)
                    setShowDeleteModal(true)
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário para criar/editar grupo */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-heading-3 mb-4">
                {editingGroup ? "Editar Grupo de Jornada" : "Novo Grupo de Jornada"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-body-2 font-medium mb-1">
                      Nome do Grupo
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="entryTime" className="block text-body-2 font-medium mb-1">
                        Horário de Entrada
                      </label>
                      <input
                        id="entryTime"
                        type="time"
                        value={entryTime}
                        onChange={(e) => setEntryTime(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="exitTime" className="block text-body-2 font-medium mb-1">
                        Horário de Saída
                      </label>
                      <input
                        id="exitTime"
                        type="time"
                        value={exitTime}
                        onChange={(e) => setExitTime(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="breakDuration" className="block text-body-2 font-medium mb-1">
                      Duração do Intervalo (minutos)
                    </label>
                    <input
                      id="breakDuration"
                      type="number"
                      min="0"
                      step="5"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(Number.parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      resetForm()
                    }}
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
      {showDeleteModal && groupToDelete && (
        <ConfirmationModal
          title="Excluir Grupo de Jornada"
          message={`Tem certeza que deseja excluir o grupo "${groupToDelete.name}"? Esta ação não pode ser desfeita.`}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          confirmButtonClass="bg-red-600 hover:bg-red-800"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false)
            setGroupToDelete(null)
          }}
        />
      )}
    </div>
  )
}

export default ScheduleConfigurator

