"use client"

import { useState } from "react"
import { RequestStatus } from "@prisma/client"
import AdjustmentRequestList from "@/components/adjustment/AdjustmentRequestList"

const PendingAdjustmentsPage = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Função para forçar atualização da lista após revisar uma solicitação
  const handleStatusChange = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Solicitações de Ajuste Pendentes</h1>

      <AdjustmentRequestList
        key={`list-${refreshKey}`}
        showAll={true}
        status={RequestStatus.PENDING}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export default PendingAdjustmentsPage

