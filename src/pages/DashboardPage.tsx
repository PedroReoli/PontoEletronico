"use client"

import { useAuth } from "@/hooks/useAuth"
import DashboardWidgets from "@/components/dashboard/DashboardWidgets"

const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-heading-1 mb-2">Dashboard</h1>
          <p className="text-body-1 text-gray-600">Bem-vindo, {user?.name}!</p>
        </div>

        <div className="mt-4 md:mt-0 bg-surface px-4 py-2 rounded-md shadow-sm">
          <p className="text-sm text-gray-500">Data atual</p>
          <p className="text-body-1 font-medium">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Widgets do dashboard */}
      <DashboardWidgets />

      {/* Conteúdo adicional do dashboard pode ser adicionado aqui */}
    </div>
  )
}

export default DashboardPage

