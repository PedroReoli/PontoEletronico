"use client"

import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"

interface NavLinkProps {
  to: string
  icon: ReactNode
  children: ReactNode
  onClick?: () => void
}

export function NavLink({ to, icon, children, onClick }: NavLinkProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <motion.li className="w-full" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
          isActive(to) ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"
        }`}
        onClick={onClick}
        aria-current={isActive(to) ? "page" : undefined}
      >
        <span className="text-[20px]">{icon}</span>
        <span className="text-sm">{children}</span>
      </Link>
    </motion.li>
  )
}
