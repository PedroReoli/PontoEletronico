import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  exp: number
  [key: string]: any
}

// Verifica se um token JWT está expirado
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    return decoded.exp < currentTime
  } catch {
    // Se não conseguir decodificar o token, considera como expirado
    return true
  }
}

// Obtém o tempo restante de um token em segundos
export const getTokenRemainingTime = (token: string): number => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000

    return Math.max(0, decoded.exp - currentTime)
  } catch {
    return 0
  }
}

