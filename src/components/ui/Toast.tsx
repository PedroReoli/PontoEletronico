"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import "../../styles/components/toast.css"

export type ToastType = "info" | "success" | "warning" | "error"

export interface ToastProps {
  id: string
  type?: ToastType
  title?: string
  message: string
  duration?: number
  onClose: (id: string) => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
  showIcon?: boolean
  showCloseButton?: boolean
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  position = "top-right",
  showIcon = true,
  showCloseButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300)
    }, duration)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 100)
        return newProgress < 0 ? 0 : newProgress
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration, id, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const getIcon = () => {
    switch (type) {
      case "info":
        return (
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
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
      case "success":
        return (
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case "warning":
        return (
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "error":
        return (
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
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      className={`toast toast-${type} toast-${position}`}
      initial={{
        opacity: 0,
        x: position.includes("right") ? 100 : position.includes("left") ? -100 : 0,
        y: position.includes("top") ? -20 : position.includes("bottom") ? 20 : 0,
      }}
      animate={{ opacity: isVisible ? 1 : 0, x: 0, y: 0 }}
      exit={{
        opacity: 0,
        x: position.includes("right") ? 100 : position.includes("left") ? -100 : 0,
        y: position.includes("top") ? -20 : position.includes("bottom") ? 20 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      {showIcon && <div className="toast-icon">{getIcon()}</div>}
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      {showCloseButton && (
        <button className="toast-close" onClick={handleClose} aria-label="Fechar notificação">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
      )}
      {duration !== Number.POSITIVE_INFINITY && (
        <div className="toast-progress-container">
          <div className="toast-progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </motion.div>
  )
}

export interface ToastContainerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ position = "top-right" }) => {
  return <div className={`toast-container toast-container-${position}`}></div>
}

export default Toast
