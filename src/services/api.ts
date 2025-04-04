import axios from "axios"
import { getStoredUser, setStoredUser, removeStoredUser } from "@/utils/storage"
import { refreshAccessToken } from "./authService"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Permite enviar cookies com as requisições
})

// Interceptor para adicionar o token de acesso às requisições
api.interceptors.request.use(
  (config) => {
    const storedUser = getStoredUser()
    if (storedUser?.accessToken) {
      config.headers.Authorization = `Bearer ${storedUser.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para lidar com erros de token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh-token") {
      originalRequest._retry = true

      try {
        const storedUser = getStoredUser()

        if (!storedUser?.refreshToken) {
          // Se não houver refresh token, fazer logout
          removeStoredUser()
          window.location.href = "/login"
          return Promise.reject(error)
        }

        // Tentar renovar o token
        const data = await refreshAccessToken(storedUser.refreshToken)

        // Atualizar os tokens armazenados
        setStoredUser({
          ...storedUser,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })

        // Atualizar o token na requisição original e tentar novamente
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Se falhar ao renovar o token, fazer logout
        removeStoredUser()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

