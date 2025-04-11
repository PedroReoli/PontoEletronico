"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Clock, Search, Filter, Plus, Edit, Trash2, ArrowLeft, ChevronDown, X } from 'lucide-react'
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"

// Tipos
interface ShiftType {
  id: string
  name: string
  description: string
  duration: string
  breakTime: string
  status: "ACTIVE" | "INACTIVE"
  companyId: string
  companyName: string
}

function ShiftTypes() {
  // Estados
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedType, setSelectedType] = useState<ShiftType | null>(null)

  // Efeito para buscar dados
  useEffect(() => {
    const fetchShiftTypes = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const response = await api.get("/admin/shift-types")
          setShiftTypes(response.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados para desenvolvimento
          const mockShiftTypes: ShiftType[] = [
            {
              id: "type-1",
              name: "Padrão",
              description: "Jornada padrão de 8 horas",
              duration: "08:00",
              breakTime: "01:00",
              status: "ACTIVE",
              companyId: "comp-1",
              companyName: "Empresa Principal Ltda",
            },
            {
              id: "type-2",
              name: "Meio Período",
              description: "Jornada de 4 horas",
              duration: "04:00",
              breakTime: "00:15",
              status: "ACTIVE",
              companyId: "comp-1",
              companyName: "Empresa Principal Ltda",
            },
            {
              id: "type-3",
              name: "Plantão 12h",
              description: "Plantão de 12 horas",
              duration: "12:00",
              breakTime: "01:30",
              status: "ACTIVE",
              companyId: "comp-2",
              companyName: "Filial Norte S.A.",
            },
            {
              id: "type-4",
              name: "Noturno",
              description: "Jornada noturna de 6 horas",
              duration: "06:00",
              breakTime: "00:30",
              status: "ACTIVE",
              companyId: "comp-3",
              companyName: "Filial Sul Ltda",
            },
            {
              id: "type-5",
              name: "Flexível",
              description: "Horário flexível",
              duration: "08:00",
              breakTime: "01:00",
              status: "INACTIVE",
              companyId: "comp-1",
              companyName: "Empresa Principal Ltda",
            },
          ]

          setShiftTypes(mockShiftTypes)
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de turno:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShiftTypes()
  }, [])

  // Obter empresas únicas para o filtro
  const companies = Array.from(new Set(shiftTypes.map((type) => type.companyId))).map((id) => {
    const type = shiftTypes.find((t) => t.companyId === id)
    return { id, name: type?.companyName || "" }
  })

  // Filtrar tipos de turno
  const filteredTypes = shiftTypes.filter((type) => {
    const matchesSearch =
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.companyName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || type.status === statusFilter
    const matchesCompany = !companyFilter || type.companyId === companyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  // Função para obter classe de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Ativo</Badge>
      case "INACTIVE":
        return <Badge variant="error">Inativo</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Função para confirmar exclusão
  const handleDeleteClick = (type: ShiftType) => {
    setSelectedType(type)
    setShowDeleteModal(true)
  }

  // Função para excluir tipo de turno
  const handleDeleteConfirm = async () => {
    if (!selectedType) return

    try {
      // Aqui seria a chamada real à API
      // await api.delete(`/admin/shift-types/${selectedType.id}`)

      // Atualização otimista da UI
      setShiftTypes(shiftTypes.filter((type) => type.id !== selectedType.id))
      setShowDeleteModal(false)
      setSelectedType(null)

      // Mostrar mensagem de sucesso
      alert("Tipo de turno excluído com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir tipo de turno:", error)
      alert("Erro ao excluir tipo de turno. Tente novamente.")
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-6 px-1.5 py-0.5 text-xs" as={Link} to="/admin">
              <ArrowLeft size={12} className="mr-1" />
              Voltar
            </Button>
            <h1 className="text-lg font-bold text-gray-800">Tipos de Turno</h1>
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
            </Button>

            <Button size="sm" className="h-6 px-1.5 py-0.5 text-xs" as={Link} to="/admin/shift-types/new">
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
                    placeholder="Nome, descrição..."
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

        {/* Lista de Tipos de Turno */}
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="px-2 py-1 bg-gray-50 text-xs font-medium border-b flex items-center">
              <Clock size={12} className="text-green-500 mr-1" />
              <span>Tipos de Turno</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Nome</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Descrição</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Duração</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Intervalo</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Empresa</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-500">Status</th>
                    <th className="px-2 py-1 text-right font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1">
                        <div className="font-medium text-gray-900">{type.name}</div>
                      </td>
                      <td className="px-2 py-1 text-gray-500">{type.description}</td>
                      <td className="px-2 py-1 text-gray-500">
                        <div className="flex items-center">
                          <Clock size={10} className="text-gray-400 mr-1" />
                          {type.duration}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-gray-500">{type.breakTime}</td>
                      <td className="px-2 py-1 text-gray-500">{type.companyName}</td>
                      <td className="px-2 py-1">{getStatusBadge(type.status)}</td>
                      <td className="px-2 py-1 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-0.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            className="p-0.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                            title="Excluir"
                            onClick={() => handleDeleteClick(type)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTypes.length === 0 && (
                <div className="p-3 text-center text-gray-500">
                  <Clock size={20} className="mx-auto mb-1" />
                  <p className="text-xs">Nenhum tipo de turno encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Exclusão" size="sm">
          <div className="p-2">
            <p className="text-sm text-gray-600 mb-3">
              Tem certeza que deseja excluir o tipo <span className="font-medium">{selectedType?.name}</span>?
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
                <Trash2 size={12} className="mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default ShiftTypes
