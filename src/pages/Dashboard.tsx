"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import api from "@/services/api"
import Layout from "@/components/Layout"
import { Award, Calendar, Gift, MessageSquare } from "lucide-react"
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

interface RankingUser {
  id: string
  name: string
  avatar?: string
  score: number
  position: number
}

interface Birthday {
  id: string
  name: string
  avatar?: string
  date: string
  day: number
  isToday: boolean
}

function Dashboard() {
  // Estados
  const [currentTime, setCurrentTime] = useState(new Date())
  const [rankingUsers, setRankingUsers] = useState<RankingUser[]>([])
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dayMessage, setDayMessage] = useState("")

  // Efeito para buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Tentar buscar dados da API
        try {
          const [rankingResponse, birthdaysResponse, userResponse] = await Promise.all([
            api.get("/dashboard/ranking"),
            api.get("/dashboard/birthdays"),
            api.get("/user/profile"),
          ])

          setRankingUsers(rankingResponse.data)

          // Ordenar aniversariantes por dia do mês
          const sortedBirthdays = birthdaysResponse.data.sort((a: Birthday, b: Birthday) => a.day - b.day)
          setBirthdays(sortedBirthdays)

          setCurrentUser(userResponse.data)
        } catch (error) {
          console.error("Erro ao buscar dados da API, usando dados mockados:", error)

          // Dados mockados [md]
          const mockUser: User = {
            id: "user-123",
            name: "João Silva",
            avatar: "https://i.pravatar.cc/150?img=3",
            department: "Desenvolvimento",
          }

          const mockRanking: RankingUser[] = [
            { id: "user-3", name: "Mariana Costa", avatar: "https://i.pravatar.cc/150?img=5", score: 100, position: 1 },
            { id: "user-1", name: "Ana Souza", avatar: "https://i.pravatar.cc/150?img=1", score: 95, position: 2 },
            { id: "user-6", name: "Roberto Alves", avatar: "https://i.pravatar.cc/150?img=12", score: 90, position: 3 },
            { id: "user-5", name: "Juliana Lima", avatar: "https://i.pravatar.cc/150?img=9", score: 85, position: 4 },
            { id: "user-2", name: "Carlos Mendes", avatar: "https://i.pravatar.cc/150?img=4", score: 80, position: 5 },
          ]

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
          setRankingUsers(mockRanking)
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

    return () => {
      clearInterval(clockInterval)
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mural de Mensagem do Dia */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-3"
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

          {/* Seção de Ranking Semanal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="md:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <Award size={18} className="text-blue-500" />
                <h2 className="text-lg font-semibold">Ranking Semanal</h2>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {rankingUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 ${user.position === 1 ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 text-center">
                          {user.position === 1 && <span className="text-xl">🥇</span>}
                          {user.position === 2 && <span className="text-xl">🥈</span>}
                          {user.position === 3 && <span className="text-xl">🥉</span>}
                          {user.position > 3 && (
                            <span className="text-sm font-medium text-gray-500">#{user.position}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar src={user.avatar} alt={user.name} className="w-8 h-8" />
                          <span className="font-medium text-sm">{user.name}</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-600">{user.score} pts</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Seção de Aniversariantes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="md:col-span-1"
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
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
