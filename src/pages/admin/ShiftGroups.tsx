"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Calendar, Search, Filter, Plus, Edit, Trash2, ArrowLeft, ChevronDown, X, Users } from "lucide-react"
import api from "../../services/api"
import Layout from "../../components/Layout"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import Modal from "../../components/ui/Modal"

interface ShiftGroup {
  id: string
  name: string
  startTime: string
  endTime: string
  breakDuration: number
  companyId: string
  companyName: string
  employeeCount: number
  workDays: string[]
  status: "ACTIVE" | "INACTIVE"
  createdAt: string
  updatedAt: string
}

function ShiftGroups() {
  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentShiftGroup, setCurrentShiftGroup] = useState<ShiftGroup | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    breakDuration: 60,
    companyId: "",
    workDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
  })
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [shiftGroupsResponse, companiesResponse] = await Promise.all([
          api.get("/admin/shift-groups"),
          api.get("/admin/companies"),
        ])

        setShiftGroups(shiftGroupsResponse.data)
        setCompanies(companiesResponse.data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)

        // Dados mockados para desenvolvimento
        const mockShiftGroups: ShiftGroup[] = [
          {
            id: "group-1",
            name: "Horário Comercial",
            startTime: "09:00",
            endTime: "18:00",
            breakDuration: 60,
            companyId: "comp-1",
            companyName: "Empresa Principal",
            employeeCount: 45,
            workDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
            status: "ACTIVE",
            createdAt: "2024-12-10T14:30:00",
            updatedAt: "2024-12-10T14:30:00",
          },
          {
            id: "group-2",
            name: "Turno da Manhã",
            startTime: "06:00",
            endTime: "14:00",
            breakDuration: 30,
            companyId: "comp-1",
            companyName: "Empresa Principal",
            employeeCount: 18,
            workDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            status: "ACTIVE",
            createdAt: "2025-01-15T09:20:00",
            updatedAt: "2025-01-15T09:20:00",
          },
          {
            id: "group-3",
            name: "Turno da Tarde",
            startTime: "14:00",
            endTime: "22:00",
            breakDuration: 30,
            companyId: "comp-2",
            companyName: "Filial Norte",
            employeeCount: 15,
            workDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
            status: "ACTIVE",
            createdAt: "2025-01-15T09:25:00",
            updatedAt: "2025-01-15T09:25:00",
          },
          {
            id: "group-4",
            name: "Escala 12x36",
            startTime: "07:00",
            endTime: "19:00",
            breakDuration: 60,
            companyId: "comp-3",
            companyName: "Filial Sul",
            employeeCount: 24,
            workDays: ["Variável"],
            status: "ACTIVE",
            createdAt: "2025-02-05T11:45:00",
            updatedAt: "2025-02-05T11:45:00",
          },
          {
            id: "group-5",
            name: "Meio Período",
            startTime: "13:00",
            endTime: "17:00",
            breakDuration: 15,
            companyId: "comp-1",
            companyName: "Empresa Principal",
            employeeCount: 8,
            workDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
            status: "INACTIVE",
            createdAt: "2025-03-01T08:30:00",
            updatedAt: "2025-03-01T08:30:00",
          },
        ]

        const mockCompanies = [
          { id: "comp-1", name: "Empresa Principal" },
          { id: "comp-2", name: "Filial Norte" },
          { id: "comp-3", name: "Filial Sul" },
        ]

        setShiftGroups(mockShiftGroups)
        setCompanies(mockCompanies)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "breakDuration" ? Number.parseInt(value) : value,
    }))
  }

  const handleWorkDayChange = (day: string) => {
    setFormData((prev) => {
      if (prev.workDays.includes(day)) {
        return { ...prev, workDays: prev.workDays.filter((d) => d !== day) }
      } else {
        return { ...prev, workDays: [...prev.workDays, day] }
      }
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "09:00",
      endTime: "18:00",
      breakDuration: 60,
      companyId: "",
      workDays: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    })
    setCurrentShiftGroup(null)
  }

  const handleAddShiftGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post("/admin/shift-groups", formData)
      setShiftGroups([...shiftGroups, response.data])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao adicionar grupo de jornada:", error)
    }
  }

  const handleEditShiftGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentShiftGroup) return

    try {
      const response = await api.put(`/admin/shift-groups/${currentShiftGroup.id}`, formData)
      setShiftGroups(shiftGroups.map((group) => (group.id === currentShiftGroup.id ? response.data : group)))
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao editar grupo de jornada:", error)
    }
  }

  const handleDeleteShiftGroup = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este grupo de jornada?")) return

    try {
      await api.delete(`/admin/shift-groups/${id}`)
      setShiftGroups(shiftGroups.filter((group) => group.id !== id))
    } catch (error) {
      console.error("Erro ao excluir grupo de jornada:", error)
    }
  }

  const openEditModal = (shiftGroup: ShiftGroup) => {
    setCurrentShiftGroup(shiftGroup)
    setFormData({
      name: shiftGroup.name,
      startTime: shiftGroup.startTime,
      endTime: shiftGroup.endTime,
      breakDuration: shiftGroup.breakDuration,
      companyId: shiftGroup.companyId,
      workDays: shiftGroup.workDays,
    })
    setShowEditModal(true)
  }

  const formatBreakDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours > 0 ? `${hours}h` : ""}${mins > 0 ? ` ${mins}min` : ""}`
  }

  const formatWorkDays = (days: string[] | undefined) => {
    if (!days || days.length === 0) {
      return "-"
    }
    if (days.length === 1 && days[0] === "Variável") {
      return "Variável"
    }

    if (days.length === 7) {
      return "Todos os dias"
    }

    if (
      days.length === 5 &&
      days.includes("Segunda") &&
      days.includes("Terça") &&
      days.includes("Quarta") &&
      days.includes("Quinta") &&
      days.includes("Sexta")
    ) {
      return "Seg-Sex"
    }

    if (
      days.length === 6 &&
      days.includes("Segunda") &&
      days.includes("Terça") &&
      days.includes("Quarta") &&
      days.includes("Quinta") &&
      days.includes("Sexta") &&
      days.includes("Sábado")
    ) {
      return "Seg-Sáb"
    }

    return days.map((d) => d.substring(0, 3)).join(", ")
  }

  // Filtrar grupos de turno
  const filteredGroups = shiftGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.companyName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || group.status === statusFilter
    const matchesCompany = !companyFilter || group.companyId === companyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-6 px-1.5 py-0.5 text-xs" as={Link} to="/admin">
              <ArrowLeft size={12} className="mr-1" />
              Voltar
            </Button>
            <h1 className="text-lg font-bold text-gray-800">Grupos de Jornada</h1>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-1.5 py-0.5 text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={12} className="mr-1" />
              Filtros
              {showFilters ? (
                <ChevronDown size={12} className="ml-1 rotate-180" />
              ) : (
                <ChevronDown size={12} className="ml-1" />
              )}
            </Button>

            <Button size="sm" className="h-6 px-1.5 py-0.5 text-xs" onClick={() => setShowAddModal(true)}>
              <Plus size={12} className="mr-1" />
              Novo
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 mb-2 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                  Status:
                </label>
                <select
                  id="status"
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-6"
                >
                  <option value="">Todos</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>

              <div>
                <label htmlFor="company" className="block text-xs font-medium text-gray-700 mb-1">
                  Empresa:
                </label>
                <select
                  id="company"
                  value={companyFilter || ""}
                  onChange={(e) => setCompanyFilter(e.target.value || null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-6"
                >
                  <option value="">Todas</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                  Buscar:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search size={12} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Nome, empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-6"
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      onClick={() => setSearchTerm("")}
                    >
                      <X size={12} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-5 px-1.5 py-0 text-xs"
                onClick={() => {
                  setStatusFilter(null)
                  setCompanyFilter(null)
                  setSearchTerm("")
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Grupos de Jornada */}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="px-2 py-1 bg-gray-50 text-xs font-medium border-b flex items-center">
              <Calendar size={12} className="text-amber-500 mr-1" />
              <span>Grupos de Jornada</span>
            </div>

            {filteredGroups.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                <Calendar size={20} className="mx-auto mb-1" />
                <p className="text-xs">Nenhum grupo de jornada encontrado</p>
                <Button size="sm" className="mt-2 h-6 px-2 py-0.5 text-xs" onClick={() => setShowAddModal(true)}>
                  <Plus size={12} className="mr-1" />
                  Criar Primeiro Grupo
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Nome</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Empresa</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Horário</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Intervalo</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Dias</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Funcionários</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">Status</th>
                      <th className="px-2 py-1 text-right font-medium text-gray-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-2 py-1">
                          <div className="font-medium text-gray-900">{group.name}</div>
                        </td>
                        <td className="px-2 py-1 text-gray-500">{group.companyName}</td>
                        <td className="px-2 py-1 text-gray-500">
                          {group.startTime} - {group.endTime}
                        </td>
                        <td className="px-2 py-1 text-gray-500">{formatBreakDuration(group.breakDuration)}</td>
                        <td className="px-2 py-1 text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={10} className="text-gray-400 mr-1" />
                            {formatWorkDays(group.workDays)}
                          </div>
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center">
                            <Users size={10} className="text-gray-400 mr-1" />
                            {group.employeeCount}
                          </div>
                        </td>
                        <td className="px-2 py-1">
                          <Badge
                            variant={group.status === "ACTIVE" ? "success" : "error"}
                            className="text-[10px] px-1 py-0"
                          >
                            {group.status === "ACTIVE" ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="px-2 py-1 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              className="p-0.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                              title="Editar"
                              onClick={() => openEditModal(group)}
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              className="p-0.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                              title="Excluir"
                              onClick={() => handleDeleteShiftGroup(group.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal de Adicionar */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Novo Grupo de Jornada" size="md">
          <form onSubmit={handleAddShiftGroup} className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="companyId" className="block text-xs font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <select
                  id="companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="startTime" className="block text-xs font-medium text-gray-700 mb-1">
                  Horário de Início
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-xs font-medium text-gray-700 mb-1">
                  Horário de Término
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div>
                <label htmlFor="breakDuration" className="block text-xs font-medium text-gray-700 mb-1">
                  Duração do Intervalo (min)
                </label>
                <input
                  type="number"
                  id="breakDuration"
                  name="breakDuration"
                  min="0"
                  max="240"
                  value={formData.breakDuration}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Dias de Trabalho</label>
                <div className="flex flex-wrap gap-1">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo", "Variável"].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.workDays.includes(day)}
                        onChange={() => handleWorkDayChange(day)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 mr-1"
                      />
                      <span className="text-xs">{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                Adicionar
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Editar */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Grupo de Jornada" size="md">
          <form onSubmit={handleEditShiftGroup} className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="edit-name" className="block text-xs font-medium text-gray-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="edit-companyId" className="block text-xs font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <select
                  id="edit-companyId"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-startTime" className="block text-xs font-medium text-gray-700 mb-1">
                  Horário de Início
                </label>
                <input
                  type="time"
                  id="edit-startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-endTime" className="block text-xs font-medium text-gray-700 mb-1">
                  Horário de Término
                </label>
                <input
                  type="time"
                  id="edit-endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-breakDuration" className="block text-xs font-medium text-gray-700 mb-1">
                  Duração do Intervalo (min)
                </label>
                <input
                  type="number"
                  id="edit-breakDuration"
                  name="breakDuration"
                  min="0"
                  max="240"
                  value={formData.breakDuration}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs h-7"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Dias de Trabalho</label>
                <div className="flex flex-wrap gap-1">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo", "Variável"].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.workDays.includes(day)}
                        onChange={() => handleWorkDayChange(day)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 mr-1"
                      />
                      <span className="text-xs">{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default ShiftGroups
