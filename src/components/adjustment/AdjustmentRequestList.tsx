"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type AdjustmentRequest, RequestStatus, type User } from "@prisma/client"
import {
  getAdjustmentRequests,
  getMyAdjustmentRequests,
  reviewAdjustmentRequest,
  deleteAdjustmentRequest,
} from "@/services/adjustmentRequestService"
import { getUserById } from "@/services/userService"
import { useAuth } from "@/hooks/useAuth"
import ConfirmationModal from "@/components/common/ConfirmationModal"

interface AdjustmentRequestListProps {
  showAll?: boolean // Se true, mostra todas as solicitações (para admin/gerente)
  status?: RequestStatus // Filtrar por status
  onStatusChange?: () => void
}

interface AdjustmentRequestWithUser extends AdjustmentRequest {
  user?: User
  reviewedByUser?: User
}

const AdjustmentRequestList = ({ showAll = false, status, onStatusChange }: AdjustmentRequestListProps) => {
  const { user: authUser } = useAuth()
  const [requests, setRequests] = useState<AdjustmentRequestWithUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Estado para o modal de revisão
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)
  const [selectedRequest, setSelectedRequest] = useState<AdjustmentRequestWithUser | null>(null)
  const [reviewStatus, setReviewStatus] = useState<RequestStatus>(RequestStatus.APPROVED)
  const [reviewNotes, setReviewNotes] = useState<string>("")

  // Estado para o modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [requestToDelete, setRequestToDelete] = useState<AdjustmentRequest | null>(null)

  // Carregar solicitações
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const filters = {
          status: status,
          page: currentPage,
          limit: 10,
        }

        let response
        if (showAll) {
          response = await getAdjustmentRequests(filters)
        } else {
          response = await getMyAdjustmentRequests(filters)
        }

        // Adicionar informações do usuário a cada solicitação
        const requestsWithUser = await Promise.all(
          response.data.map(async (request) => {
            try {
              // Buscar informações do usuário que fez a solicitação
              const user = await getUserById(request.userId)

              // Se houver um revisor, buscar suas informações também
              let reviewedByUser
              if (request.reviewedBy) {
                reviewedByUser = await getUserById(request.reviewedBy)
              }

              return { ...request, user, reviewedByUser }
            } catch (err) {
              console.error("Erro ao buscar usuário:", err)
              return request
            }
          }),
        )

        setRequests(requestsWithUser)
        setTotalPages(response.totalPages)
      } catch (err: any) {
        setError(err.message || "Erro ao carregar solicitações de ajuste")
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [showAll, status, currentPage])

  // Formatar data para exibição
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  // Formatar status para exibição
  const formatStatus = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return "Pendente"
      case RequestStatus.APPROVED:
        return "Aprovado"
      case RequestStatus.REJECTED:
        return "Rejeitado"
      default:
        return status
    }
  }

  // Obter cor do status
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      case RequestStatus.APPROVED:
        return "bg-green-100 text-green-800"
      case RequestStatus.REJECTED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Abrir modal de revisão
  const openReviewModal = (request: AdjustmentRequestWithUser) => {
    setSelectedRequest(request)
    setReviewStatus(RequestStatus.APPROVED)
    setReviewNotes("")
    setShowReviewModal(true)
  }

  // Enviar revisão
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRequest) return

    setIsLoading(true)
    setError(null)

    try {
      await reviewAdjustmentRequest(selectedRequest.id, {
        status: reviewStatus,
        reviewNotes,
      })

      // Atualizar estado local
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: reviewStatus,
                reviewNotes,
                reviewedBy: authUser?.id,
                reviewedAt: new Date(),
                reviewedByUser: authUser,
              }
            : req,
        ),
      )

      setSuccess(`Solicitação ${reviewStatus === RequestStatus.APPROVED ? "aprovada" : "rejeitada"} com sucesso!`)
      setShowReviewModal(false)

      // Notificar componente pai
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao revisar solicitação")
    } finally {
      setIsLoading(false)
    }
  }

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return

    setIsLoading(true)
    setError(null)

    try {
      await deleteAdjustmentRequest(requestToDelete.id)

      // Remover do estado local
      setRequests(requests.filter((req) => req.id !== requestToDelete.id))

      setSuccess("Solicitação excluída com sucesso!")
      setShowDeleteModal(false)
      setRequestToDelete(null)

      // Notificar componente pai
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao excluir solicitação")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-2 mb-6">{showAll ? "Solicitações de Ajuste" : "Minhas Solicitações de Ajuste"}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{success}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhuma solicitação de ajuste encontrada.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showAll && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Funcionário
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anexo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id}>
                    {showAll && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.user?.name || "Usuário não encontrado"}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(request.date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{request.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.fileUrl ? (
                        <a
                          href={request.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                        >
                          Ver anexo
                        </a>
                      ) : (
                        <span className="text-gray-400">Sem anexo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Ações para administradores/gerentes */}
                      {showAll && request.status === RequestStatus.PENDING && (
                        <button
                          onClick={() => openReviewModal(request)}
                          className="text-primary hover:text-primary-dark mr-3"
                        >
                          Revisar
                        </button>
                      )}

                      {/* Ações para o próprio usuário */}
                      {!showAll && request.status === RequestStatus.PENDING && (
                        <button
                          onClick={() => {
                            setRequestToDelete(request)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      )}

                      {/* Detalhes para solicitações já revisadas */}
                      {request.status !== RequestStatus.PENDING && request.reviewedBy && (
                        <span className="text-sm text-gray-500">
                          {request.status === RequestStatus.APPROVED ? "Aprovado" : "Rejeitado"} por{" "}
                          {request.reviewedByUser?.name || "Usuário"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de revisão */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-heading-3 mb-4">Revisar Solicitação de Ajuste</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Funcionário</p>
                <p className="text-body-1">{selectedRequest.user?.name || "Usuário não encontrado"}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Data</p>
                <p className="text-body-1">{formatDate(selectedRequest.date)}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Motivo</p>
                <p className="text-body-1">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.fileUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Anexo</p>
                  <a
                    href={selectedRequest.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark"
                  >
                    Ver anexo
                  </a>
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-body-2 font-medium mb-1">Decisão</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value={RequestStatus.APPROVED}
                        checked={reviewStatus === RequestStatus.APPROVED}
                        onChange={() => setReviewStatus(RequestStatus.APPROVED)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-body-2">Aprovar</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value={RequestStatus.REJECTED}
                        checked={reviewStatus === RequestStatus.REJECTED}
                        onChange={() => setReviewStatus(RequestStatus.REJECTED)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <span className="ml-2 text-body-2">Rejeitar</span>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="reviewNotes" className="block text-body-2 font-medium mb-1">
                    Observações
                  </label>
                  <textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-md transition-colors ${
                      reviewStatus === RequestStatus.APPROVED
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : reviewStatus === RequestStatus.APPROVED ? "Aprovar" : "Rejeitar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && requestToDelete && (
        <ConfirmationModal
          title="Excluir Solicitação"
          message="Tem certeza que deseja excluir esta solicitação de ajuste? Esta ação não pode ser desfeita."
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          confirmButtonClass="bg-red-600 hover:bg-red-800"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false)
            setRequestToDelete(null)
          }}
        />
      )}
    </div>
  )
}

export default AdjustmentRequestList

