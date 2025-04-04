"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import type { User } from "@prisma/client"
import { getUserById } from "@/services/userService"
import UserProfile from "@/components/users/UserProfile"
import { useAuth } from "@/hooks/useAuth"

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar se o usuário tem permissão para editar
  const canEdit =
    authUser?.role === "ADMIN" || (authUser?.role === "MANAGER" && authUser?.companyId === user?.companyId)

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const userData = await getUserById(id)
        setUser(userData)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do usuário")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Detalhes do Usuário</h1>

      <UserProfile userId={id} canEdit={canEdit} />
    </div>
  )
}

export default UserDetailsPage

