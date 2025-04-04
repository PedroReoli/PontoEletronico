"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import ShiftDragDropBoard from "@/components/schedule/ShiftDragDropBoard"

const ShiftBoardPage = () => {
  const { user } = useAuth()
  const currentDate = new Date()
  const [month, setMonth] = useState<number>(currentDate.getMonth())
  const [year, setYear] = useState<number>(currentDate.getFullYear())
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Função para forçar atualização dos componentes
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-heading-1 mb-2 md:mb-0">Quadro de Plantões</h1>

        <button
          onClick={handleRefresh}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar
        </button>
      </div>

      <ShiftDragDropBoard
        key={`board-${refreshKey}`}
        companyId={user?.role === "ADMIN" ? undefined : user?.companyId}
        month={month}
        year={year}
      />
    </div>
  )
}

export default ShiftBoardPage

