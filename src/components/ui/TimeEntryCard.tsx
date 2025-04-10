"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface TimeEntryCardProps {
  title: string
  children: ReactNode
  className?: string
  rightElement?: ReactNode
}

export function TimeEntryCard({ title, children, className = "", rightElement }: TimeEntryCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-800">{title}</h2>
        {rightElement}
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  )
}
