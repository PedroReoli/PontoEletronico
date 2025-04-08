import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client"
import { errorHandler } from "./middlewares/errorHandler.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import companyRoutes from "./routes/companies.js"
import timeEntryRoutes from "./routes/timeEntries.js"
import shiftGroupRoutes from "./routes/shiftGroups.js"
import shiftTypeRoutes from "./routes/shiftTypes.js"
import adjustmentRoutes from "./routes/adjustments.js"
import reportRoutes from "./routes/reports.js"
import path from "path"
import { fileURLToPath } from "url"

// Configuração do ambiente
dotenv.config()

// Configuração para __dirname em ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Inicialização do Prisma
export const prisma = new PrismaClient()

// Configuração do Express
const app = express()

// Configurar CORS com opções permissivas para desenvolvimento
app.use(
  cors({
    origin: true, // Permitir qualquer origem
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Modificar a seção de configuração CSP para desativá-la completamente em desenvolvimento
// Substitua o bloco if (process.env.DISABLE_CSP !== "true") { ... } por:

// Desativar CSP completamente em desenvolvimento
if (process.env.NODE_ENV === "development") {
  console.log("CSP desativado para ambiente de desenvolvimento")
  // Não aplicar CSP em desenvolvimento
} else {
  app.use((req, res, next) => {
    // Política CSP para produção
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'",
    )
    next()
  })
}

app.use(express.json())

// Pasta para uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Rotas da API
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin/users", userRoutes)
app.use("/api/admin/companies", companyRoutes)
app.use("/api/admin/shift-groups", shiftGroupRoutes)
app.use("/api/admin/shift-types", shiftTypeRoutes)
app.use("/api/time-entries", timeEntryRoutes)
app.use("/api/manager/adjustments", adjustmentRoutes)
app.use("/api/manager/team", userRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/admin/dashboard-stats", async (req, res) => {
  try {
    const [totalUsers, totalCompanies, totalShiftGroups, totalShiftTypes, pendingAdjustments] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.shiftGroup.count(),
      prisma.shiftType.count(),
      prisma.adjustmentRequest.count({ where: { status: "PENDING" } }),
    ])

    res.json({
      totalUsers,
      totalCompanies,
      totalShiftGroups,
      totalShiftTypes,
      pendingAdjustments,
    })
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    res.status(500).json({ message: "Erro ao buscar estatísticas" })
  }
})

// Middleware de tratamento de erros
app.use(errorHandler)

// Inicialização do servidor
const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`Servidor API rodando na porta ${PORT}`)
})
