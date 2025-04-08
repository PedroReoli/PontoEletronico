import axios from "axios"

// Criar uma instância do axios com a URL base
const api = axios.create({
  // Usar type assertion para acessar a variável de ambiente
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3333") + "/api",
})

// Adicionar interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("@ControlePonto:token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default api
