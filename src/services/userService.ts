import type { User, UserRole } from "@prisma/client"
import { api } from "./api"

interface UserCreateDTO {
  name: string
  email: string
  password: string
  role: UserRole
  companyId: string
  scheduleGroupId?: string
  active?: boolean
}

interface UserUpdateDTO {
  name?: string
  email?: string
  role?: UserRole
  companyId?: string
  scheduleGroupId?: string
  active?: boolean
}

interface UserFilters {
  companyId?: string
  role?: UserRole
  active?: boolean
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

// Obter todos os usuários com filtros e paginação
export const getUsers = async (filters: UserFilters = {}): Promise<PaginatedResponse<User>> => {
  try {
    const response = await api.get("/users", { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar usuários")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter um usuário pelo ID
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar usuário")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Criar um novo usuário
export const createUser = async (userData: UserCreateDTO): Promise<User> => {
  try {
    const response = await api.post("/users", userData)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao criar usuário")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Atualizar um usuário existente
export const updateUser = async (id: string, userData: UserUpdateDTO): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao atualizar usuário")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Alterar senha de um usuário
export const changeUserPassword = async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.put(`/users/${id}/change-password`, { currentPassword, newPassword })
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao alterar senha")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Desativar um usuário
export const deactivateUser = async (id: string): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}/deactivate`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao desativar usuário")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Ativar um usuário
export const activateUser = async (id: string): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}/activate`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao ativar usuário")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Excluir um usuário
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}`)
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao excluir usuário")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

// Obter usuários por empresa
export const getUsersByCompany = async (
  companyId: string,
  filters: Omit<UserFilters, "companyId"> = {},
): Promise<PaginatedResponse<User>> => {
  try {
    const response = await api.get(`/companies/${companyId}/users`, { params: filters })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao buscar usuários da empresa")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

