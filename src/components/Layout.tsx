"use client"

import { type ReactNode, useState, useEffect } from "react"
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

  useEffect(() => {
    setMounted(true)

    // Fechar sidebar em telas pequenas quando a rota muda
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
      const sidebar = document.getElementById("sidebar")
      const toggleButton = document.getElementById("sidebar-toggle")

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node) &&
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
      const dropdown = document.getElementById("profile-dropdown")
      const profileButton = document.getElementById("profile-button")

      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        profileButton &&
        !profileButton.contains(event.target as Node) &&
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

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
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

  // Função para determinar a cor de fundo do avatar com base no nome
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]

    // Usar a soma dos códigos de caractere para escolher uma cor
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[sum % colors.length]
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 inset-x-0 z-30">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left section */}
          <div className="flex items-center">
            <button
              id="sidebar-toggle"
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link to="/dashboard" className="flex items-center ml-2 lg:ml-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-600 text-white mr-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              <span className="text-lg font-semibold text-gray-900">Controle de Ponto</span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <button
                id="profile-button"
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-3 focus:outline-none"
                aria-label="User menu"
                aria-haspopup="true"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500">
                    {user?.role === "ADMIN" && "Administrador"}
                    {user?.role === "MANAGER" && "Gestor"}
                    {user?.role === "EMPLOYEE" && "Funcionário"}
                  </span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center justify-center h-9 w-9 rounded-full text-white ${
                    user ? getAvatarColor(user.name) : "bg-primary-600"
                  }`}
                >
                  {user ? getInitials(user.name) : "?"}
                </motion.div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    id="profile-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Seu Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Configurações
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            ></motion.div>
          )}
        </AnimatePresence>

        <motion.aside
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 pt-16 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {/* Dashboard */}
              <Link
                to="/dashboard"
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isActive("/dashboard") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-3 h-5 w-5 ${
                    isActive("/dashboard") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                  }`}
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
                <span>Dashboard</span>
                {isActive("/dashboard") && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>

              {/* Registro de Ponto */}
              <Link
                to="/timesheet"
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isActive("/timesheet") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-3 h-5 w-5 ${
                    isActive("/timesheet") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                  }`}
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
                <span>Registro de Ponto</span>
                {isActive("/timesheet") && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>

              {/* Relatórios */}
              <Link
                to="/reports"
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isActive("/reports") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`mr-3 h-5 w-5 ${
                    isActive("/reports") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Relatórios</span>
                {isActive("/reports") && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>

              {/* Seção de Gestão - Visível apenas para MANAGER e ADMIN */}
              {(user?.role === "MANAGER" || user?.role === "ADMIN") && (
                <>
                  <div className="pt-4 pb-2">
                    <div className="px-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gestão</h3>
                      <div className="mt-1 h-px bg-gray-200"></div>
                    </div>
                  </div>

                  {/* Gestão de Equipe */}
                  <Link
                    to="/manager"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/manager") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/manager") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Gestão de Equipe</span>
                    {isActive("/manager") && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>

                  {/* Ajustes Pendentes */}
                  <Link
                    to="/adjustments"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/adjustments") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/adjustments") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                      }`}
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
                    <span>Ajustes Pendentes</span>
                    {isActive("/adjustments") && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </>
              )}

              {/* Seção de Administração - Visível apenas para ADMIN */}
              {user?.role === "ADMIN" && (
                <>
                  <div className="pt-4 pb-2">
                    <div className="px-3">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administração</h3>
                      <div className="mt-1 h-px bg-gray-200"></div>
                    </div>
                  </div>

                  {/* Painel Admin */}
                  <Link
                    to="/admin"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/admin") &&
                      !isActive("/admin/users") &&
                      !isActive("/admin/companies") &&
                      !isActive("/admin/shift-groups") &&
                      !isActive("/admin/shift-types")
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/admin") &&
                        !isActive("/admin/users") &&
                        !isActive("/admin/companies") &&
                        !isActive("/admin/shift-groups") &&
                        !isActive("/admin/shift-types")
                          ? "text-primary-700"
                          : "text-gray-500 group-hover:text-gray-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Painel Admin</span>
                    {isActive("/admin") &&
                      !isActive("/admin/users") &&
                      !isActive("/admin/companies") &&
                      !isActive("/admin/shift-groups") &&
                      !isActive("/admin/shift-types") && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                  </Link>

                  {/* Usuários */}
                  <Link
                    to="/admin/users"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/admin/users") ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/admin/users") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                      }`}
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
                    <span>Usuários</span>
                    {isActive("/admin/users") && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>

                  {/* Empresas */}
                  <Link
                    to="/admin/companies"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/admin/companies")
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/admin/companies") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span>Empresas</span>
                    {isActive("/admin/companies") && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>

                  {/* Grupos de Jornada */}
                  <Link
                    to="/admin/shift-groups"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/admin/shift-groups")
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/admin/shift-groups") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                      }`}
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
                    <span>Grupos de Jornada</span>
                    {isActive("/admin/shift-groups") && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>

                  {/* Tipos de Plantão */}
                  <Link
                    to="/admin/shift-types"
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                      isActive("/admin/shift-types")
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`mr-3 h-5 w-5 ${
                        isActive("/admin/shift-types") ? "text-primary-700" : "text-gray-500 group-hover:text-gray-600"
                      }`}
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
                    <span>Tipos de Plantão</span>
                    {isActive("/admin/shift-types") && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-0 w-1 h-8 bg-primary-600 rounded-l-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Versão 1.0.0</p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Layout
