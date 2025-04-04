"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getPendingAdjustmentRequestsCount } from "@/services/adjustmentRequestService"

interface PendingAdjustmentsWidgetProps {
  onlyCount?: boolean
}

const PendingAdjustmentsWidget = ({ onlyCount = false }: PendingAdjustmentsWidgetProps) => {
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar contagem de solicitações pendentes
  useEffect(() => {
    const loadPendingCount = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const count = await getPendingAdjustmentRequestsCount()
        setPendingCount(count)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar contagem de solicitações pendentes")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPendingCount()

    // Atualizar a cada 5 minutos
    const intervalId = setInterval(loadPendingCount, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  if (onlyCount) {
    return (
      <div className="relative">
        <Link to="/adjustments/pending" className="text-primary hover:text-primary-dark">
          Ajustes
        </Link>
        {pendingCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface p-4 rounded-lg shadow-md">
      <h3 className="text-heading-4 mb-4">Solicitações Pendentes</h3>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : (
        <div className="text-center">
          <div className="text-heading-2 font-bold text-primary">{pendingCount}</div>
          <p className="text-body-2 text-gray-500">
            {pendingCount === 0
              ? "Nenhuma solicitação pendente"
              : pendingCount === 1
                ? "Solicitação pendente"
                : "Solicitações pendentes"}
          </p>

          {pendingCount > 0 && (
            <Link
              to="/adjustments/pending"
              className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Revisar Solicitações
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default PendingAdjustmentsWidget

