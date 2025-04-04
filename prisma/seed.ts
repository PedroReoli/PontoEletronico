import { PrismaClient, UserRole, ShiftType, PunchType, RequestStatus, ActionType } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seed do banco de dados...")

  // Limpar dados existentes
  console.log("Limpando dados existentes...")
  await prisma.auditLog.deleteMany()
  await prisma.report.deleteMany()
  await prisma.adjustmentRequest.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.punchRecord.deleteMany()
  await prisma.customSchedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.scheduleGroup.deleteMany()
  await prisma.company.deleteMany()

  // ==================== EMPRESAS ====================
  console.log("Criando empresas...")
  const techCorp = await prisma.company.create({
    data: {
      name: "TechCorp",
      logoUrl: "https://via.placeholder.com/150?text=TechCorp",
    },
  })

  const healthPlus = await prisma.company.create({
    data: {
      name: "HealthPlus",
      logoUrl: "https://via.placeholder.com/150?text=HealthPlus",
    },
  })

  const eduSmart = await prisma.company.create({
    data: {
      name: "EduSmart",
      logoUrl: "https://via.placeholder.com/150?text=EduSmart",
    },
  })

  const logisticsPro = await prisma.company.create({
    data: {
      name: "LogisticsPro",
      logoUrl: "https://via.placeholder.com/150?text=LogisticsPro",
    },
  })

  // ==================== GRUPOS DE JORNADA ====================
  console.log("Criando grupos de jornada...")

  // TechCorp - Grupos de Jornada
  const standardSchedule = await prisma.scheduleGroup.create({
    data: {
      name: "Padrão Comercial",
      entryTime: "09:00",
      exitTime: "18:00",
      breakDuration: 60, // 1 hora
      companyId: techCorp.id,
      // Removido workDays
    },
  })

  const flexSchedule = await prisma.scheduleGroup.create({
    data: {
      name: "Horário Flexível",
      entryTime: "08:00",
      exitTime: "17:00",
      breakDuration: 60, // 1 hora
      companyId: techCorp.id,
      // Removido workDays
    },
  })

  const devSchedule = await prisma.scheduleGroup.create({
    data: {
      name: "Desenvolvedores",
      entryTime: "10:00",
      exitTime: "19:00",
      breakDuration: 60, // 1 hora
      companyId: techCorp.id,
      // Removido workDays
    },
  })

  // HealthPlus - Grupos de Jornada
  const morningShift = await prisma.scheduleGroup.create({
    data: {
      name: "Turno Matutino",
      entryTime: "07:00",
      exitTime: "13:00",
      breakDuration: 30, // 30 minutos
      companyId: healthPlus.id,
      // Removido workDays
    },
  })

  const afternoonShift = await prisma.scheduleGroup.create({
    data: {
      name: "Turno Vespertino",
      entryTime: "13:00",
      exitTime: "19:00",
      breakDuration: 30, // 30 minutos
      companyId: healthPlus.id,
      // Removido workDays
    },
  })

  const nightShift = await prisma.scheduleGroup.create({
    data: {
      name: "Turno Noturno",
      entryTime: "19:00",
      exitTime: "07:00",
      breakDuration: 60, // 1 hora
      companyId: healthPlus.id,
      // Removido workDays
    },
  })

  // ==================== USUÁRIOS ====================
  console.log("Criando usuários...")

  // Função para criar hash de senha
  const hashPassword = async (password: string) => await bcrypt.hash(password, 10)

  // TechCorp - Usuários
  const adminPassword = await hashPassword("admin123")
  const managerPassword = await hashPassword("manager123")
  const employeePassword = await hashPassword("employee123")

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@techcorp.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      companyId: techCorp.id,
      scheduleGroupId: standardSchedule.id,
    },
  })

  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@techcorp.com",
      password: managerPassword,
      role: UserRole.MANAGER,
      companyId: techCorp.id,
      scheduleGroupId: standardSchedule.id,
    },
  })

  const employee1 = await prisma.user.create({
    data: {
      name: "John Employee",
      email: "john@techcorp.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: techCorp.id,
      scheduleGroupId: flexSchedule.id,
    },
  })

  const employee2 = await prisma.user.create({
    data: {
      name: "Jane Employee",
      email: "jane@techcorp.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: techCorp.id,
      scheduleGroupId: flexSchedule.id,
    },
  })

  const employee3 = await prisma.user.create({
    data: {
      name: "Robert Developer",
      email: "robert@techcorp.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: techCorp.id,
      scheduleGroupId: devSchedule.id,
    },
  })

  // HealthPlus - Usuários
  const healthAdmin = await prisma.user.create({
    data: {
      name: "Health Admin",
      email: "admin@healthplus.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      companyId: healthPlus.id,
      scheduleGroupId: morningShift.id,
    },
  })

  const nurse1 = await prisma.user.create({
    data: {
      name: "Nurse Smith",
      email: "nurse@healthplus.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: healthPlus.id,
      scheduleGroupId: nightShift.id,
    },
  })

  const nurse2 = await prisma.user.create({
    data: {
      name: "Nurse Jessica",
      email: "jessica@healthplus.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: healthPlus.id,
      scheduleGroupId: nightShift.id,
    },
  })

  // ==================== JORNADAS PERSONALIZADAS ====================
  console.log("Criando jornadas personalizadas...")

  // Jornada personalizada para Jane
  await prisma.customSchedule.create({
    data: {
      userId: employee2.id,
      entryTime: "10:00",
      exitTime: "19:00",
      breakDuration: 60,
      // Removido workDays
    },
  })

  // Jornada personalizada para Robert
  await prisma.customSchedule.create({
    data: {
      userId: employee3.id,
      entryTime: "11:00",
      exitTime: "20:00",
      breakDuration: 60,
      // Removido workDays
    },
  })

  // ==================== PLANTÕES ====================
  console.log("Criando plantões...")

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const twoWeeksFromNow = new Date(today)
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)

  // Plantões para enfermeiros
  await prisma.shift.create({
    data: {
      userId: nurse1.id,
      date: today,
      shiftType: ShiftType.TWELVE_THIRTY_SIX,
      startTime: "07:00",
      endTime: "19:00",
      notes: "Plantão diurno - Emergência",
    },
  })

  await prisma.shift.create({
    data: {
      userId: nurse1.id,
      date: nextWeek,
      shiftType: ShiftType.NIGHT,
      startTime: "19:00",
      endTime: "07:00",
      notes: "Plantão noturno - Emergência",
    },
  })

  await prisma.shift.create({
    data: {
      userId: nurse2.id,
      date: tomorrow,
      shiftType: ShiftType.TWELVE_THIRTY_SIX,
      startTime: "19:00",
      endTime: "07:00",
      notes: "Plantão noturno - UTI",
    },
  })

  // ==================== REGISTROS DE PONTO ====================
  console.log("Criando registros de ponto...")

  // Função para criar data com horário específico
  const createDateTime = (daysAgo: number, timeStr: string) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const [hours, minutes] = timeStr.split(":").map(Number)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // Registros de ponto para John (últimos 5 dias)
  for (let i = 5; i >= 1; i--) {
    // Pular final de semana
    if (createDateTime(i, "09:00").getDay() === 0 || createDateTime(i, "09:00").getDay() === 6) continue

    await prisma.punchRecord.create({
      data: {
        userId: employee1.id,
        timestamp: createDateTime(i, "08:55"),
        type: PunchType.ENTRY,
        latitude: -23.5505,
        longitude: -46.6333,
        deviceInfo: "Chrome em Windows 10",
      },
    })

    await prisma.punchRecord.create({
      data: {
        userId: employee1.id,
        timestamp: createDateTime(i, "12:00"),
        type: PunchType.BREAK_START,
        latitude: -23.5505,
        longitude: -46.6333,
        deviceInfo: "Chrome em Windows 10",
      },
    })

    await prisma.punchRecord.create({
      data: {
        userId: employee1.id,
        timestamp: createDateTime(i, "13:00"),
        type: PunchType.BREAK_END,
        latitude: -23.5505,
        longitude: -46.6333,
        deviceInfo: "Chrome em Windows 10",
      },
    })

    await prisma.punchRecord.create({
      data: {
        userId: employee1.id,
        timestamp: createDateTime(i, "17:05"),
        type: PunchType.EXIT,
        latitude: -23.5505,
        longitude: -46.6333,
        deviceInfo: "Chrome em Windows 10",
      },
    })
  }

  // ==================== SOLICITAÇÕES DE AJUSTE ====================
  console.log("Criando solicitações de ajuste...")

  // Solicitação de ajuste aprovada
  await prisma.adjustmentRequest.create({
    data: {
      userId: employee1.id,
      date: createDateTime(15, "09:00"),
      reason: "Esqueci de registrar a entrada. Cheguei às 9h.",
      status: RequestStatus.APPROVED,
      reviewedBy: manager.id,
      reviewedAt: createDateTime(9, "14:00"),
      reviewNotes: "Confirmado com supervisor.",
    },
  })

  // Solicitação de ajuste pendente
  await prisma.adjustmentRequest.create({
    data: {
      userId: employee2.id,
      date: createDateTime(3, "13:00"),
      reason: "Esqueci de registrar o retorno do almoço.",
      status: RequestStatus.PENDING,
    },
  })

  // Solicitação de ajuste rejeitada
  await prisma.adjustmentRequest.create({
    data: {
      userId: employee3.id,
      date: createDateTime(10, "17:00"),
      reason: "Saí mais tarde do que o registrado.",
      status: RequestStatus.REJECTED,
      reviewedBy: manager.id,
      reviewedAt: createDateTime(7, "11:00"),
      reviewNotes: "Não há evidências de permanência após o horário registrado.",
    },
  })

  // ==================== RELATÓRIOS ====================
  console.log("Criando relatórios...")

  // Relatório mensal
  await prisma.report.create({
    data: {
      userId: admin.id,
      pdfUrl: "https://example.com/reports/monthly-march-2023.pdf",
      startDate: new Date(2023, 2, 1), // 1º de março de 2023
      endDate: new Date(2023, 2, 31), // 31 de março de 2023
      type: "MONTHLY",
      createdAt: createDateTime(30, "10:00"),
    },
  })

  // Relatório de horas extras
  await prisma.report.create({
    data: {
      userId: manager.id,
      pdfUrl: "https://example.com/reports/overtime-feb-2023.pdf",
      startDate: new Date(2023, 1, 1), // 1º de fevereiro de 2023
      endDate: new Date(2023, 1, 28), // 28 de fevereiro de 2023
      type: "OVERTIME",
      createdAt: createDateTime(60, "15:30"),
    },
  })

  // ==================== LOGS DE AUDITORIA ====================
  console.log("Criando logs de auditoria...")

  // Logs de login
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      actionType: ActionType.LOGIN,
      metadata: { success: true, browser: "Chrome", os: "Windows 10" },
      createdAt: createDateTime(5, "08:30"),
    },
  })

  // Logs de criação de usuário
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      actionType: ActionType.CREATE,
      metadata: { targetUser: employee3.email, role: "EMPLOYEE" },
      createdAt: createDateTime(60, "14:00"),
    },
  })

  // Logs de aprovação de ajuste
  await prisma.auditLog.create({
    data: {
      userId: manager.id,
      actionType: ActionType.APPROVE_REQUEST,
      metadata: { targetUser: employee1.email, date: createDateTime(15, "09:00").toISOString() },
      createdAt: createDateTime(9, "14:00"),
    },
  })

  console.log("Seed executado com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

