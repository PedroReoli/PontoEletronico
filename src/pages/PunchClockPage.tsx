"use client"

import { useEffect, useState } from "react"
import PunchClock from "@/components/punch/PunchClock"
import { useAuth } from "@/hooks/useAuth"
import { getUserById } from "@/services/userService"
import { getScheduleGroupById } from "@/services/scheduleGroupService"
import type { User, ScheduleGroup } from "@prisma/client"

const PunchClockPage = () => {
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [scheduleGroup, setScheduleGroup] = useState<ScheduleGroup | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser?.id) return

      setIsLoading(true)
      setError(null)

      try {
        // Carregar dados completos do usuário
        const userData = await getUserById(authUser.id)
        setUser(userData)

        // Carregar grupo de jornada se existir
        if (userData.scheduleGroupId) {
          try {
            const groupData = await getScheduleGroupById(userData.scheduleGroupId)
            setScheduleGroup(groupData)
          } catch (err) {
            console.error("Erro ao carregar grupo de jornada:", err)
          }
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do usuário")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [authUser?.id])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Registro de Ponto</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Informações da jornada */}
          {scheduleGroup && (
            <div className="bg-surface p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-heading-3 mb-4">Sua Jornada de Trabalho</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Grupo</p>
                  <p className="text-body-1 font-medium">{scheduleGroup.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horário</p>
                  <p className="text-body-1 font-medium">
                    {scheduleGroup.entryTime} - {scheduleGroup.exitTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intervalo</p>
                  <p className="text-body-1 font-medium">{scheduleGroup.breakDuration} minutos</p>
                </div>
              </div>
            </div>
          )}

          {/* Componente de registro de ponto */}
          <PunchClock />
        </>
      )}
    </div>
  )
}

export default PunchClockPage

