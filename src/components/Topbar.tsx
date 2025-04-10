"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import api from "../services/api"
import {
  Bell,
  Menu,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Clock,
} from "lucide-react"

interface TopbarProps {
  toggleSidebar: () => void
  sidebarOpen: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
}

const Topbar = ({ toggleSidebar, sidebarOpen }: TopbarProps) => {
  const { user, logout } = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)

  // Refs para detectar cliques fora dos elementos
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Buscar notificações do backend
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      setNotificationsError(null)
      const response = await api.get("/notifications")
      setNotifications(response.data)
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      setNotificationsError("Não foi possível carregar as notificações")
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  // Marcar todas notificações como lidas
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all")
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error)
    }
  }

  // Remover notificação
  const removeNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(notifications.filter((notification) => notification.id !== id))
    } catch (error) {
      console.error("Erro ao remover notificação:", error)
    }
  }

  // Buscar notificações ao montar o componente
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  // Fechar dropdown de perfil quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        document.getElementById("profile-button") &&
        !document.getElementById("profile-button")!.contains(event.target as Node) &&
        profileDropdownOpen
      ) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileDropdownOpen])

  // Fechar dropdown de notificações quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        document.getElementById("notification-button") &&
        !document.getElementById("notification-button")!.contains(event.target as Node) &&
        notificationsOpen
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [notificationsOpen])

  // Fechar dropdowns ao pressionar ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (profileDropdownOpen) setProfileDropdownOpen(false)
        if (notificationsOpen) setNotificationsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [profileDropdownOpen, notificationsOpen])

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
    if (notificationsOpen) setNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    if (profileDropdownOpen) setProfileDropdownOpen(false)
  }

  // Função para gerar as iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Formatar data relativa (ex: "há 5 minutos")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "agora mesmo"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `há ${hours} ${hours === 1 ? "hora" : "horas"}`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `há ${days} ${days === 1 ? "dia" : "dias"}`
    }
  }

  // Obter ícone para o tipo de notificação
  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 16, className: "flex-shrink-0" }

    switch (type) {
      case "INFO":
        return <Info {...iconProps} className="text-blue-500" />
      case "SUCCESS":
        return <CheckCircle {...iconProps} className="text-green-500" />
      case "WARNING":
        return <AlertTriangle {...iconProps} className="text-amber-500" />
      case "ERROR":
        return <XCircle {...iconProps} className="text-red-500" />
      default:
        return <Clock {...iconProps} className="text-gray-500" />
    }
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-10 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              id="sidebar-toggle"
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Alternar menu lateral"
              aria-expanded={sidebarOpen}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Page title - Only visible on desktop */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Controle de Ponto</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                id="notification-button"
                className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notificações"
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span
                    className="notification-badge"
                    aria-label={`${unreadNotificationsCount} notificações não lidas`}
                  >
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    ref={notificationsRef}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="notification-button"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <h3 className="text-sm font-medium text-gray-900">Notificações</h3>
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      {notificationsLoading ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4 text-gray-500">
                          <svg
                            className="animate-spin h-8 w-8 mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <p className="text-sm">Carregando notificações...</p>
                        </div>
                      ) : notificationsError ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                          <p className="text-sm text-gray-600 mb-2">{notificationsError}</p>
                          <button
                            onClick={fetchNotifications}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            Tentar novamente
                          </button>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              notification.read ? "opacity-75" : "bg-blue-50/30"
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                              aria-label="Remover notificação"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-gray-500">
                          <Bell size={24} className="mb-2" />
                          <p className="text-sm">Não há notificações</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 py-2 px-4">
                      <Link
                        to="/notifications"
                        className="block text-center text-xs font-medium text-blue-600 hover:text-blue-800"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        Ver todas as notificações
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                id="profile-button"
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Menu do usuário"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                <div className="hidden md:block text-right">
                  <span className="block text-sm font-medium text-gray-900">{user?.name?.split(" ")[0]}</span>
                  <span className="block text-xs text-gray-500">
                    {user?.role === "ADMIN" && "Administrador"}
                    {user?.role === "MANAGER" && "Gestor"}
                    {user?.role === "EMPLOYEE" && "Funcionário"}
                  </span>
                </div>
                <motion.div className="user-avatar w-8 h-8" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {user ? getInitials(user.name) : "?"}
                </motion.div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    ref={profileDropdownRef}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="profile-button"
                  >
                    <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
                      <div className="user-avatar w-12 h-12 text-base">{user ? getInitials(user.name) : "?"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                        role="menuitem"
                      >
                        <User size={16} className="mr-3 text-gray-500" />
                        <span>Seu Perfil</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                        role="menuitem"
                      >
                        <Settings size={16} className="mr-3 text-gray-500" />
                        <span>Configurações</span>
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                        role="menuitem"
                      >
                        <HelpCircle size={16} className="mr-3 text-gray-500" />
                        <span>Ajuda</span>
                      </Link>
                    </div>

                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false)
                          logout()
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <LogOut size={16} className="mr-3" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
