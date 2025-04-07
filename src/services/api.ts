import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",
})

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

