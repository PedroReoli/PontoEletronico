// "use client"

// import { useState, useEffect } from "react"
// import { Link } from "react-router-dom"
// import {
//   ArrowLeft,
//   Save,
//   Settings,
//   Bell,
//   Globe,
//   Database,
//   Mail,
//   FileText,
//   RefreshCw,
//   Smartphone,
//   Moon,
//   Sun,
//   AlertTriangle,
//   HelpCircle,
// } from "lucide-react"
// import api from "@/services/api"
// import Layout from "@/components/Layout"
// import { Card, CardContent } from "@/components/ui/Card"
// import { Button } from "@/components/ui/Button"
// import { Badge } from "@/components/ui/Badge"
// import { Alert } from "@/components/ui/Alert"

// // Tipos
// interface SystemSettings {
//   general: {
//     companyName: string
//     timezone: string
//     dateFormat: string
//     language: string
//     maxUploadSize: number
//   }
//   notifications: {
//     emailNotifications: boolean
//     pushNotifications: boolean
//     dailyReports: boolean
//     systemAlerts: boolean
//     adminAlerts: boolean
//   }
//   appearance: {
//     theme: "light" | "dark" | "system"
//     compactMode: boolean
//     showHelpTips: boolean
//     animationsEnabled: boolean
//   }
//   backup: {
//     autoBackup: boolean
//     backupFrequency: "daily" | "weekly" | "monthly"
//     backupTime: string
//     retentionDays: number
//     lastBackup: string | null
//   }
//   integrations: {
//     apiEnabled: boolean
//     webhooksEnabled: boolean
//     externalServicesEnabled: boolean
//   }
// }

// function AdminSettings() {
//   // Estados
//   const [settings, setSettings] = useState<SystemSettings | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [activeTab, setActiveTab] = useState("general")
//   const [saveSuccess, setSaveSuccess] = useState(false)
//   const [saveError, setSaveError] = useState<string | null>(null)

//   // Efeito para buscar configurações
//   useEffect(() => {
//     const fetchSettings = async () => {
//       try {
//         setLoading(true)

//         // Tentar buscar dados da API
//         try {
//           const response = await api.get("/admin/settings")
//           setSettings(response.data)
//         } catch (error) {
//           console.error("Erro ao buscar dados da API, usando dados mockados:", error)

//           // Dados mockados para desenvolvimento
//           const mockSettings: SystemSettings = {
//             general: {
//               companyName: "Sistema de Ponto Eletrônico",
//               timezone: "America/Sao_Paulo",
//               dateFormat: "DD/MM/YYYY",
//               language: "pt-BR",
//               maxUploadSize: 10,
//             },
//             notifications: {
//               emailNotifications: true,
//               pushNotifications: false,
//               dailyReports: true,
//               systemAlerts: true,
//               adminAlerts: true,
//             },
//             appearance: {
//               theme: "light",
//               compactMode: true,
//               showHelpTips: true,
//               animationsEnabled: true,
//             },
//             backup: {
//               autoBackup: true,
//               backupFrequency: "daily",
//               backupTime: "03:00",
//               retentionDays: 30,
//               lastBackup: "2025-04-11T03:00:00",
//             },
//             integrations: {
//               apiEnabled: true,
//               webhooksEnabled: false,
//               externalServicesEnabled: true,
//             },
//           }

//           setSettings(mockSettings)
//         }
//       } catch (error) {
//         console.error("Erro ao buscar configurações:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchSettings()
//   }, [])

//   // Função para atualizar configurações
//   const handleInputChange = (section: keyof SystemSettings, key: string, value: any) => {
//     if (!settings) return

//     setSettings({
//       ...settings,
//       [section]: {
//         ...settings[section],
//         [key]: value,
//       },
//     })
//   }

//   // Função para salvar configurações
//   const handleSaveSettings = async () => {
//     if (!settings) return

//     try {
//       setSaving(true)
//       setSaveSuccess(false)
//       setSaveError(null)

//       // Simulação de chamada à API
//       await new Promise((resolve) => setTimeout(resolve, 800))

//       // Aqui seria a chamada real à API
//       // await api.put("/admin/settings", settings)

