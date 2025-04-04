import { api } from "./api"
import type { User } from "@prisma/client"

interface ReportFilters {
  userId?: string
  companyId?: string
  startDate?: Date | string
  endDate?: Date | string
  type?: string
}

interface ReportData {
  id: string
  pdfUrl: string
  startDate: Date
  endDate: Date
  type: string
  createdAt: Date
  userId: string
  user?: User
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Obter relatórios com filtros e paginação
export const getReports = async (filters: ReportFilters = {}): Promise<PaginatedResponse<ReportData>> => {
  try {
    const response = await api.get("/reports", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar relatórios")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter um relatório pelo ID
export const getReportById = async (id: string): Promise<ReportData> => {
  try {
    const response = await api.get(`/reports/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar relatório")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Gerar um novo relatório
export const generateReport = async (data: {
  userId?: string
  startDate: Date | string
  endDate: Date | string
  type: string
}): Promise<ReportData> => {
  try {
    const response = await api.post("/reports/generate", data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao gerar relatório")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Excluir um relatório
export const deleteReport = async (id: string): Promise<void> => {
  try {
    await api.delete(`/reports/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir relatório")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Configurar geração automática de relatórios
export const configureAutomaticReports = async (data: {
  companyId: string
  enabled: boolean
  frequency: "daily" | "weekly" | "monthly"
  emailRecipients: string[]
}): Promise<void> => {
  try {
    await api.post("/reports/configure-automatic", data)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao configurar relatórios automáticos")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

