"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X } from 'lucide-react'

interface NotificationToastProps {
  message: string
  show: boolean
  onClose: () => void
  duration?: number
}

export function NotificationToast({ message, show, onClose, duration = 5000 }: NotificationToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(onClose, 200) // Tempo para a animação de saída
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, onClose, duration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`notification-toast ${isExiting ? "hide" : ""}`}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <div className="flex items-center p-2">
            <div className="flex-shrink-0 text-green-500 mr-2">
              <CheckCircle size={16} />
            </div>
            <div className="flex-1 mr-2">
              <p className="text-xs text-gray-800">{message}</p>
            </div>
            <button
              onClick={() => {
                setIsExiting(true)
                setTimeout(onClose, 200)
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
