"use client"

import { useState } from "react"
import AdjustmentRequestForm from "@/components/adjustment/AdjustmentRequestForm"
import AdjustmentRequestList from "@/components/adjustment/AdjustmentRequestList"

const AdjustmentRequestPage = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Função para forçar atualização da lista após criar uma solicitação
  const handleRequestCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Solicitações de Ajuste</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AdjustmentRequestForm onRequestCreated={handleRequestCreated} />
        </div>

        <div className="lg:col-span-2">
          <AdjustmentRequestList key={`list-${refreshKey}`} />
        </div>
      </div>
    </div>
  )
}

export default AdjustmentRequestPage

