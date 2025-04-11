"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./Button"

interface CameraProps {
  onCapture: (imageSrc: string) => void
  onCancel: () => void
}

export default function Camera({ onCapture, onCancel }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Iniciar a câmera quando o componente montar
  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        })
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error("Erro ao acessar a câmera:", err)
        setError("Não foi possível acessar a câmera. Verifique as permissões.")
      } finally {
        setIsLoading(false)
      }
    }

    startCamera()

    // Limpar o stream quando o componente desmontar
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Capturar foto
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Definir as dimensões do canvas para corresponder ao vídeo
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Desenhar o frame atual do vídeo no canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Converter o canvas para uma URL de dados (base64)
        const imageSrc = canvas.toDataURL("image/jpeg")
        onCapture(imageSrc)

        // Parar o stream da câmera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }

  return (
    <div className="camera-container">
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Iniciando câmera...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          <p className="font-medium">Erro</p>
          <p>{error}</p>
          <Button variant="secondary" onClick={onCancel} className="mt-4">
            Voltar
          </Button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="relative overflow-hidden rounded-lg mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg"
              onLoadedMetadata={() => setIsLoading(false)}
            />
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={capturePhoto}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Capturar
            </Button>
          </div>

          {/* Canvas oculto para capturar a imagem */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}
    </div>
  )
}
