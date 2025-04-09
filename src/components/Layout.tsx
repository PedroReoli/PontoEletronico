"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import Topbar from "./Topbar"

// Tipos
interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  const { user } = useAuth()
  const location = useLocation()

  // Estados
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Refs para detectar cliques fora dos elementos
  const sidebarRef = useRef<HTMLElement>(null)

  // Fechar sidebar em telas pequenas quando a rota muda
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

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

  // Fechar dropdowns ao pressionar ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (sidebarOpen && window.innerWidth < 1024) setSidebarOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [sidebarOpen])

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="layout">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo
      </a>

      {/* Topbar Component */}
      <Topbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="layout-container">
        {/* Sidebar overlay for mobile */}
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

        {/* Left Sidebar */}
        <motion.aside
          ref={sidebarRef}
          className={`leftsidebar ${sidebarOpen ? "open" : ""}`}
          animate={sidebarOpen ? "open" : "closed"}
          aria-label="Menu de navegação principal"
        >
          <div className="sidebar-content">
            <nav className="sidebar-nav" aria-label="Menu principal">
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
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
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
