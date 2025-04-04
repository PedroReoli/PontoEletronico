import type { User } from "@/types/database"
import { api } from "./api"

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao fazer login")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/register", { name, email, password })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao registrar")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await api.post("/api/auth/logout", { refreshToken })
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
  }
}

export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post("/api/auth/refresh-token", { refreshToken })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao renovar token")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post("/api/auth/forgot-password", { email })
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao solicitar recuperação de senha")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

export const resetPassword = async (token: string, password: string): Promise<void> => {
  try {
    await api.post("/api/auth/reset-password", { token, password })
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Falha ao redefinir senha")
    }
    throw new Error("Erro de conexão. Verifique sua internet.")
  }
}

