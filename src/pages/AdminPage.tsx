import type React from "react"
import { Link } from "react-router-dom"
import { FiUsers, FiSettings, FiFileText, FiActivity } from "react-icons/fi"

const AdminPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Gerenciamento de Usuários */}
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FiUsers className="text-blue-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
          </div>
          <p className="text-gray-600">
            Adicione, edite e gerencie usuários do sistema. Configure permissões e papéis.
          </p>
        </Link>

        {/* Card de Configurações do Sistema */}
        <Link
          to="/admin/settings"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiSettings className="text-green-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
          </div>
          <p className="text-gray-600">
            Configure parâmetros globais do sistema, feriados, e outras configurações gerais.
          </p>
        </Link>

        {/* Card de Logs de Auditoria */}
        <Link
          to="/admin/audit-logs"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FiActivity className="text-purple-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold">Logs de Auditoria</h2>
          </div>
          <p className="text-gray-600">Visualize registros de atividades e alterações realizadas no sistema.</p>
        </Link>

        {/* Card de Configuração de E-mail */}
        <Link
          to="/admin/email-config"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FiFileText className="text-yellow-600 text-xl" />
            </div>
            <h2 className="text-xl font-semibold">Configuração de E-mail</h2>
          </div>
          <p className="text-gray-600">Configure os servidores de e-mail e modelos de mensagens para notificações.</p>
        </Link>
      </div>
    </div>
  )
}

export default AdminPage

