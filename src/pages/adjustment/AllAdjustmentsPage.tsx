"use client"

import { useState } from "react"
import { RequestStatus } from "@prisma/client"
import AdjustmentRequestList from "@/components/adjustment/AdjustmentRequestList"

const AllAdjustmentsPage = () => {
  const [activeStatus, setActiveStatus] = useState<RequestStatus | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Função para forçar atualização da lista após revisar uma solicitação
  const handleStatusChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Todas as Solicitações de Ajuste</h1>

      {/* Filtros de status */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveStatus(null)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeStatus === null
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveStatus(RequestStatus.PENDING)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeStatus === RequestStatus.PENDING
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setActiveStatus(RequestStatus.APPROVED)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeStatus === RequestStatus.APPROVED
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Aprovadas
            </button>
            <button
              onClick={() => setActiveStatus(RequestStatus.REJECTED)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeStatus === RequestStatus.REJECTED
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rejeitadas
            </button>
          </nav>
        </div>
      </div>

      <AdjustmentRequestList
        key={`list-${refreshKey}-${activeStatus || "all"}`}
        showAll={true}
        status={activeStatus || undefined}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export default AllAdjustmentsPage