//       setSaveSuccess(true)
//       setTimeout(() => setSaveSuccess(false), 3000)
//     } catch (error) {
//       console.error("Erro ao salvar configurações:", error)
//       setSaveError("Ocorreu um erro ao salvar as configurações. Tente novamente.")
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Função para formatar data
//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return "Nunca"

//     const date = new Date(dateString)
//     return date.toLocaleString("pt-BR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   // Tabs de configuração
//   const tabs = [
//     { id: "general", label: "Geral", icon: <Settings size={14} /> },
//     { id: "notifications", label: "Notificações", icon: <Bell size={14} /> },
//     { id: "appearance", label: "Aparência", icon: <Moon size={14} /> },
//     { id: "backup", label: "Backup", icon: <Database size={14} /> },
//     { id: "integrations", label: "Integrações", icon: <Globe size={14} /> },
//   ]

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto px-3 py-3">
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm" className="h-7 px-2 py-1" as={Link} to="/admin">
//               <ArrowLeft size={14} className="mr-1" />
//               Voltar
//             </Button>
//             <h1 className="text-xl font-bold text-gray-800">Configurações do Sistema</h1>
//           </div>
//           <Button size="sm" className="h-7 px-3" onClick={handleSaveSettings} disabled={saving || loading}>
//             {saving ? <RefreshCw size={14} className="mr-1 animate-spin" /> : <Save size={14} className="mr-1" />}
//             Salvar Alterações
//           </Button>
//         </div>

//         {saveSuccess && (
//           <Alert variant="success" className="mb-3">
//             Configurações salvas com sucesso!
//           </Alert>
//         )}

//         {saveError && (
//           <Alert variant="error" className="mb-3" onClose={() => setSaveError(null)}>
//             {saveError}
//           </Alert>
//         )}

