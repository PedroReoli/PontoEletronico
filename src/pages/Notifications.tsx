"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"

interface Notification {
  id: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // Simular chamada à API
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Dados simulados
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "INFO",
            title: "Novo relatório disponível",
            message: "O relatório mensal de abril está disponível para download.",
            read: false,
            createdAt: new Date().toISOString(),
            link: "/reports",
          },
          {
            id: "2",
            type: "SUCCESS",
            title: "Ajuste de ponto aprovado",
            message: "Sua solicitação de ajuste para o dia 15/04 foi aprovada pelo gestor.",
            read: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            type: "WARNING",
            title: "Esquecimento de registro",
            message: "Você não registrou sua saída ontem. Por favor, solicite um ajuste.",
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            type: "ERROR",
            title: "Ajuste de ponto rejeitado",
            message: "Sua solicitação de ajuste para o dia 10/04 foi rejeitada. Motivo: Falta de evidências.",
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "5",
            type: "INFO",
            title: "Manutenção programada",
            message: "O sistema estará indisponível para manutenção no dia 30/04 das 22h às 00h.",
            read: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]

        setNotifications(mockNotifications)
      } catch (error) {
        console.error("Erro ao buscar notificações:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "INFO":
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
            className="notification-icon info"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
      case "SUCCESS":
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
            className="notification-icon success"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      case "WARNING":
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
            className="notification-icon warning"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "ERROR":
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
            className="notification-icon error"
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

  const filteredNotifications =
    filter === "ALL" ? notifications : notifications.filter((notification) => !notification.read)

  return (
    <Layout>
      <div className="notifications-page">
        <div className="notifications-header">
          <h1>Notificações</h1>
          <div className="notifications-actions">
            <button className="mark-all-read" onClick={markAllAsRead}>
              Marcar todas como lidas
            </button>
            <button className="mark-all-read" onClick={clearAllNotifications}>
              Limpar todas
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <button className={`filter-button ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>
            Todas
          </button>
          <button
            className={`filter-button ${filter === "UNREAD" ? "active" : ""}`}
            onClick={() => setFilter("UNREAD")}
          >
            Não lidas
          </button>
        </div>

        {loading ? (
          <p>Carregando notificações...</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M15.34 14.34a4 4 0 0 0-5.68 0"></path>
              <path d="M9 9h.01"></path>
              <path d="M15 9h.01"></path>
            </svg>
            <p>Nenhuma notificação</p>
            <p className="empty-subtitle">Você está em dia!</p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className={`notification-card ${notification.read ? "" : "unread"}`}>
                {getNotificationIcon(notification.type)}
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-meta">
                    <span className="notification-date">{notification.createdAt}</span>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button className="notification-action" onClick={() => markAsRead(notification.id)}>
                          Marcar como lida
                        </button>
                      )}
                      <button className="notification-action" onClick={() => deleteNotification(notification.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Notifications
