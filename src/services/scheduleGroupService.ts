import type { ScheduleGroup } from "@prisma/client"
import { api } from "./api"

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

// Obter todos os grupos de jornada por empresa
export const getScheduleGroupsByCompany = async (companyId: string): Promise<ScheduleGroup[]> => {
  try {
    const response = await api.get(`/companies/${companyId}/schedule-groups`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar grupos de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter um grupo de jornada pelo ID
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

// Criar um novo grupo de jornada
export const createScheduleGroup = async (scheduleGroupData: ScheduleGroupCreateDTO): Promise<ScheduleGroup> => {
  try {
    const response = await api.post("/schedule-groups", scheduleGroupData)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar grupo de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Atualizar um grupo de jornada existente
export const updateScheduleGroup = async (
  id: string,
  scheduleGroupData: ScheduleGroupUpdateDTO,
): Promise<ScheduleGroup> => {
  try {
    const response = await api.put(`/schedule-groups/${id}`, scheduleGroupData)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar grupo de jornada")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Excluir um grupo de jornada
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

