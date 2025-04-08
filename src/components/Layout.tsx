"use client"

import { type ReactNode, useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { motion, AnimatePresence } from "framer-motion"


interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Novo registro de ponto pendente", time: "10 min atrás", read: false },
    { id: 2, text: "Ajuste de ponto aprovado", time: "1 hora atrás", read: false },
  ])

  const sidebarRef = useRef<HTMLElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fechar sidebar em telas pequenas quando a rota muda
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [])

  // Fechar sidebar quando clicar fora em telas pequenas
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        document.getElementById("sidebar-toggle") &&
        !document.getElementById("sidebar-toggle")!.contains(event.target as Node) &&
        window.innerWidth < 1024 &&
        sidebarOpen
      ) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen])

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
        if (sidebarOpen && window.innerWidth < 1024) setSidebarOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [profileDropdownOpen, notificationsOpen, sidebarOpen])

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
    if (notificationsOpen) setNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    if (profileDropdownOpen) setProfileDropdownOpen(false)
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
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

  // Gerar breadcrumbs baseado na rota atual
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter((path) => path)

    if (paths.length === 0) return null

    const breadcrumbs = paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join("/")}`
      const isLast = index === paths.length - 1

      // Formatar o texto do breadcrumb
      let label = path.charAt(0).toUpperCase() + path.slice(1)

      // Substituir IDs por nomes mais amigáveis
      if (path === "admin") label = "Administração"
      if (path === "users") label = "Usuários"
      if (path === "companies") label = "Empresas"
      if (path === "shift-groups") label = "Grupos de Jornada"
      if (path === "shift-types") label = "Tipos de Plantão"
      if (path === "timesheet") label = "Registro de Ponto"
      if (path === "reports") label = "Relatórios"
      if (path === "profile") label = "Perfil"
      if (path === "settings") label = "Configurações"
      if (path === "dashboard") label = "Dashboard"

      return (
        <li key={url} className="breadcrumb-item">
          {!isLast ? (
            <Link to={url} className="breadcrumb-link">
              {label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{label}</span>
          )}
          {!isLast && <span className="breadcrumb-separator">/</span>}
        </li>
      )
    })

    return (
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </Link>
            <span className="breadcrumb-separator">/</span>
          </li>
          {breadcrumbs}
        </ol>
      </nav>
    )
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  if (!mounted) return null

  return (
    <div className="layout">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo
      </a>

      {/* Header */}
      <header className="header">
        <div className="header-container">
          {/* Left section */}
          <div className="header-left">
            <button
              id="sidebar-toggle"
              onClick={toggleSidebar}
              className="menu-toggle"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link to="/dashboard" className="logo">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="logo-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </motion.div>
              <span className="logo-text">Controle de Ponto</span>
            </Link>

            {/* Breadcrumbs */}
            {generateBreadcrumbs()}
          </div>

          {/* Right section */}
          <div className="user-info">
            {/* Notifications */}
            <div className="notifications-container">
              <button
                id="notification-button"
                className="notification-button"
                aria-label="Notificações"
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                onClick={toggleNotifications}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span
                    className="notification-badge"
                    aria-label={`${unreadNotificationsCount} notificações não lidas`}
                  ></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    ref={notificationsRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="notifications-dropdown"
                    role="menu"
                    aria-label="Notificações"
                  >
                    <div className="notifications-header">
                      <h3>Notificações</h3>
                      {unreadNotificationsCount > 0 && (
                        <button onClick={markAllAsRead} className="mark-all-read">
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>

                    <div className="notifications-list">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? "read" : "unread"}`}
                          >
                            <div className="notification-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                            </div>
                            <div className="notification-content">
                              <p>{notification.text}</p>
                              <span className="notification-time">{notification.time}</span>
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="notification-dismiss"
                              aria-label="Remover notificação"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-notifications">
                          <p>Não há notificações</p>
                        </div>
                      )}
                    </div>

                    <div className="notifications-footer">
                      <Link to="/notifications" className="view-all" onClick={() => setNotificationsOpen(false)}>
                        Ver todas as notificações
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="profile-dropdown-container">
              <button
                id="profile-button"
                onClick={toggleProfileDropdown}
                className="profile-button"
                aria-label="Menu do usuário"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                <div className="user-details">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role">
                    {user?.role === "ADMIN" && "Administrador"}
                    {user?.role === "MANAGER" && "Gestor"}
                    {user?.role === "EMPLOYEE" && "Funcionário"}
                  </span>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="user-avatar">
                  {user ? getInitials(user.name) : "?"}
                </motion.div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    ref={profileDropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="profile-menu"
                    role="menu"
                    aria-label="Menu do usuário"
                  >
                    <div className="profile-menu-header">
                      <div className="profile-menu-avatar">
                        <div className="user-avatar large">{user ? getInitials(user.name) : "?"}</div>
                      </div>
                      <div className="profile-menu-user-info">
                        <h4 className="profile-menu-name">{user?.name}</h4>
                        <p className="profile-menu-email">{user?.email}</p>
                      </div>
                    </div>

                    <div className="profile-menu-items">
                      <Link to="/profile" className="profile-menu-item" onClick={() => setProfileDropdownOpen(false)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Seu Perfil</span>
                      </Link>
                      <Link to="/settings" className="profile-menu-item" onClick={() => setProfileDropdownOpen(false)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>Configurações</span>
                      </Link>
                      <Link to="/help" className="profile-menu-item" onClick={() => setProfileDropdownOpen(false)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>Ajuda</span>
                      </Link>
                    </div>

                    <div className="profile-menu-divider"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="profile-menu-item logout"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      <span>Sair</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="sidebar-layout">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            ></motion.div>
          )}
        </AnimatePresence>

        <motion.aside
          ref={sidebarRef}
          id="sidebar"
          className={`sidebar ${sidebarOpen ? "open" : ""}`}
          animate={sidebarOpen ? "open" : "closed"}
          aria-label="Menu de navegação principal"
        >
          <nav className="nav" aria-label="Menu principal">
            <ul className="nav-list">
              {/* Dashboard */}
              <motion.li
                className="nav-item"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </motion.li>

              {/* Registro de Ponto */}
              <motion.li
                className="nav-item"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link
                  to="/timesheet"
                  className={`nav-link ${isActive("/timesheet") ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive("/timesheet") ? "page" : undefined}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Registro de Ponto</span>
                </Link>
              </motion.li>

              {/* Relatórios */}
              <motion.li
                className="nav-item"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link
                  to="/reports"
                  className={`nav-link ${isActive("/reports") ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive("/reports") ? "page" : undefined}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Relatórios</span>
                </Link>
              </motion.li>

              {/* Seção de Gestão - Visível apenas para MANAGER e ADMIN */}
              {(user?.role === "MANAGER" || user?.role === "ADMIN") && (
                <>
                  <li className="nav-section">Gestão</li>

                  {/* Gestão de Equipe */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/manager"
                      className={`nav-link ${isActive("/manager") ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive("/manager") ? "page" : undefined}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>Gestão de Equipe</span>
                    </Link>
                  </motion.li>

                  {/* Ajustes Pendentes */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/adjustments"
                      className={`nav-link ${isActive("/adjustments") ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive("/adjustments") ? "page" : undefined}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      <span>Ajustes Pendentes</span>
                    </Link>
                  </motion.li>
                </>
              )}

              {/* Seção de Administração - Visível apenas para ADMIN */}
              {user?.role === "ADMIN" && (
                <>
                  <li className="nav-section">Administração</li>

                  {/* Painel Admin */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/admin"
                      className={`nav-link ${
                        isActive("/admin") &&
                        !isActive("/admin/users") &&
                        !isActive("/admin/companies") &&
                        !isActive("/admin/shift-groups") &&
                        !isActive("/admin/shift-types")
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={
                        isActive("/admin") &&
                        !isActive("/admin/users") &&
                        !isActive("/admin/companies") &&
                        !isActive("/admin/shift-groups") &&
                        !isActive("/admin/shift-types")
                          ? "page"
                          : undefined
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span>Painel Admin</span>
                    </Link>
                  </motion.li>

                  {/* Usuários */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/admin/users"
                      className={`nav-link ${isActive("/admin/users") ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive("/admin/users") ? "page" : undefined}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Usuários</span>
                    </Link>
                  </motion.li>

                  {/* Empresas */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/admin/companies"
                      className={`nav-link ${isActive("/admin/companies") ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive("/admin/companies") ? "page" : undefined}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      <span>Empresas</span>
                    </Link>
                  </motion.li>

                  {/* Grupos de Jornada */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/admin/shift-groups"
                      className={`nav-link ${isActive("/admin/shift-groups") ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive("/admin/shift-groups") ? "page" : undefined}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Grupos de Jornada</span>
                    </Link>
                  </motion.li>

                  {/* Tipos de Plantão */}
                  <motion.li
                    className="nav-item"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link
                      to="/admin/shift-types"
                      className={`nav-link ${isActive("/admin/shift-types") ? "active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive("/admin/shift-types") ? "page" : undefined}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      <span>Tipos de Plantão</span>
                    </Link>
                  </motion.li>
                </>
              )}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <div className="app-version">v1.2.0</div>
          </div>
        </motion.aside>

        {/* Main content */}
        <main id="main-content" className="main-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Layout
