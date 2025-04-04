"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import UserManagementTable from "@/components/users/UserManagementTable"

const UsersPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"all" | "company">("all")

  // Verificar se o usuário tem permissão para ver todos os usuários
  const canViewAllUsers = user?.role === "ADMIN"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-heading-1 mb-6">Gerenciamento de Usuários</h1>

      {/* Tabs para alternar entre todos os usuários e usuários da empresa */}
      {canViewAllUsers && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Todos os Usuários
              </button>
              <button
                onClick={() => setActiveTab("company")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "company"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Usuários da Minha Empresa
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Tabela de usuários */}
      <UserManagementTable
        companyId={activeTab === "company" || !canViewAllUsers ? user?.companyId : undefined}
        canManageUsers={user?.role === "ADMIN" || user?.role === "MANAGER"}
      />
    </div>
  )
}

export default UsersPage

