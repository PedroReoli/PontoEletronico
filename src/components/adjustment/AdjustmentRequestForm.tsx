"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createAdjustmentRequest } from "@/services/adjustmentRequestService"

interface AdjustmentRequestFormProps {
  onRequestCreated?: () => void
}

const AdjustmentRequestForm = ({ onRequestCreated }: AdjustmentRequestFormProps) => {
  const [date, setDate] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lidar com seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // Limpar formulário
  const resetForm = () => {
    setDate("")
    setReason("")
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Enviar solicitação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await createAdjustmentRequest({
        date: new Date(date),
        reason,
        file: file || undefined,
      })

      setSuccess("Solicitação de ajuste enviada com sucesso!")
      resetForm()

      // Notificar componente pai
      if (onRequestCreated) {
        onRequestCreated()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao enviar solicitação de ajuste")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md">
      <h2 className="text-heading-2 mb-6">Solicitar Ajuste de Ponto</h2>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-body-2 font-medium mb-1">
            Data do Ajuste
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="reason" className="block text-body-2 font-medium mb-1">
            Motivo do Ajuste
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-body-2 font-medium mb-1">
            Anexo (opcional)
          </label>
          <div className="flex items-center">
            <input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Escolher Arquivo
            </button>
            <span className="ml-3 text-sm text-gray-500">{file ? file.name : "Nenhum arquivo selecionado"}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, JPG, PNG, DOC, DOCX. Tamanho máximo: 5MB.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar Solicitação"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdjustmentRequestForm

