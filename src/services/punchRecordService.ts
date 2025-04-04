import type { PunchRecord, PunchType } from "@prisma/client"
import { api } from "./api"

interface CreatePunchRecordDTO {
  type: PunchType
  latitude?: number
  longitude?: number
  deviceInfo?: string
}

interface PunchRecordFilters {
  startDate?: Date | string
  endDate?: Date | string
  type?: PunchType
  userId?: string
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

// Obter registros de ponto com filtros e paginação
export const getPunchRecords = async (filters: PunchRecordFilters = {}): Promise<PaginatedResponse<PunchRecord>> => {
  try {
    const response = await api.get("/punch-records", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar registros de ponto")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter registros de ponto do usuário atual
export const getMyPunchRecords = async (
  filters: Omit<PunchRecordFilters, "userId"> = {},
): Promise<PaginatedResponse<PunchRecord>> => {
  try {
    const response = await api.get("/punch-records/me", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar seus registros de ponto")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter registros de ponto do dia atual do usuário
export const getMyTodayPunchRecords = async (): Promise<PunchRecord[]> => {
  try {
    const response = await api.get("/punch-records/me/today")
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar registros de ponto de hoje")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter último registro de ponto do usuário
export const getMyLastPunchRecord = async (): Promise<PunchRecord | null> => {
  try {
    const response = await api.get("/punch-records/me/last")
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar último registro de ponto")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Criar um novo registro de ponto
export const createPunchRecord = async (data: CreatePunchRecordDTO): Promise<PunchRecord> => {
  try {
    const response = await api.post("/punch-records", data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao registrar ponto")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Verificar se o usuário pode registrar um determinado tipo de ponto
export const canRegisterPunchType = async (type: PunchType): Promise<{ canRegister: boolean; message?: string }> => {
  try {
    const response = await api.get(`/punch-records/validate/${type}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      return {
        canRegister: false,
        message: error.response.data.message || "Não é possível registrar este tipo de ponto agora",
      }
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