//         {loading ? (
//           <div className="flex justify-center items-center py-8">
//             <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//             {/* Sidebar de navegação */}
//             <div className="md:col-span-1">
//               <Card className="bg-white shadow-sm sticky top-3">
//                 <div className="px-3 py-2 bg-gray-50 border-b">
//                   <h2 className="text-sm font-medium">Categorias</h2>
//                 </div>
//                 <CardContent className="p-0">
//                   <nav className="flex flex-col">
//                     {tabs.map((tab) => (
//                       <button
//                         key={tab.id}
//                         className={`flex items-center gap-2 px-3 py-2 text-sm ${
//                           activeTab === tab.id
//                             ? "bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-500"
//                             : "text-gray-700 hover:bg-gray-50"
//                         }`}
//                         onClick={() => setActiveTab(tab.id)}
//                       >
//                         {tab.icon}
//                         {tab.label}
//                       </button>
//                     ))}
//                   </nav>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Conteúdo principal */}
//             <div className="md:col-span-3">
//               {settings && (
//                 <>
//                   {/* Configurações Gerais */}
//                   {activeTab === "general" && (
//                     <Card className="bg-white shadow-sm">
//                       <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-2">
//                         <Settings size={14} className="text-gray-500" />
//                         <h2 className="text-sm font-medium">Configurações Gerais</h2>
//                       </div>
//                       <CardContent className="p-3">
//                         <div className="space-y-4">
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                               <label htmlFor="companyName" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Nome da Empresa/Sistema
//                               </label>
//                               <input
//                                 type="text"
//                                 id="companyName"
//                                 value={settings.general.companyName}
//                                 onChange={(e) => handleInputChange("general", "companyName", e.target.value)}
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                               />
//                             </div>
//                             <div>
//                               <label htmlFor="language" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Idioma
//                               </label>
//                               <select
//                                 id="language"
//                                 value={settings.general.language}
//                                 onChange={(e) => handleInputChange("general", "language", e.target.value)}
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                               >
//                                 <option value="pt-BR">Português (Brasil)</option>
//                                 <option value="en-US">English (US)</option>
//                                 <option value="es">Español</option>
//                               </select>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div>
//                               <label htmlFor="timezone" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Fuso Horário
//                               </label>
//                               <select
//                                 id="timezone"
//                                 value={settings.general.timezone}
//                                 onChange={(e) => handleInputChange("general", "timezone", e.target.value)}
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                               >
//                                 <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
//                                 <option value="America/Manaus">Manaus (GMT-4)</option>
//                                 <option value="America/Belem">Belém (GMT-3)</option>
//                                 <option value="America/Recife">Recife (GMT-3)</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label htmlFor="dateFormat" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Formato de Data
//                               </label>
//                               <select
//                                 id="dateFormat"
//                                 value={settings.general.dateFormat}
//                                 onChange={(e) => handleInputChange("general", "dateFormat", e.target.value)}
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                               >
//                                 <option value="DD/MM/YYYY">DD/MM/YYYY</option>
//                                 <option value="MM/DD/YYYY">MM/DD/YYYY</option>
//                                 <option value="YYYY-MM-DD">YYYY-MM-DD</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label htmlFor="maxUploadSize" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Tamanho Máximo de Upload (MB)
//                               </label>
//                               <input
//                                 type="number"
//                                 id="maxUploadSize"
//                                 value={settings.general.maxUploadSize}
//                                 onChange={(e) => handleInputChange("general", "maxUploadSize", Number(e.target.value))}
//                                 min="1"
//                                 max="50"
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Configurações de Notificações */}
//                   {activeTab === "notifications" && (
//                     <Card className="bg-white shadow-sm">
//                       <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-2">
//                         <Bell size={14} className="text-gray-500" />
//                         <h2 className="text-sm font-medium">Configurações de Notificações</h2>
//                       </div>
//                       <CardContent className="p-3">
//                         <div className="space-y-4">
//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div className="flex items-start gap-2">
//                               <Mail size={16} className="text-gray-500 mt-0.5" />
//                               <div>
//                                 <p className="text-sm font-medium">Notificações por E-mail</p>
//                                 <p className="text-xs text-gray-500">Enviar alertas e relatórios por e-mail</p>
//                               </div>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.notifications.emailNotifications}
//                                 onChange={(e) =>
//                                   handleInputChange("notifications", "emailNotifications", e.target.checked)
//                                 }
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div className="flex items-start gap-2">
//                               <Smartphone size={16} className="text-gray-500 mt-0.5" />
//                               <div>
//                                 <p className="text-sm font-medium">Notificações Push</p>
//                                 <p className="text-xs text-gray-500">Enviar notificações para dispositivos móveis</p>
//                               </div>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.notifications.pushNotifications}
//                                 onChange={(e) =>
//                                   handleInputChange("notifications", "pushNotifications", e.target.checked)
//                                 }
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div className="flex items-start gap-2">
//                               <FileText size={16} className="text-gray-500 mt-0.5" />
//                               <div>
//                                 <p className="text-sm font-medium">Relatórios Diários</p>
//                                 <p className="text-xs text-gray-500">Enviar resumo diário de atividades</p>
//                               </div>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.notifications.dailyReports}
//                                 onChange={(e) => handleInputChange("notifications", "dailyReports", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div className="flex items-start gap-2">
//                               <AlertTriangle size={16} className="text-gray-500 mt-0.5" />
//                               <div>
//                                 <p className="text-sm font-medium">Alertas do Sistema</p>
//                                 <p className="text-xs text-gray-500">Notificar sobre problemas e erros do sistema</p>
//                               </div>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.notifications.systemAlerts}
//                                 onChange={(e) => handleInputChange("notifications", "systemAlerts", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="flex items-center justify-between py-2">
//                             <div className="flex items-start gap-2">
//                               <Settings size={16} className="text-gray-500 mt-0.5" />
//                               <div>
//                                 <p className="text-sm font-medium">Alertas Administrativos</p>
//                                 <p className="text-xs text-gray-500">Notificar sobre ações administrativas</p>
//                               </div>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.notifications.adminAlerts}
//                                 onChange={(e) => handleInputChange("notifications", "adminAlerts", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Configurações de Aparência */}
//                   {activeTab === "appearance" && (
//                     <Card className="bg-white shadow-sm">
//                       <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-2">
//                         <Moon size={14} className="text-gray-500" />
//                         <h2 className="text-sm font-medium">Configurações de Aparência</h2>
//                       </div>
//                       <CardContent className="p-3">
//                         <div className="space-y-4">
//                           <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-2">Tema</label>
//                             <div className="flex gap-2">
//                               <button
//                                 className={`flex flex-col items-center p-3 rounded-md border ${
//                                   settings.appearance.theme === "light"
//                                     ? "border-blue-500 bg-blue-50"
//                                     : "border-gray-200 hover:bg-gray-50"
//                                 }`}
//                                 onClick={() => handleInputChange("appearance", "theme", "light")}
//                               >
//                                 <Sun size={20} className="mb-1 text-amber-500" />
//                                 <span className="text-xs font-medium">Claro</span>
//                               </button>
//                               <button
//                                 className={`flex flex-col items-center p-3 rounded-md border ${
//                                   settings.appearance.theme === "dark"
//                                     ? "border-blue-500 bg-blue-50"
//                                     : "border-gray-200 hover:bg-gray-50"
//                                 }`}
//                                 onClick={() => handleInputChange("appearance", "theme", "dark")}
//                               >
//                                 <Moon size={20} className="mb-1 text-indigo-500" />
//                                 <span className="text-xs font-medium">Escuro</span>
//                               </button>
//                               <button
//                                 className={`flex flex-col items-center p-3 rounded-md border ${
//                                   settings.appearance.theme === "system"
//                                     ? "border-blue-500 bg-blue-50"
//                                     : "border-gray-200 hover:bg-gray-50"
//                                 }`}
//                                 onClick={() => handleInputChange("appearance", "theme", "system")}
//                               >
//                                 <Settings size={20} className="mb-1 text-gray-500" />
//                                 <span className="text-xs font-medium">Sistema</span>
//                               </button>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div>
//                               <p className="text-sm font-medium">Modo Compacto</p>
//                               <p className="text-xs text-gray-500">Reduz o espaçamento entre elementos</p>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.appearance.compactMode}
//                                 onChange={(e) => handleInputChange("appearance", "compactMode", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div>
//                               <p className="text-sm font-medium">Dicas de Ajuda</p>
//                               <p className="text-xs text-gray-500">Exibir dicas e tooltips de ajuda</p>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.appearance.showHelpTips}
//                                 onChange={(e) => handleInputChange("appearance", "showHelpTips", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="flex items-center justify-between py-2">
//                             <div>
//                               <p className="text-sm font-medium">Animações</p>
//                               <p className="text-xs text-gray-500">Habilitar animações na interface</p>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.appearance.animationsEnabled}
//                                 onChange={(e) => handleInputChange("appearance", "animationsEnabled", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Configurações de Backup */}
//                   {activeTab === "backup" && (
//                     <Card className="bg-white shadow-sm">
//                       <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-2">
//                         <Database size={14} className="text-gray-500" />
//                         <h2 className="text-sm font-medium">Configurações de Backup</h2>
//                       </div>
//                       <CardContent className="p-3">
//                         <div className="space-y-4">
//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div>
//                               <p className="text-sm font-medium">Backup Automático</p>
//                               <p className="text-xs text-gray-500">Realizar backups automáticos do sistema</p>
//                             </div>
//                             <label className="relative inline-flex items-center cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={settings.backup.autoBackup}
//                                 onChange={(e) => handleInputChange("backup", "autoBackup", e.target.checked)}
//                                 className="sr-only peer"
//                               />
//                               <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                             </label>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                             <div>
//                               <label htmlFor="backupFrequency" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Frequência
//                               </label>
//                               <select
//                                 id="backupFrequency"
//                                 value={settings.backup.backupFrequency}
//                                 onChange={(e) => handleInputChange("backup", "backupFrequency", e.target.value)}
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                                 disabled={!settings.backup.autoBackup}
//                               >
//                                 <option value="daily">Diário</option>
//                                 <option value="weekly">Semanal</option>
//                                 <option value="monthly">Mensal</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label htmlFor="backupTime" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Horário
//                               </label>
//                               <input
//                                 type="time"
//                                 id="backupTime"
//                                 value={settings.backup.backupTime}
//                                 onChange={(e) => handleInputChange("backup", "backupTime", e.target.value)}
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                                 disabled={!settings.backup.autoBackup}
//                               />
//                             </div>
//                             <div>
//                               <label htmlFor="retentionDays" className="block text-xs font-medium text-gray-700 mb-1">
//                                 Retenção (dias)
//                               </label>
//                               <input
//                                 type="number"
//                                 id="retentionDays"
//                                 value={settings.backup.retentionDays}
//                                 onChange={(e) => handleInputChange("backup", "retentionDays", Number(e.target.value))}
//                                 min="1"
//                                 max="365"
//                                 className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-8"
//                                 disabled={!settings.backup.autoBackup}
//                               />
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between py-2 mt-2 bg-gray-50 rounded-md p-2">
//                             <div>
//                               <p className="text-sm font-medium">Último backup</p>
//                               <p className="text-xs text-gray-500">{formatDate(settings.backup.lastBackup)}</p>
//                             </div>
//                             <Button size="sm" className="h-7 px-2 py-1">
//                               <Database size={14} className="mr-1" />
//                               Backup Manual
//                             </Button>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}

