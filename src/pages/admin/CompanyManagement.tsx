"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Building, Search, Filter, Plus, Edit, Trash2, ArrowLeft, ChevronDown, X, Download, MapPin, Users, ExternalLink } from 'lucide-react'
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"

// Tipos
interface Company {
  id: string
  name: string
  document: string
  address: string
  city: string
  state: string
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  employeeCount: number
  createdAt: string
}

function CompanyManagement() {
  // Estados
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Efeito para buscar dados
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        
        // Tentar buscar dados da API
        try {
          const response = await api.get("/admin/companies")
          setCompanies(response.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)
          
          // Dados mockados para desenvolvimento
          const mockCompanies: Company[] = [
            {
              id: "comp-1",
              name: "Empresa Principal Ltda",
              document: "12.345.678/0001-90",
              address: "Av. Paulista, 1000",
              city: "São Paulo",
              state: "SP",
              status: "ACTIVE",
              employeeCount: 120,
              createdAt: "2024-10-15T14:30:00",
            },
            {
              id: "comp-2",
              name: "Filial Norte S.A.",
              document: "23.456.789/0001-01",
              address: "Rua das Flores, 500",
              city: "Recife",
              state: "PE",
              status: "ACTIVE",
              employeeCount: 45,
              createdAt: "2025-01-10T09:20:00",
            },
            {
              id: "comp-3",
              name: "Filial Sul Ltda",
              document: "34.567.890/0001-12",
              address: "Av. Beira Mar, 200",
              city: "Porto Alegre",
              state: "RS",
              status: "ACTIVE",
              employeeCount: 38,
              createdAt: "2025-02-05T11:45:00",
            },
            {
              id: "comp-4",
              name: "Tech Solutions Ltda",
              document: "45.678.901/0001-23",
              address: "Rua da Inovação, 100",
              city: "Belo Horizonte",
              state: "MG",
              status: "PENDING",
              employeeCount: 12,
              createdAt: "2025-03-20T16:10:00",
            },
            {
              id: "comp-5",
              name: "Empresa Oeste S.A.",
              document: "56.789.012/0001-34",
              address: "Av. Central, 300",
              city: "Cuiabá",
              state: "MT",
              status: "INACTIVE",
              employeeCount: 0,
              createdAt: "2025-01-05T08:30:00",
            },
          ]
          
          setCompanies(mockCompanies)
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompanies()
  }, [])

  // Filtrar empresas
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.state.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || company.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Função para obter classe de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Ativa</Badge>
      case "INACTIVE":
        return <Badge variant="error">Inativa</Badge>
      case "PENDING":
        return <Badge variant="warning">Pendente</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Função para confirmar exclusão
  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company)
    setShowDeleteModal(true)
  }

  // Função para excluir empresa
  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return
    
    try {
      // Aqui seria a chamada real à API
      // await api.delete(`/admin/companies/${selectedCompany.id}`)
      
      // Atualização otimista da UI
      setCompanies(companies.filter(company => company.id !== selectedCompany.id))
      setShowDeleteModal(false)
      setSelectedCompany(null)
      
      // Mostrar mensagem de sucesso
      alert("Empresa excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir empresa:", error)
      alert("Erro ao excluir empresa. Tente novamente.")
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 py-1 text-xs"
              as={Link} 
              to="/admin"
            >
              <ArrowLeft size={14} className="mr-1" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-800">Gerenciar Empresas</h1>
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
              {showFilters ? <ChevronDown size={14} className="ml-1 rotate-180" /> : <ChevronDown size={14} className="ml-1" />}
            </Button>
            
            <Button 
              size="sm" 
              className="h-7 px-2 py-1 text-xs"
              as={Link}
              to="/admin/companies/new"
            >
              <Plus size={14} className="mr-1" />
              Nova Empresa
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        {showFilters && (
          <Card className="mb-3 shadow-sm">
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    <option value="ACTIVE">Ativa</option>
                    <option value="INACTIVE">Inativa</option>
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
                      placeholder="Nome, CNPJ, cidade..."
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
                <div className="text-xs text-gray-500">
                  {filteredCompanies.length} empresas encontradas
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 py-0 text-xs"
                    onClick={() => {
                      setStatusFilter(null)
                      setSearchTerm("")
                    }}
                  >
                    Limpar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 px-2 py-0 text-xs"
                  >
                    <Download size={12} className="mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Lista de Empresas */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardHeader className="px-3 py-2 bg-gray-50 flex items-center">
              <Building size={16} className="text-purple-500 mr-2" />
              <h2 className="text-sm font-medium">Lista de Empresas</h2>
            </CardHeader>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Empresa</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">CNPJ</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Localização</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Funcionários</th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-500">Status</th>
                    <th className="px-2 py-1.5 text-right font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5">
                        <div className="font-medium text-gray-900">{company.name}</div>
                      </td>
                      <td className="px-2 py-1.5 text-gray-500">{company.document}</td>
                      <td className="px-2 py-1.5 text-gray-500">
                        <div className="flex items-center">
                          <MapPin size={12} className="text-gray-400 mr-1" />
                          {company.city}, {company.state}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center">
                          <Users size={12} className="text-gray-400 mr-1" />
                          {company.employeeCount}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">{getStatusBadge(company.status)}</td>
                      <td className="px-2 py-1.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                            title="Ver detalhes"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                            title="Excluir"
                            onClick={() => handleDeleteClick(company)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCompanies.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Building size={24} className="mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma empresa encontrada</p>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {/* Modal de Confirmação de Exclusão */}
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          title="Confirmar Exclusão"
          size="sm"
        >
          <div className="p-2">
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir a empresa <span className="font-medium">{selectedCompany?.name}</span>?
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteModal(false)}
              >
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

export default CompanyManagement
