import type { Shift, ShiftType } from "@prisma/client"
import { api } from "./api"

// Interfaces para criação e atualização
interface ShiftCreateDTO {
  userId: string
  date: Date | string
  shiftType: ShiftType
  startTime: string
  endTime: string
  notes?: string
}

interface ShiftUpdateDTO {
  date?: Date | string
  shiftType?: ShiftType
  startTime?: string
  endTime?: string
  notes?: string
}

interface ShiftFilters {
  userId?: string
  startDate?: Date | string
  endDate?: Date | string
  shiftType?: ShiftType
}

// Serviços para plantões
export const getShifts = async (filters: ShiftFilters = {}): Promise<Shift[]> => {
  try {
    const response = await api.get("/shifts", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar plantões")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getShiftById = async (id: string): Promise<Shift> => {
  try {
    const response = await api.get(`/shifts/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar plantão")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const createShift = async (data: ShiftCreateDTO): Promise<Shift> => {
  try {
    const response = await api.post("/shifts", data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar plantão")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const updateShift = async (id: string, data: ShiftUpdateDTO): Promise<Shift> => {
  try {
    const response = await api.put(`/shifts/${id}`, data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar plantão")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const deleteShift = async (id: string): Promise<void> => {
  try {
    await api.delete(`/shifts/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir plantão")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const createBulkShifts = async (shifts: ShiftCreateDTO[]): Promise<Shift[]> => {
  try {
    const response = await api.post("/shifts/bulk", { shifts })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar plantões em massa")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getUserShiftsForMonth = async (userId: string, year: number, month: number): Promise<Shift[]> => {
  try {
    const response = await api.get(`/shifts/user/${userId}/month/${year}/${month}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar plantões do mês")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getShiftsByDateRange = async (startDate: Date | string, endDate: Date | string): Promise<Shift[]> => {
  try {
    const response = await api.get("/shifts/range", {
      params: { startDate, endDate },
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar plantões por período")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

