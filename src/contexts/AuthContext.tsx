"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import api from "../services/api"

interface User {
  id: string
  name: string
  email: string
  role: "EMPLOYEE" | "MANAGER" | "ADMIN"
  companyId: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("@ControlePonto:token")

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      api
        .get("/auth/me")
        .then((response) => {
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem("@ControlePonto:token")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("@ControlePonto:token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("@ControlePonto:token")
    api.defaults.headers.common["Authorization"] = ""
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

