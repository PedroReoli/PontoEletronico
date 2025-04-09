"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Layout from "../components/Layout"
import { useAuth } from "../hooks/useAuth"

function Settings() {
  const {} = useAuth() // Removendo user não utilizado
  const [activeTab, setActiveTab] = useState("notifications")
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailyDigest: true,
    weeklyReport: true,
    adjustmentUpdates: true,
  })
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    compactMode: false,
    fontSize: "medium",
  })
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    shareActivityWithManager: true,
    allowDataCollection: true,
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setAppearanceSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const saveSettings = async (settingType: string) => {
    setSaving(true)
    setSuccess("")

    try {
      // Simular chamada à API
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Aqui você faria a chamada real à API com os dados apropriados
      // Por exemplo:
      // switch (settingType) {
      //   case "notifications":
      //     await api.put(`/users/settings/${settingType}`, notificationSettings)
      //     break
      //   case "appearance":
      //     await api.put(`/users/settings/${settingType}`, appearanceSettings)
      //     break
      //   case "privacy":
      //     await api.put(`/users/settings/${settingType}`, privacySettings)
      //     break
      // }

      setSuccess(`Configurações de ${getTabName(settingType)} salvas com sucesso!`)
    } catch (error) {
      console.error(`Erro ao salvar configurações de ${settingType}:`, error)
    } finally {
      setSaving(false)

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    }
  }

  const getTabName = (tab: string) => {
    switch (tab) {
      case "notifications":
        return "Notificações"
      case "appearance":
        return "Aparência"
      case "privacy":
        return "Privacidade"
      default:
        return tab
    }
  }

  return (
    <Layout>
      <div className="settings-page">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1>Configurações</h1>
        </motion.div>

        <div className="settings-container">
          <motion.div
            className="settings-sidebar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ul className="settings-tabs">
              <li
                className={`settings-tab ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Notificações</span>
              </li>
              <li
                className={`settings-tab ${activeTab === "appearance" ? "active" : ""}`}
                onClick={() => setActiveTab("appearance")}
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
                <span>Aparência</span>
              </li>
              <li
                className={`settings-tab ${activeTab === "privacy" ? "active" : ""}`}
                onClick={() => setActiveTab("privacy")}
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Privacidade</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="settings-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {success && <div className="alert alert-success">{success}</div>}

            {activeTab === "notifications" && (
              <div className="settings-section">
                <h2>Configurações de Notificações</h2>
                <p className="settings-description">Gerencie como e quando você recebe notificações do sistema.</p>

                <div className="settings-options">
                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Notificações por E-mail</h3>
                      <p>Receba notificações importantes por e-mail</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Notificações Push</h3>
                      <p>Receba notificações no navegador</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={notificationSettings.pushNotifications}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Resumo Diário</h3>
                      <p>Receba um resumo diário das suas atividades</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="dailyDigest"
                        checked={notificationSettings.dailyDigest}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Relatório Semanal</h3>
                      <p>Receba um relatório semanal com suas horas trabalhadas</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="weeklyReport"
                        checked={notificationSettings.weeklyReport}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Atualizações de Ajustes</h3>
                      <p>Receba notificações sobre solicitações de ajuste de ponto</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="adjustmentUpdates"
                        checked={notificationSettings.adjustmentUpdates}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary" onClick={() => saveSettings("notifications")} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Configurações"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="settings-section">
                <h2>Configurações de Aparência</h2>
                <p className="settings-description">
                  Personalize a aparência do sistema de acordo com suas preferências.
                </p>

                <div className="settings-options">
                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Tema</h3>
                      <p>Escolha entre tema claro ou escuro</p>
                    </div>
                    <div className="option-control">
                      <select
                        name="theme"
                        value={appearanceSettings.theme}
                        onChange={handleAppearanceChange}
                        className="settings-select"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                        <option value="system">Usar configuração do sistema</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Modo Compacto</h3>
                      <p>Reduz o espaçamento entre elementos para mostrar mais conteúdo</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="compactMode"
                        checked={appearanceSettings.compactMode}
                        onChange={handleAppearanceChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Tamanho da Fonte</h3>
                      <p>Ajuste o tamanho da fonte para melhor legibilidade</p>
                    </div>
                    <div className="option-control">
                      <select
                        name="fontSize"
                        value={appearanceSettings.fontSize}
                        onChange={handleAppearanceChange}
                        className="settings-select"
                      >
                        <option value="small">Pequeno</option>
                        <option value="medium">Médio</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary" onClick={() => saveSettings("appearance")} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Configurações"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="settings-section">
                <h2>Configurações de Privacidade</h2>
                <p className="settings-description">
                  Controle quais informações são compartilhadas e como seus dados são utilizados.
                </p>

                <div className="settings-options">
                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Mostrar Status Online</h3>
                      <p>Permite que outros usuários vejam quando você está online</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="showOnlineStatus"
                        checked={privacySettings.showOnlineStatus}
                        onChange={handlePrivacyChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Compartilhar Atividade com Gestor</h3>
                      <p>Permite que seu gestor veja detalhes da sua atividade</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="shareActivityWithManager"
                        checked={privacySettings.shareActivityWithManager}
                        onChange={handlePrivacyChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-option">
                    <div className="option-info">
                      <h3>Coleta de Dados para Melhorias</h3>
                      <p>Permite a coleta de dados anônimos para melhorar o sistema</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="allowDataCollection"
                        checked={privacySettings.allowDataCollection}
                        onChange={handlePrivacyChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn btn-primary" onClick={() => saveSettings("privacy")} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Configurações"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Settings
