import { PrismaClient, Role, EntryType, AdjustmentStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { addDays, subDays, setHours, setMinutes, subMonths } from "date-fns"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Configuração para __dirname em ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // Criar pasta de uploads se não existir
  const uploadDir = path.join(__dirname, "../uploads")
  if (!fs.existsSync(uploadDir)) {
    console.log("📁 Criando pasta de uploads...")
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Limpar dados existentes
  console.log("🧹 Limpando dados existentes...")
  await prisma.auditLog.deleteMany({})
  await prisma.report.deleteMany({})
  await prisma.timeEntry.deleteMany({})
  await prisma.adjustmentRequest.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.shiftType.deleteMany({})
  await prisma.shiftGroup.deleteMany({})
  await prisma.company.deleteMany({})

  // Criar empresas
  console.log("🏢 Criando empresas...")
  const empresa1 = await prisma.company.create({
    data: {
      name: "TechSolutions Ltda",
      active: true,
    },
  })

  const empresa2 = await prisma.company.create({
    data: {
      name: "Indústrias Progresso S.A.",
      active: true,
    },
  })

  const empresa3 = await prisma.company.create({
    data: {
      name: "Comércio Global Ltda",
      active: false,
    },
  })

  // Criar grupos de jornada
  console.log("⏰ Criando grupos de jornada...")
  const jornadaComercial = await prisma.shiftGroup.create({
    data: {
      name: "Jornada Comercial",
      startTime: "09:00",
      endTime: "18:00",
      breakDuration: 60,
      companyId: empresa1.id,
    },
  })

  const jornadaFlexivel = await prisma.shiftGroup.create({
    data: {
      name: "Jornada Flexível",
      startTime: "08:00",
      endTime: "17:00",
      breakDuration: 60,
      companyId: empresa1.id,
    },
  })

  const jornadaIndustrial = await prisma.shiftGroup.create({
    data: {
      name: "Jornada Industrial",
      startTime: "07:00",
      endTime: "16:00",
      breakDuration: 60,
      companyId: empresa2.id,
    },
  })

  const jornadaNoturna = await prisma.shiftGroup.create({
    data: {
      name: "Jornada Noturna",
      startTime: "22:00",
      endTime: "06:00",
      breakDuration: 60,
      companyId: empresa2.id,
    },
  })

  // Criar tipos de plantão
  console.log("🔄 Criando tipos de plantão...")
  const plantaoNormal = await prisma.shiftType.create({
    data: {
      name: "Plantão Normal",
      description: "Plantão padrão de 8 horas",
      companyId: empresa1.id,
    },
  })

  const plantao12x36 = await prisma.shiftType.create({
    data: {
      name: "Plantão 12x36",
      description: "Plantão de 12 horas com folga de 36 horas",
      companyId: empresa2.id,
    },
  })

  const plantaoFimDeSemana = await prisma.shiftType.create({
    data: {
      name: "Plantão Fim de Semana",
      description: "Plantão apenas aos sábados e domingos",
      companyId: empresa1.id,
    },
  })

  // Criar senha padrão
  const hashSenha = await bcrypt.hash("123456", 10)

  // Criar usuários
  console.log("👥 Criando usuários...")

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@exemplo.com",
      password: hashSenha,
      role: Role.ADMIN,
      companyId: empresa1.id,
      active: true,
    },
  })

  // Gerentes
  const gerente1 = await prisma.user.create({
    data: {
      name: "Carlos Gerente",
      email: "gerente@exemplo.com",
      password: hashSenha,
      role: Role.MANAGER,
      companyId: empresa1.id,
      shiftGroupId: jornadaComercial.id,
      active: true,
    },
  })

  const gerente2 = await prisma.user.create({
    data: {
      name: "Ana Supervisora",
      email: "supervisora@exemplo.com",
      password: hashSenha,
      role: Role.MANAGER,
      companyId: empresa2.id,
      shiftGroupId: jornadaIndustrial.id,
      active: true,
    },
  })

  // Funcionários
  const funcionario1 = await prisma.user.create({
    data: {
      name: "João Silva",
      email: "joao@exemplo.com",
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa1.id,
      shiftGroupId: jornadaComercial.id,
      managerId: gerente1.id,
      active: true,
    },
  })

  const funcionario2 = await prisma.user.create({
    data: {
      name: "Maria Oliveira",
      email: "maria@exemplo.com",
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa1.id,
      shiftGroupId: jornadaFlexivel.id,
      managerId: gerente1.id,
      active: true,
    },
  })

  const funcionario3 = await prisma.user.create({
    data: {
      name: "Pedro Santos",
      email: "pedro@exemplo.com",
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa2.id,
      shiftGroupId: jornadaIndustrial.id,
      managerId: gerente2.id,
      active: true,
    },
  })

  const funcionario4 = await prisma.user.create({
    data: {
      name: "Lucia Ferreira",
      email: "lucia@exemplo.com",
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa2.id,
      shiftGroupId: jornadaNoturna.id,
      managerId: gerente2.id,
      active: true,
    },
  })

  const funcionario5 = await prisma.user.create({
    data: {
      name: "Roberto Almeida",
      email: "roberto@exemplo.com",
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa1.id,
      shiftGroupId: jornadaComercial.id,
      managerId: gerente1.id,
      active: false, // Usuário inativo
    },
  })

  // Criar registros de ponto para os últimos 30 dias
  console.log("🕒 Criando registros de ponto...")

  const hoje = new Date()

  // Função para criar registros de ponto para um usuário em um dia específico
  async function criarRegistrosDia(userId: string, data: Date, entrou = true, atrasado = false) {
    const dia = new Date(data)

    if (entrou) {
      // Entrada
      await prisma.timeEntry.create({
        data: {
          type: EntryType.CLOCK_IN,
          timestamp: setMinutes(setHours(dia, atrasado ? 9 : 8), atrasado ? 15 : 55),
          userId,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })

      // Saída para almoço
      await prisma.timeEntry.create({
        data: {
          type: EntryType.BREAK_START,
          timestamp: setMinutes(setHours(dia, 12), 0),
          userId,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })

      // Retorno do almoço
      await prisma.timeEntry.create({
        data: {
          type: EntryType.BREAK_END,
          timestamp: setMinutes(setHours(dia, 13), 0),
          userId,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })

      // Saída
      await prisma.timeEntry.create({
        data: {
          type: EntryType.CLOCK_OUT,
          timestamp: setMinutes(setHours(dia, 18), 5),
          userId,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })
    }
  }

  // Criar registros para os últimos 30 dias
  for (let i = 30; i >= 0; i--) {
    const dia = subDays(hoje, i)
    const diaSemana = dia.getDay() // 0 = domingo, 6 = sábado

    // Pular finais de semana para alguns funcionários
    if ((diaSemana === 0 || diaSemana === 6) && [funcionario1.id, funcionario2.id].includes(funcionario1.id)) continue

    // Funcionário 1 - registros normais
    await criarRegistrosDia(funcionario1.id, dia, true, i % 7 === 3) // Atrasa uma vez por semana

    // Funcionário 2 - falta algumas vezes
    await criarRegistrosDia(funcionario2.id, dia, i % 10 !== 3)

    // Funcionário 3 - falta em dias diferentes
    await criarRegistrosDia(funcionario3.id, dia, i % 8 !== 5)

    // Funcionário 4 - trabalha em turno noturno
    if (diaSemana !== 0 && diaSemana !== 6) {
      // Não trabalha nos fins de semana
      const diaNoturno = new Date(dia)

      // Entrada à noite
      await prisma.timeEntry.create({
        data: {
          type: EntryType.CLOCK_IN,
          timestamp: setMinutes(setHours(diaNoturno, 22), 0),
          userId: funcionario4.id,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })

      // Intervalo
      await prisma.timeEntry.create({
        data: {
          type: EntryType.BREAK_START,
          timestamp: setMinutes(setHours(addDays(diaNoturno, 1), 2), 0),
          userId: funcionario4.id,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })

      await prisma.timeEntry.create({
        data: {
          type: EntryType.BREAK_END,
          timestamp: setMinutes(setHours(addDays(diaNoturno, 1), 2), 30),
          userId: funcionario4.id,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })

      // Saída de manhã
      await prisma.timeEntry.create({
        data: {
          type: EntryType.CLOCK_OUT,
          timestamp: setMinutes(setHours(addDays(diaNoturno, 1), 6), 0),
          userId: funcionario4.id,
          latitude: -23.5505 + Math.random() * 0.01,
          longitude: -46.6333 + Math.random() * 0.01,
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      })
    }
  }

  // Criar solicitações de ajuste
  console.log("📝 Criando solicitações de ajuste...")

  // Solicitação pendente
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 2),
      entryType: EntryType.CLOCK_IN,
      requestedTime: "08:30",
      reason: "Esqueci de registrar a entrada no horário correto.",
      status: AdjustmentStatus.PENDING,
      userId: funcionario1.id,
      managerId: gerente1.id,
    },
  })

  // Solicitação aprovada
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 3),
      entryType: EntryType.BREAK_END,
      requestedTime: "13:15",
      reason: "Tive que estender meu horário de almoço devido a um compromisso médico.",
      status: AdjustmentStatus.APPROVED,
      userId: funcionario2.id,
      managerId: gerente1.id,
      responseComment: "Ajuste aprovado conforme comprovante médico.",
      responseDate: subDays(hoje, 2),
    },
  })

  // Solicitação rejeitada
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 4),
      entryType: EntryType.CLOCK_OUT,
      requestedTime: "19:00",
      reason: "Fiquei até mais tarde finalizando um projeto.",
      status: AdjustmentStatus.REJECTED,
      userId: funcionario3.id,
      managerId: gerente2.id,
      responseComment: "Não houve autorização prévia para hora extra.",
      responseDate: subDays(hoje, 3),
    },
  })

  // Mais solicitações pendentes
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 1),
      entryType: EntryType.CLOCK_IN,
      requestedTime: "08:15",
      reason: "Problemas com o transporte público.",
      status: AdjustmentStatus.PENDING,
      userId: funcionario2.id,
      managerId: gerente1.id,
    },
  })

  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 1),
      entryType: EntryType.CLOCK_OUT,
      requestedTime: "18:45",
      reason: "Saí mais cedo com autorização verbal do gestor.",
      status: AdjustmentStatus.PENDING,
      userId: funcionario3.id,
      managerId: gerente2.id,
    },
  })

  // Criar relatórios
  console.log("📊 Criando relatórios...")

  // Relatórios para o funcionário 1
  for (let i = 1; i <= 3; i++) {
    const reportDate = subMonths(hoje, i)
    const month = reportDate.getMonth() + 1
    const year = reportDate.getFullYear()

    await prisma.report.create({
      data: {
        month,
        year,
        fileUrl: `/uploads/report-${funcionario1.id}-${year}-${month}.pdf`,
        accessedAt: i === 1 ? subDays(hoje, 5) : null, // Apenas o mais recente foi acessado
        userId: funcionario1.id,
      },
    })
  }

  // Relatórios para o funcionário 2
  for (let i = 1; i <= 2; i++) {
    const reportDate = subMonths(hoje, i)
    const month = reportDate.getMonth() + 1
    const year = reportDate.getFullYear()

    await prisma.report.create({
      data: {
        month,
        year,
        fileUrl: `/uploads/report-${funcionario2.id}-${year}-${month}.pdf`,
        accessedAt: null,
        userId: funcionario2.id,
      },
    })
  }

  // Criar logs de auditoria
  console.log("📝 Criando logs de auditoria...")

  // Log de login
  await prisma.auditLog.create({
    data: {
      action: "LOGIN",
      entityType: "USER",
      entityId: admin.id,
      details: "Login bem-sucedido",
      ipAddress: "192.168.1.1",
      userId: admin.id,
    },
  })

  // Log de criação de usuário
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entityType: "USER",
      entityId: funcionario5.id,
      details: `Usuário ${funcionario5.name} criado`,
      ipAddress: "192.168.1.1",
      userId: admin.id,
    },
  })

  // Log de atualização de empresa
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entityType: "COMPANY",
      entityId: empresa1.id,
      details: `Empresa ${empresa1.name} atualizada`,
      ipAddress: "192.168.1.1",
      userId: admin.id,
    },
  })

  // Log de aprovação de ajuste
  await prisma.auditLog.create({
    data: {
      action: "APPROVE",
      entityType: "ADJUSTMENT",
      entityId: "2", // ID da solicitação aprovada
      details: "Solicitação de ajuste aprovada",
      ipAddress: "192.168.1.2",
      userId: gerente1.id,
    },
  })

  // Log de rejeição de ajuste
  await prisma.auditLog.create({
    data: {
      action: "REJECT",
      entityType: "ADJUSTMENT",
      entityId: "3", // ID da solicitação rejeitada
      details: "Solicitação de ajuste rejeitada",
      ipAddress: "192.168.1.3",
      userId: gerente2.id,
    },
  })

  console.log("✅ Seed concluído com sucesso!")
  console.log("\nCredenciais para teste:")
  console.log("- Admin: admin@exemplo.com / 123456")
  console.log("- Gerente: gerente@exemplo.com / 123456")
  console.log("- Funcionário: joao@exemplo.com / 123456")
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
