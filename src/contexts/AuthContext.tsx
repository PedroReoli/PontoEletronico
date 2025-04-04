"use client"

import type React from "react"
import { createContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import type { User } from "@prisma/client"
import { login, register, logout, refreshAccessToken, forgotPassword, resetPassword } from "@/services/authService"
import { getStoredUser, setStoredUser, removeStoredUser } from "@/utils/storage"
import { isTokenExpired } from "@/utils/jwt"

// Tempo de inatividade em milissegundos (15 minutos)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const navigate = useNavigate()

  // Função para atualizar o timestamp da última atividade
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  // Verificar se o token está expirado e tentar renovar
  const checkAndRefreshToken = useCallback(async () => {
    const storedUser = getStoredUser()

    if (!storedUser) {
      setUser(null)
      setIsLoading(false)
      return
    }

    if (isTokenExpired(storedUser.accessToken)) {
      try {
        const refreshedData = await refreshAccessToken(storedUser.refreshToken)
        setStoredUser({
          ...storedUser,
          accessToken: refreshedData.accessToken,
          refreshToken: refreshedData.refreshToken,
        })
        setUser(refreshedData.user)
      } catch (err) {
        // Se não conseguir renovar o token, fazer logout
        removeStoredUser()
        setUser(null)
        navigate("/login")
      }
    } else {
      setUser(storedUser.user)
    }

    setIsLoading(false)
  }, [navigate])

  // Verificar inatividade
  useEffect(() => {
    const checkInactivity = () => {
      if (user && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        handleLogout()
        setError("Sua sessão expirou por inatividade.")
        navigate("/login")
      }
    }

    const intervalId = setInterval(checkInactivity, 60000) // Verificar a cada minuto

    return () => clearInterval(intervalId)
  }, [user, lastActivity, navigate])

  // Monitorar atividade do usuário
  useEffect(() => {
    const events = ["mousedown", "keypress", "scroll", "touchstart"]

    const handleActivity = () => {
      updateActivity()
    }

    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [updateActivity])

  // Verificar autenticação ao iniciar
  useEffect(() => {
    checkAndRefreshToken()
  }, [checkAndRefreshToken])

  // Função de login
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await login(email, password)
      setUser(data.user)
      setStoredUser({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      updateActivity()
    } catch (err: any) {
      setError(err.message || "Falha ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  // Função de registro
  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await register(name, email, password)
      setUser(data.user)
      setStoredUser({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      updateActivity()
    } catch (err: any) {
      setError(err.message || "Falha ao registrar")
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      const storedUser = getStoredUser()
      if (storedUser) {
        await logout(storedUser.refreshToken)
      }
      removeStoredUser()
      setUser(null)
    } catch (err) {
      console.error("Erro ao fazer logout:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para recuperação de senha
  const handleForgotPassword = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await forgotPassword(email)
    } catch (err: any) {
      setError(err.message || "Falha ao solicitar recuperação de senha")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para redefinir senha
  const handleResetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await resetPassword(token, password)
    } catch (err: any) {
      setError(err.message || "Falha ao redefinir senha")
    } finally {
      setIsLoading(false)
    }
  }

  // Limpar mensagens de erro
  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

