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
import "./styles/profile.css"
import "./styles/settings.css"
import "./styles/profile.css"
import "./styles/components/alert.css"
import "./styles/components/button.css"
import "./styles/components/select.css"
import "./styles/components/badge.css"
import "./styles/components/avatar.css"
import "./styles/components/card.css"
import "./styles/components/input.css"
import "./styles/components/modal.css"


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