//                   {/* Configurações de Integrações */}
//                   {activeTab === "integrations" && (
//                     <Card className="bg-white shadow-sm">
//                       <div className="px-3 py-2 bg-gray-50 border-b flex items-center gap-2">
//                         <Globe size={14} className="text-gray-500" />
//                         <h2 className="text-sm font-medium">Configurações de Integrações</h2>
//                       </div>
//                       <CardContent className="p-3">
//                         <div className="space-y-4">
//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div className="flex items-start gap-2">
//                               <div>
//                                 <p className="text-sm font-medium">API</p>
//                                 <p className="text-xs text-gray-500">Habilitar acesso à API do sistema</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Badge variant={settings.integrations.apiEnabled ? "success" : "error"}>
//                                 {settings.integrations.apiEnabled ? "Ativo" : "Inativo"}
//                               </Badge>
//                               <label className="relative inline-flex items-center cursor-pointer">
//                                 <input
//                                   type="checkbox"
//                                   checked={settings.integrations.apiEnabled}
//                                   onChange={(e) => handleInputChange("integrations", "apiEnabled", e.target.checked)}
//                                   className="sr-only peer"
//                                 />
//                                 <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                               </label>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between py-2 border-b border-gray-100">
//                             <div className="flex items-start gap-2">
//                               <div>
//                                 <p className="text-sm font-medium">Webhooks</p>
//                                 <p className="text-xs text-gray-500">Habilitar webhooks para eventos do sistema</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Badge variant={settings.integrations.webhooksEnabled ? "success" : "error"}>
//                                 {settings.integrations.webhooksEnabled ? "Ativo" : "Inativo"}
//                               </Badge>
//                               <label className="relative inline-flex items-center cursor-pointer">
//                                 <input
//                                   type="checkbox"
//                                   checked={settings.integrations.webhooksEnabled}
//                                   onChange={(e) =>
//                                     handleInputChange("integrations", "webhooksEnabled", e.target.checked)
//                                   }
//                                   className="sr-only peer"
//                                 />
//                                 <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                               </label>
//                             </div>
//                           </div>

