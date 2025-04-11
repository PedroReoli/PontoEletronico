"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { motion, AnimatePresence } from "framer-motion"
import Topbar from "./Topbar"
import { Home, Clock, FileText, Users, Settings, Grid, User, Building, Calendar, Activity, ChevronRight } from 'lucide-react'
import { Link } from "react-router-dom"

// Tipos
interface LayoutProps {
  children: ReactNode
}

interface NavItemProps {
  to: string
  icon: ReactNode
  label: string
  onClick?: () => void
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive 
            ? "bg-blue-50 text-blue-700 font-medium" 
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="flex-shrink-0 text-[20px]">{icon}</span>
        <span className="flex-1 text-sm">{label}</span>
        {isActive && <ChevronRight size={16} className="flex-shrink-0 text-blue-500" />}
      </Link>
    </li>
  )
}

function NavSection({ title }: { title: string }) {
  return (
    <div className="px-3 py-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
    </div>
  )
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo
      </a>

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        initial={false}
        animate={{ width: "16rem" }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with logo */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white">
                <Clock size={18} />
              </div>
              <span className="text-lg font-semibold text-gray-900">Controle de Ponto</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar py-4" aria-label="Menu principal">
            <ul className="space-y-1 px-2">
              {/* Dashboard */}
              <NavItem 
                to="/dashboard" 
                icon={<Home size={20} />} 
                label="Dashboard" 
                onClick={() => setSidebarOpen(false)} 
              />

              {/* Registro de Ponto */}
              <NavItem 
                to="/timesheet" 
                icon={<Clock size={20} />} 
                label="Registro de Ponto" 
                onClick={() => setSidebarOpen(false)} 
              />

              {/* Relatórios */}
              <NavItem 
                to="/reports" 
                icon={<FileText size={20} />} 
                label="Relatórios" 
                onClick={() => setSidebarOpen(false)} 
              />

              {/* Seção de Gestão - Visível apenas para MANAGER e ADMIN */}
              {(user?.role === "MANAGER" || user?.role === "ADMIN") && (
                <>
                  <li className="mt-6">
                    <NavSection title="Gestão" />
                  </li>

                  {/* Gestão de Equipe */}
                  <NavItem 
                    to="/manager" 
                    icon={<Users size={20} />} 
                    label="Gestão de Equipe" 
                    onClick={() => setSidebarOpen(false)} 
                  />

                  {/* Ajustes Pendentes */}
                  <NavItem 
                    to="/adjustments" 
                    icon={<Settings size={20} />} 
                    label="Ajustes Pendentes" 
                    onClick={() => setSidebarOpen(false)} 
                  />
                </>
              )}

              {/* Seção de Administração - Visível apenas para ADMIN */}
              {user?.role === "ADMIN" && (
                <>
                  <li className="mt-6">
                    <NavSection title="Administração" />
                  </li>

                  {/* Painel Admin */}
                  <NavItem 
                    to="/admin" 
                    icon={<Grid size={20} />} 
                    label="Painel Admin" 
                    onClick={() => setSidebarOpen(false)} 
                  />

                  {/* Usuários */}
                  <NavItem 
                    to="/admin/users" 
                    icon={<User size={20} />} 
                    label="Usuários" 
                    onClick={() => setSidebarOpen(false)} 
                  />

                  {/* Empresas */}
                  <NavItem 
                    to="/admin/companies" 
                    icon={<Building size={20} />} 
                    label="Empresas" 
                    onClick={() => setSidebarOpen(false)} 
                  />

                  {/* Grupos de Jornada */}
                  <NavItem 
                    to="/admin/shift-groups" 
                    icon={<Calendar size={20} />} 
                    label="Grupos de Jornada" 
                    onClick={() => setSidebarOpen(false)} 
                  />

                  {/* Tipos de Plantão */}
                  <NavItem 
                    to="/admin/shift-types" 
                    icon={<Activity size={20} />} 
                    label="Tipos de Plantão" 
                    onClick={() => setSidebarOpen(false)} 
                  />
                </>
              )}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="text-xs text-gray-500 text-center">v1.0.0</div>
          </div>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Topbar Component */}
        <Topbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
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
