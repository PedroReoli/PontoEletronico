"use client"

import type { ReactNode } from "react"
import { Info, CheckCircle, AlertTriangle, XCircle, Clock, X } from "lucide-react"

interface NotificationItemProps {
  id: string
  title: string
  message: string
  time: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  read: boolean
  onRead: (id: string) => void
  onRemove: (id: string) => void
}

export function NotificationItem({ id, title, message, time, type, read, onRead, onRemove }: NotificationItemProps) {
  const getNotificationIcon = (type: string): ReactNode => {
    const iconProps = { size: 16, className: "flex-shrink-0" }

    switch (type) {
      case "INFO":
        return <Info {...iconProps} className="text-info-dark" />
      case "SUCCESS":
        return <CheckCircle {...iconProps} className="text-success-dark" />
      case "WARNING":
        return <AlertTriangle {...iconProps} className="text-warning-dark" />
      case "ERROR":
        return <XCircle {...iconProps} className="text-error-dark" />
      default:
        return <Clock {...iconProps} className="text-gray-500" />
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        read ? "opacity-75" : "bg-blue-50/30"
      }`}
      onClick={() => !read && onRead(id)}
    >
      <div className="mt-1">{getNotificationIcon(type)}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${read ? "text-gray-700" : "text-gray-900"}`}>{title}</p>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{message}</p>
        <span className="text-xs text-gray-500 mt-1 block">{time}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
        }}
        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Remover notificação"
      >
        <X size={14} />
      </button>
    </div>
  )
}
