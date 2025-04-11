"use client"

import { useRef, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  align?: "left" | "right"
  className?: string
  id?: string
}

export function Dropdown({ trigger, children, isOpen, setIsOpen, align = "right", className = "", id }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        document.getElementById(id || "") &&
        !document.getElementById(id || "")!.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, id, setIsOpen])

  return (
    <div className="relative">
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 mt-2 ${align === "right" ? "right-0" : "left-0"} ${className}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
