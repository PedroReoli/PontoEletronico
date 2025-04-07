"use client"

import { useState, useEffect } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [geolocation, setGeolocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocation((prev) => ({
        ...prev,
        error: "Geolocalização não é suportada pelo seu navegador",
        loading: false,
      }))
      return
    }

    const success = (position: GeolocationPosition) => {
      setGeolocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      })
    }

    const error = (error: GeolocationPositionError) => {
      setGeolocation((prev) => ({
        ...prev,
        error: getGeolocationErrorMessage(error),
        loading: false,
      }))
    }

    // Opções de geolocalização
    const options = {
      enableHighAccuracy: true, // Alta precisão
      timeout: 10000, // 10 segundos
      maximumAge: 0, // Não usar cache
    }

    // Iniciar a obtenção da localização
    const watchId = navigator.geolocation.watchPosition(success, error, options)

    // Limpar o watch quando o componente for desmontado
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return geolocation
}

// Função auxiliar para obter mensagens de erro mais amigáveis
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permissão para acessar a localização foi negada"
    case error.POSITION_UNAVAILABLE:
      return "Informação de localização não está disponível"
    case error.TIMEOUT:
      return "Tempo limite para obter a localização foi excedido"
    default:
      return "Ocorreu um erro desconhecido ao obter a localização"
  }
}

