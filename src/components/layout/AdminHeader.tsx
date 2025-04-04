"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const AdminHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Função para fazer logout
  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Logo para mobile */}
        <div className="md:hidden">
          <Link to="/" className="text-heading-4 font-bold text-primary">
            Ponto Eletrônico
          </Link>
        </div>

        {/* Botão do menu mobile */}
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Espaço vazio para centralizar */}
        <div className="hidden md:block flex-1"></div>

        {/* Menu do usuário */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium">{user?.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Menu dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileMenu(false)}
              >
                Meu Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <nav className="space-y-1 px-2">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/punch"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Registrar Ponto
            </Link>
            <Link
              to="/schedule/shifts"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Meus Plantões
            </Link>
            <Link
              to="/adjustments/request"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Solicitar Ajuste
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setShowMobileMenu(false)}
            >
              Meu Perfil
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default AdminHeader