//                           <div className="flex items-center justify-between py-2">
//                             <div className="flex items-start gap-2">
//                               <div>
//                                 <p className="text-sm font-medium">Serviços Externos</p>
//                                 <p className="text-xs text-gray-500">Permitir integração com serviços externos</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Badge variant={settings.integrations.externalServicesEnabled ? "success" : "error"}>
//                                 {settings.integrations.externalServicesEnabled ? "Ativo" : "Inativo"}
//                               </Badge>
//                               <label className="relative inline-flex items-center cursor-pointer">
//                                 <input
//                                   type="checkbox"
//                                   checked={settings.integrations.externalServicesEnabled}
//                                   onChange={(e) =>
//                                     handleInputChange("integrations", "externalServicesEnabled", e.target.checked)
//                                   }
//                                   className="sr-only peer"
//                                 />
//                                 <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
//                               </label>
//                             </div>
//                           </div>

//                           <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
//                             <div className="flex items-start gap-2">
//                               <HelpCircle size={16} className="text-blue-500 mt-0.5" />
//                               <div>
//                                 <p className="text-sm font-medium text-blue-700">Chaves de API</p>
//                                 <p className="text-xs text-blue-600 mb-2">
//                                   Gerencie suas chaves de API e credenciais de integração na página de segurança.
//                                 </p>
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   className="h-7 px-2 py-1 bg-white"
//                                   as={Link}
//                                   to="/admin/security"
//                                 >
//                                   Ir para Segurança
//                                 </Button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   )
// }

// export default AdminSettings
// // 