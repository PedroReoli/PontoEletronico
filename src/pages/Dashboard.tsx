"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Calendar, Gift, MessageSquare, Coffee } from "lucide-react"
import { getRandomDayMessage } from "@/utils/dailyMessages"
import { Avatar } from "@/components/ui/Avatar"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Interfaces
interface User {
  id: string
  name: string
  avatar?: string
  department: string
}

interface Birthday {
  id: string
  name: string
  avatar?: string
  date: string
  day: number
  isToday: boolean
}

// Dicas rápidas para o card de recursos
const quickTips = [
  {
    title: "Dica de produtividade",
    content: "Método Pomodoro: foco total por 25 minutos e pausa de 5.",
    icon: <Coffee size={18} className="text-blue-500" />,
  },
  {
    title: "Dica de produtividade",
    content: "Um bom café renova o foco e a energia.",
    icon: <Coffee size={18} className="text-blue-500" />,
  },
  {
    title: "Dica de Produtividade",
    content: "Comece pelo mais difícil. O resto será mais leve.",
    icon: <Coffee size={18} className="text-blue-500" />,
  },
]

function Dashboard() {
  // Estados
  const [currentTime, setCurrentTime] = useState(new Date())
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dayMessage, setDayMessage] = useState("")
  const [currentTip, setCurrentTip] = useState(0)

  // Efeito para buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const [birthdaysResponse, userResponse] = await Promise.all([
            api.get("/dashboard/birthdays"),
            api.get("/user/profile"),
          ])

          // Ordenar aniversariantes por dia do mês
          const sortedBirthdays = birthdaysResponse.data.sort((a: Birthday, b: Birthday) => a.day - b.day)
          setBirthdays(sortedBirthdays)

          setCurrentUser(userResponse.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados
          const mockUser: User = {
            id: "user-123",
            name: "João Silva",
            avatar: "https://i.pravatar.cc/150?img=3",
            department: "Desenvolvimento",
          }

          // Aniversariantes do mês atual ordenados por dia
          const currentMonth = new Date().getMonth() + 1
          const mockBirthdays: Birthday[] = [
            {
              id: "user-5",
              name: "Juliana Lima",
              avatar: "https://i.pravatar.cc/150?img=9",
              date: `10/${currentMonth < 10 ? "0" + currentMonth : currentMonth}`,
              day: 10,
              isToday: new Date().getDate() === 10,
            },
            {
              id: "user-2",
              name: "Carlos Mendes",
              avatar: "https://i.pravatar.cc/150?img=4",
              date: `15/${currentMonth < 10 ? "0" + currentMonth : currentMonth}`,
              day: 15,
              isToday: false,
            },
            {
              id: "user-7",
              name: "Fernanda Dias",
              avatar: "https://i.pravatar.cc/150?img=10",
              date: `22/${currentMonth < 10 ? "0" + currentMonth : currentMonth}`,
              day: 22,
              isToday: new Date().getDate() === 22,
            },
          ]

          setCurrentUser(mockUser)
          setBirthdays(mockBirthdays)
        }

        // Obter mensagem do dia aleatória
        setDayMessage(getRandomDayMessage())
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Atualizar o relógio a cada minuto
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Alternar entre as dicas a cada 10 segundos
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % quickTips.length)
    }, 10000)

    return () => {
      clearInterval(clockInterval)
      clearInterval(tipInterval)
    }
  }, [])

  // Função para formatar a data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4">
        <header className="py-6 mb-6">
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Olá, {currentUser?.name.split(" ")[0] || "Colaborador"}!
            </h1>
            <p className="text-gray-500 mt-1">{formatDate(currentTime)}</p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mural de Mensagem do Dia */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <MessageSquare size={18} className="text-blue-500" />
                <h2 className="text-lg font-semibold">Mensagem do Dia</h2>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-md p-4 italic text-gray-700">
                  <p>{dayMessage}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Seção de Aniversariantes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Calendar size={18} className="text-blue-500" />
                <h2 className="text-lg font-semibold">Aniversariantes do Mês</h2>
              </CardHeader>
              <CardContent className="p-0">
                {birthdays.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {birthdays.map((birthday) => (
                      <div
                        key={birthday.id}
                        className={`flex items-center justify-between p-4 ${
                          birthday.isToday ? "bg-success-light" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={birthday.isToday ? "success" : "default"} className="w-12 text-center">
                            {birthday.date}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Avatar src={birthday.avatar} alt={birthday.name} className="w-8 h-8" />
                            <span className="font-medium text-sm">{birthday.name}</span>
                          </div>
                        </div>
                        {birthday.isToday && (
                          <div className="flex items-center gap-1 text-success-dark">
                            <Gift size={16} />
                            <span className="text-xs font-medium">Hoje!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>Nenhum aniversariante este mês</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Novo Card - Recursos para Funcionários */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                {quickTips[currentTip].icon}
                <h2 className="text-lg font-semibold">{quickTips[currentTip].title}</h2>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <p className="text-gray-700">{quickTips[currentTip].content}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    {quickTips.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full w-6 ${index === currentTip ? "bg-blue-500" : "bg-gray-200"}`}
                      ></div>
                    ))}
                  </div>
                
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
