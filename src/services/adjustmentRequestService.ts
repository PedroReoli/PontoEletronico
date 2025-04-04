import type { AdjustmentRequest, RequestStatus } from "@prisma/client"
import { api } from "./api"

// Interfaces para criação e atualização
interface AdjustmentRequestCreateDTO {
  date: Date | string
  reason: string
  fileUrl?: string
  file?: File
}

interface AdjustmentRequestUpdateDTO {
  reason?: string
  fileUrl?: string
  file?: File
}

interface AdjustmentRequestReviewDTO {
  status: RequestStatus
  reviewNotes?: string
}

interface AdjustmentRequestFilters {
  userId?: string
  status?: RequestStatus
  startDate?: Date | string
  endDate?: Date | string
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

// Serviços para solicitações de ajuste
export const getAdjustmentRequests = async (
  filters: AdjustmentRequestFilters = {},
): Promise<PaginatedResponse<AdjustmentRequest>> => {
  try {
    const response = await api.get("/adjustment-requests", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar solicitações de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getMyAdjustmentRequests = async (
  filters: Omit<AdjustmentRequestFilters, "userId"> = {},
): Promise<PaginatedResponse<AdjustmentRequest>> => {
  try {
    const response = await api.get("/adjustment-requests/me", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar suas solicitações de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getAdjustmentRequestById = async (id: string): Promise<AdjustmentRequest> => {
  try {
    const response = await api.get(`/adjustment-requests/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar solicitação de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const createAdjustmentRequest = async (data: AdjustmentRequestCreateDTO): Promise<AdjustmentRequest> => {
  try {
    // Se houver um arquivo, criar um FormData
    if (data.file) {
      const formData = new FormData()
      formData.append("date", new Date(data.date).toISOString())
      formData.append("reason", data.reason)
      formData.append("file", data.file)

      const response = await api.post("/adjustment-requests/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } else {
      // Caso contrário, enviar como JSON normal
      const response = await api.post("/adjustment-requests", data)
      return response.data
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar solicitação de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const updateAdjustmentRequest = async (
  id: string,
  data: AdjustmentRequestUpdateDTO,
): Promise<AdjustmentRequest> => {
  try {
    // Se houver um arquivo, criar um FormData
    if (data.file) {
      const formData = new FormData()
      if (data.reason) formData.append("reason", data.reason)
      formData.append("file", data.file)

      const response = await api.put(`/adjustment-requests/${id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } else {
      // Caso contrário, enviar como JSON normal
      const response = await api.put(`/adjustment-requests/${id}`, data)
      return response.data
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar solicitação de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const reviewAdjustmentRequest = async (
  id: string,
  data: AdjustmentRequestReviewDTO,
): Promise<AdjustmentRequest> => {
  try {
    const response = await api.put(`/adjustment-requests/${id}/review`, data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao revisar solicitação de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const deleteAdjustmentRequest = async (id: string): Promise<void> => {
  try {
    await api.delete(`/adjustment-requests/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir solicitação de ajuste")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getPendingAdjustmentRequestsCount = async (): Promise<number> => {
  try {
    const response = await api.get("/adjustment-requests/pending/count")
    return response.data.count
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar contagem de solicitações pendentes")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

