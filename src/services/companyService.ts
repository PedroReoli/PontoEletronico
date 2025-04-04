import type { Company } from "@prisma/client"
import { api } from "./api"

interface CompanyCreateDTO {
  name: string
  logoUrl?: string
}

interface CompanyUpdateDTO {
  name?: string
  logoUrl?: string
}

interface CompanyFilters {
  search?: string
  page?: number
  limit?: number
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Obter todas as empresas com filtros e paginação
export const getCompanies = async (filters: CompanyFilters = {}): Promise<PaginatedResponse<Company>> => {
  try {
    const response = await api.get("/companies", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar empresas")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter uma empresa pelo ID
export const getCompanyById = async (id: string): Promise<Company> => {
  try {
    const response = await api.get(`/companies/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar empresa")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Criar uma nova empresa
export const createCompany = async (companyData: CompanyCreateDTO): Promise<Company> => {
  try {
    const response = await api.post("/companies", companyData)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar empresa")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Atualizar uma empresa existente
export const updateCompany = async (id: string, companyData: CompanyUpdateDTO): Promise<Company> => {
  try {
    const response = await api.put(`/companies/${id}`, companyData)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar empresa")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Excluir uma empresa
export const deleteCompany = async (id: string): Promise<void> => {
  try {
    await api.delete(`/companies/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir empresa")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

