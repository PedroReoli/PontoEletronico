"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import PendingAdjustmentsWidget from "@/components/adjustment/PendingAdjustmentsWidget"

const AdminSidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  // Verificar se o caminho atual corresponde ao link
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  // Verificar se o usuário é admin ou gerente
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER"

  return (
    <aside className="bg-surface w-64 min-h-screen shadow-md hidden md:block">
      <div className="p-4">
        <h2 className="text-heading-3 font-bold text-primary mb-6">Ponto Eletrônico</h2>

        <nav className="space-y-1">
          <Link
            to="/"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/") &&
              !isActive("/punch") &&
              !isActive("/profile") &&
              !isActive("/admin") &&
              !isActive("/schedule") &&
              !isActive("/adjustments")
                ? "bg-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>

          <Link
            to="/punch"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/punch") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Registrar Ponto
          </Link>

          <div className="pt-4 pb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Jornadas e Plantões</div>
          </div>

          <Link
            to="/schedule/shifts"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/schedule/shifts") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Meus Plantões
          </Link>

          {isAdminOrManager && (
            <>
              <Link
                to="/schedule/board"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/schedule/board") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                Quadro de Plantões
              </Link>

              <Link
                to="/schedule/config"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/schedule/config") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Configurar Jornadas
              </Link>
            </>
          )}

          <div className="pt-4 pb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ajustes de Ponto</div>
          </div>

          <Link
            to="/adjustments/request"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/adjustments/request") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Solicitar Ajuste
          </Link>

          {isAdminOrManager && (
            <>
              <Link
                to="/adjustments/pending"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/adjustments/pending") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="relative flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>Pendentes</span>
                  <PendingAdjustmentsWidget onlyCount />
                </div>
              </Link>

              <Link
                to="/adjustments/all"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/adjustments/all") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Todas Solicitações
              </Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <div className="pt-4 pb-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administração</div>
              </div>

              <Link
                to="/admin/users"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive("/admin/users") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Usuários
              </Link>
            </>
          )}

          <div className="pt-4 pb-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Conta</div>
          </div>

          <Link
            to="/profile"
            className={`flex items-center px-4 py-2 rounded-md ${
              isActive("/profile") ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Meu Perfil
          </Link>
        </nav>
      </div>
    </aside>
  )
}

export default AdminSidebar

