"use client"

import { useState, useEffect } from "react"
import { PunchType } from "@prisma/client"
import { createPunchRecord, canRegisterPunchType, getMyLastPunchRecord } from "@/services/punchRecordService"
import { Link } from "react-router-dom"

const PunchClockWidget = () => {
  const [currentStatus, setCurrentStatus] = useState<string>("Carregando...")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Carregar último registro de ponto
  useEffect(() => {
    const loadLastRecord = async () => {
      try {
        const lastRecord = await getMyLastPunchRecord()

        if (!lastRecord) {
          setCurrentStatus("Não iniciado")
          return
        }

        switch (lastRecord.type) {
          case PunchType.ENTRY:
            setCurrentStatus("Trabalhando")
            break
          case PunchType.BREAK_START:
            setCurrentStatus("Em intervalo")
            break
          case PunchType.BREAK_END:
            setCurrentStatus("Trabalhando")
            break
          case PunchType.EXIT:
            setCurrentStatus("Finalizado")
            break
          default:
            setCurrentStatus("Desconhecido")
        }
      } catch (err) {
        console.error("Erro ao carregar último registro:", err)
        setCurrentStatus("Erro")
      }
    }

    loadLastRecord()
  }, [])

  // Registrar um ponto rápido
  const registerQuickPunch = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let punchType: PunchType

      // Determinar o tipo de ponto com base no status atual
      switch (currentStatus) {
        case "Não iniciado":
          punchType = PunchType.ENTRY
          break
        case "Trabalhando":
          punchType = PunchType.BREAK_START
          break
        case "Em intervalo":
          punchType = PunchType.BREAK_END
          break
        case "Finalizado":
          punchType = PunchType.ENTRY
          break
        default:
          throw new Error("Status atual não permite registro de ponto")
      }

      // Verificar se pode registrar este tipo de ponto
      const validation = await canRegisterPunchType(punchType)

      if (!validation.canRegister) {
        setError(validation.message || "Não é possível registrar este tipo de ponto agora")
        return
      }

      // Registrar o ponto
      await createPunchRecord({ type: punchType })

      // Atualizar status
      switch (punchType) {
        case PunchType.ENTRY:
          setCurrentStatus("Trabalhando")
          break
        case PunchType.BREAK_START:
          setCurrentStatus("Em intervalo")
          break
        case PunchType.BREAK_END:
          setCurrentStatus("Trabalhando")
          break
        case PunchType.EXIT:
          setCurrentStatus("Finalizado")
          break
      }

      setSuccess("Ponto registrado com sucesso!")

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Erro ao registrar ponto")
    } finally {
      setIsLoading(false)
    }
  }

  // Obter o texto do botão com base no status atual
  const getButtonText = () => {
    switch (currentStatus) {
      case "Não iniciado":
        return "Iniciar Jornada"
      case "Trabalhando":
        return "Iniciar Intervalo"
      case "Em intervalo":
        return "Retornar do Intervalo"
      case "Finalizado":
        return "Iniciar Nova Jornada"
      default:
        return "Registrar Ponto"
    }
  }

  // Obter a cor do botão com base no status atual
  const getButtonColor = () => {
    switch (currentStatus) {
      case "Não iniciado":
        return "bg-green-500 hover:bg-green-600"
      case "Trabalhando":
        return "bg-amber-500 hover:bg-amber-600"
      case "Em intervalo":
        return "bg-blue-500 hover:bg-blue-600"
      case "Finalizado":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Obter a cor do status atual
  const getStatusColor = () => {
    switch (currentStatus) {
      case "Trabalhando":
        return "text-green-600"
      case "Em intervalo":
        return "text-amber-600"
      case "Finalizado":
        return "text-red-600"
      case "Não iniciado":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="bg-surface p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-heading-4">Ponto Rápido</h3>
        <Link to="/punch" className="text-primary hover:underline text-sm">
          Ver completo
        </Link>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-body-2 mr-2">Status:</span>
        <span className={`text-body-2 font-semibold ${getStatusColor()}`}>{currentStatus}</span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <button
        onClick={registerQuickPunch}
        disabled={isLoading || currentStatus === "Carregando..."}
        className={`${getButtonColor()} text-white py-2 px-4 rounded-md transition-colors w-full flex items-center justify-center ${
          isLoading || currentStatus === "Carregando..." ? "opacity-50 cursor-not-allowed" : ""
        }`}
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
            Registrando...
          </span>
        ) : (
          getButtonText()
        )}
      </button>

      <div className="text-center mt-3 text-xs text-gray-500">
        {new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    </div>
  )
}

export default PunchClockWidget

