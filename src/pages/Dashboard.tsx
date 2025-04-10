"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import api from "../services/api"
import Layout from "../components/Layout"
import { Award, Calendar, Gift, MessageSquare } from 'lucide-react'
import { getRandomDayMessage } from "../utils/dailyMessages"

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
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <motion.div
              className="welcome-section"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1>Olá, {currentUser?.name.split(" ")[0] || "Colaborador"}!</h1>
              <p className="date-display">{formatDate(currentTime)}</p>
            </motion.div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Mural de Mensagem do Dia */}
          <motion.section
            className="message-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2>
                <MessageSquare size={18} /> Mensagem do Dia
              </h2>
            </div>
            <div className="message-container">
              <div className="message-content">
                <p>{dayMessage}</p>
              </div>
            </div>
          </motion.section>

          {/* Seção de Ranking Semanal */}
          <motion.section
            className="ranking-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="section-header">
              <h2>
                <Award size={18} /> Ranking Semanal
              </h2>
            </div>
            <div className="ranking-list">
              {rankingUsers.map((user) => (
                <div key={user.id} className={`ranking-item position-${user.position}`}>
                  <div className="ranking-position">
                    {user.position === 1 && "🥇"}
                    {user.position === 2 && "🥈"}
                    {user.position === 3 && "🥉"}
                    {user.position > 3 && `#${user.position}`}
                  </div>
                  <div className="ranking-user">
                    {user.avatar ? (
                      <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="ranking-avatar" />
                    ) : (
                      <div className="ranking-avatar-placeholder">{user.name.charAt(0)}</div>
                    )}
                    <span className="ranking-name">{user.name}</span>
                  </div>
                  <div className="ranking-score">{user.score} pts</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Seção de Aniversariantes */}
          <motion.section
            className="birthday-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="section-header">
              <h2>
                <Calendar size={18} /> Aniversariantes do Mês
              </h2>
            </div>

            {birthdays.length > 0 ? (
              <div className="birthday-list">
                {birthdays.map((birthday) => (
                  <div key={birthday.id} className={`birthday-item ${birthday.isToday ? "today" : ""}`}>
                    <div className="birthday-date-badge">{birthday.date}</div>
                    <div className="birthday-user">
                      {birthday.avatar ? (
                        <img src={birthday.avatar || "/placeholder.svg"} alt={birthday.name} className="birthday-avatar" />
                      ) : (
                        <div className="birthday-avatar-placeholder">{birthday.name.charAt(0)}</div>
                      )}
                      <span className="birthday-name">{birthday.name}</span>
                    </div>
                    {birthday.isToday && (
                      <div className="birthday-today">
                        <Gift size={16} />
                        <span>Hoje!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-birthdays">
                <p>Nenhum aniversariante este mês</p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
