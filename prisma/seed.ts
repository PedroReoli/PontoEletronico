import { PrismaClient, UserRole, ShiftType } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.auditLog.deleteMany()
  await prisma.report.deleteMany()
  await prisma.adjustmentRequest.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.punchRecord.deleteMany()
  await prisma.customSchedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.scheduleGroup.deleteMany()
  await prisma.company.deleteMany()

  // Criar empresas
  const company1 = await prisma.company.create({
    data: {
      name: "TechCorp",
      logoUrl: "https://via.placeholder.com/150?text=TechCorp",
    },
  })

  const company2 = await prisma.company.create({
    data: {
      name: "HealthPlus",
      logoUrl: "https://via.placeholder.com/150?text=HealthPlus",
    },
  })

  // Criar grupos de jornada
  const standardSchedule = await prisma.scheduleGroup.create({
    data: {
      name: "Padrão Comercial",
      entryTime: "09:00",
      exitTime: "18:00",
      breakDuration: 60, // 1 hora
      companyId: company1.id,
    },
  })

  const flexSchedule = await prisma.scheduleGroup.create({
    data: {
      name: "Horário Flexível",
      entryTime: "08:00",
      exitTime: "17:00",
      breakDuration: 60, // 1 hora
      companyId: company1.id,
    },
  })

  const healthSchedule = await prisma.scheduleGroup.create({
    data: {
      name: "Turno Hospitalar",
      entryTime: "07:00",
      exitTime: "19:00",
      breakDuration: 120, // 2 horas
      companyId: company2.id,
    },
  })

  // Criar usuários
  const adminPassword = await bcrypt.hash("admin123", 10)
  const managerPassword = await bcrypt.hash("manager123", 10)
  const employeePassword = await bcrypt.hash("employee123", 10)

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@techcorp.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      companyId: company1.id,
      scheduleGroupId: standardSchedule.id,
    },
  })

  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@techcorp.com",
      password: managerPassword,
      role: UserRole.MANAGER,
      companyId: company1.id,
      scheduleGroupId: standardSchedule.id,
    },
  })

  const employee1 = await prisma.user.create({
    data: {
      name: "John Employee",
      email: "john@techcorp.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: company1.id,
      scheduleGroupId: flexSchedule.id,
    },
  })

  const employee2 = await prisma.user.create({
    data: {
      name: "Jane Employee",
      email: "jane@techcorp.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: company1.id,
      scheduleGroupId: flexSchedule.id,
    },
  })

  const nurse = await prisma.user.create({
    data: {
      name: "Nurse Smith",
      email: "nurse@healthplus.com",
      password: employeePassword,
      role: UserRole.EMPLOYEE,
      companyId: company2.id,
      scheduleGroupId: healthSchedule.id,
    },
  })

  // Criar jornada personalizada para um usuário
  await prisma.customSchedule.create({
    data: {
      userId: employee2.id,
      entryTime: "10:00",
      exitTime: "19:00",
      breakDuration: 60,
    },
  })

  // Criar plantões
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  await prisma.shift.create({
    data: {
      userId: nurse.id,
      date: today,
      shiftType: ShiftType.TWELVE_THIRTY_SIX,
      startTime: "07:00",
      endTime: "19:00",
      notes: "Plantão diurno",
    },
  })

  await prisma.shift.create({
    data: {
      userId: nurse.id,
      date: nextWeek,
      shiftType: ShiftType.NIGHT,
      startTime: "19:00",
      endTime: "07:00",
      notes: "Plantão noturno",
    },
  })

  await prisma.shift.create({
    data: {
      userId: employee1.id,
      date: tomorrow,
      shiftType: ShiftType.CUSTOM,
      startTime: "08:00",
      endTime: "20:00",
      notes: "Cobertura especial",
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

