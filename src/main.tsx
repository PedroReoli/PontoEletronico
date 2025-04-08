import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { AuthProvider } from "./contexts/AuthContext"
import "./styles/variables.css"
import "./styles/globals.css"

// css reutilizaveis abaixo
import "./styles/passageiro.css"
import "./styles/passageiro2.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

