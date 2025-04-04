import type { User } from "@prisma/client"

interface StoredUser {
  user: User
  accessToken: string
  refreshToken: string
}

// Chave para armazenar os dados do usuário no localStorage
const USER_STORAGE_KEY = "@ponto-eletronico:user"

// Função para obter os dados do usuário armazenados
export const getStoredUser = (): StoredUser | null => {
  const storedData = localStorage.getItem(USER_STORAGE_KEY)

  if (!storedData) {
    return null
  }

  try {
    return JSON.parse(storedData)
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

// Função para armazenar os dados do usuário
export const setStoredUser = (data: StoredUser): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data))
}

// Função para remover os dados do usuário
export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY)
}

