"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import ScheduleConfigurator from "@/components/schedule/ScheduleConfigurator"
import ShiftGroupEditor from "@/components/schedule/ShiftGroupEditor"

const ScheduleConfigPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"schedules" | "shifts">("schedules")
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Função para forçar atualização dos componentes
  const handleScheduleGroupChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Configuração de Jornadas e Plantões</h1>

      {/* Tabs para alternar entre configurações */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("schedules")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "schedules"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Grupos de Jornada
            </button>
            <button
              onClick={() => setActiveTab("shifts")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "shifts"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Grupos de Plantão
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo da tab ativa */}
      {activeTab === "schedules" ? (
        <ScheduleConfigurator
          key={`schedules-${refreshKey}`}
          companyId={user?.role === "ADMIN" ? undefined : user?.companyId}
          onScheduleGroupChange={handleScheduleGroupChange}
        />
      ) : (
        <ShiftGroupEditor
          key={`shifts-${refreshKey}`}
          companyId={user?.role === "ADMIN" ? undefined : user?.companyId}
          onShiftsCreated={handleScheduleGroupChange}
        />
      )}
    </div>
  )
}

export default ScheduleConfigPage

