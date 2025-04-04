import type { ScheduleGroup, CustomSchedule } from "@prisma/client"
import { api } from "./api"

// Interfaces para criação e atualização
interface ScheduleGroupCreateDTO {
  name: string
  entryTime: string
  exitTime: string
  breakDuration: number
  companyId: string
}

interface ScheduleGroupUpdateDTO {
  name?: string
  entryTime?: string
  exitTime?: string
  breakDuration?: number
}

interface CustomScheduleCreateDTO {
  userId: string
  entryTime: string
  exitTime: string
  breakDuration: number
}

interface CustomScheduleUpdateDTO {
  entryTime?: string
  exitTime?: string
  breakDuration?: number
}

// Serviços para grupos de jornada
export const getScheduleGroups = async (companyId?: string): Promise<ScheduleGroup[]> => {
  try {
    const response = await api.get("/schedule-groups", {
      params: { companyId },
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar grupos de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const getScheduleGroupById = async (id: string): Promise<ScheduleGroup> => {
  try {
    const response = await api.get(`/schedule-groups/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar grupo de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const createScheduleGroup = async (data: ScheduleGroupCreateDTO): Promise<ScheduleGroup> => {
  try {
    const response = await api.post("/schedule-groups", data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar grupo de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const updateScheduleGroup = async (id: string, data: ScheduleGroupUpdateDTO): Promise<ScheduleGroup> => {
  try {
    const response = await api.put(`/schedule-groups/${id}`, data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar grupo de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const deleteScheduleGroup = async (id: string): Promise<void> => {
  try {
    await api.delete(`/schedule-groups/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir grupo de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const assignUsersToScheduleGroup = async (groupId: string, userIds: string[]): Promise<void> => {
  try {
    await api.post(`/schedule-groups/${groupId}/assign-users`, { userIds })
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atribuir usuários ao grupo")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Serviços para jornadas personalizadas
export const getCustomScheduleByUserId = async (userId: string): Promise<CustomSchedule | null> => {
  try {
    const response = await api.get(`/custom-schedules/user/${userId}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null
    }
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar jornada personalizada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const createCustomSchedule = async (data: CustomScheduleCreateDTO): Promise<CustomSchedule> => {
  try {
    const response = await api.post("/custom-schedules", data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar jornada personalizada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const updateCustomSchedule = async (id: string, data: CustomScheduleUpdateDTO): Promise<CustomSchedule> => {
  try {
    const response = await api.put(`/custom-schedules/${id}`, data)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar jornada personalizada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const deleteCustomSchedule = async (id: string): Promise<void> => {
  try {
    await api.delete(`/custom-schedules/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir jornada personalizada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

