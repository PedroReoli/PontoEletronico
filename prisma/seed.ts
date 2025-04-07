import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { addDays, subDays, setHours, setMinutes, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...');
  await prisma.timeEntry.deleteMany({});
  await prisma.adjustmentRequest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.shiftType.deleteMany({});
  await prisma.shiftGroup.deleteMany({});
  await prisma.company.deleteMany({});

  // Criar empresas
  console.log('🏢 Criando empresas...');
  const empresa1 = await prisma.company.create({
    data: {
      name: 'TechSolutions Ltda',
      active: true,
    },
  });

  const empresa2 = await prisma.company.create({
    data: {
      name: 'Indústrias Progresso S.A.',
      active: true,
    },
  });

  // Criar grupos de jornada
  console.log('⏰ Criando grupos de jornada...');
  const jornadaComercial = await prisma.shiftGroup.create({
    data: {
      name: 'Jornada Comercial',
      startTime: '09:00',
      endTime: '18:00',
      breakDuration: 60,
      companyId: empresa1.id,
    },
  });

  const jornadaFlexivel = await prisma.shiftGroup.create({
    data: {
      name: 'Jornada Flexível',
      startTime: '08:00',
      endTime: '17:00',
      breakDuration: 60,
      companyId: empresa1.id,
    },
  });

  const jornadaIndustrial = await prisma.shiftGroup.create({
    data: {
      name: 'Jornada Industrial',
      startTime: '07:00',
      endTime: '16:00',
      breakDuration: 60,
      companyId: empresa2.id,
    },
  });

  // Criar tipos de plantão
  console.log('🔄 Criando tipos de plantão...');
  const plantaoNormal = await prisma.shiftType.create({
    data: {
      name: 'Plantão Normal',
      description: 'Plantão padrão de 8 horas',
      companyId: empresa1.id,
    },
  });

  const plantao12x36 = await prisma.shiftType.create({
    data: {
      name: 'Plantão 12x36',
      description: 'Plantão de 12 horas com folga de 36 horas',
      companyId: empresa2.id,
    },
  });

  // Criar senha padrão
  const hashSenha = await bcrypt.hash('123456', 10);

  // Criar usuários
  console.log('👥 Criando usuários...');
  
  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@exemplo.com',
      password: hashSenha,
      role: Role.ADMIN,
      companyId: empresa1.id,
      active: true,
    },
  });

  // Gerentes
  const gerente1 = await prisma.user.create({
    data: {
      name: 'Carlos Gerente',
      email: 'gerente@exemplo.com',
      password: hashSenha,
      role: Role.MANAGER,
      companyId: empresa1.id,
      shiftGroupId: jornadaComercial.id,
      active: true,
    },
  });

  const gerente2 = await prisma.user.create({
    data: {
      name: 'Ana Supervisora',
      email: 'supervisora@exemplo.com',
      password: hashSenha,
      role: Role.MANAGER,
      companyId: empresa2.id,
      shiftGroupId: jornadaIndustrial.id,
      active: true,
    },
  });

  // Funcionários
  const funcionario1 = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa1.id,
      shiftGroupId: jornadaComercial.id,
      managerId: gerente1.id,
      active: true,
    },
  });

  const funcionario2 = await prisma.user.create({
    data: {
      name: 'Maria Oliveira',
      email: 'maria@exemplo.com',
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa1.id,
      shiftGroupId: jornadaFlexivel.id,
      managerId: gerente1.id,
      active: true,
    },
  });

  const funcionario3 = await prisma.user.create({
    data: {
      name: 'Pedro Santos',
      email: 'pedro@exemplo.com',
      password: hashSenha,
      role: Role.EMPLOYEE,
      companyId: empresa2.id,
      shiftGroupId: jornadaIndustrial.id,
      managerId: gerente2.id,
      active: true,
    },
  });

  // Criar registros de ponto para os últimos 5 dias
  console.log('🕒 Criando registros de ponto...');
  
  const hoje = new Date();
  
  // Função para criar registros de ponto para um usuário em um dia específico
  async function criarRegistrosDia(userId: string, data: Date, entrou: boolean = true) {
    const dia = new Date(data);
    
    if (entrou) {
      // Entrada
      await prisma.timeEntry.create({
        data: {
          type: 'CLOCK_IN',
          timestamp: setMinutes(setHours(dia, 8), 55),
          userId,
          latitude: -23.5505 + (Math.random() * 0.01),
          longitude: -46.6333 + (Math.random() * 0.01),
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      });

      // Saída para almoço
      await prisma.timeEntry.create({
        data: {
          type: 'BREAK_START',
          timestamp: setMinutes(setHours(dia, 12), 0),
          userId,
          latitude: -23.5505 + (Math.random() * 0.01),
          longitude: -46.6333 + (Math.random() * 0.01),
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      });

      // Retorno do almoço
      await prisma.timeEntry.create({
        data: {
          type: 'BREAK_END',
          timestamp: setMinutes(setHours(dia, 13), 0),
          userId,
          latitude: -23.5505 + (Math.random() * 0.01),
          longitude: -46.6333 + (Math.random() * 0.01),
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      });

      // Saída
      await prisma.timeEntry.create({
        data: {
          type: 'CLOCK_OUT',
          timestamp: setMinutes(setHours(dia, 18), 5),
          userId,
          latitude: -23.5505 + (Math.random() * 0.01),
          longitude: -46.6333 + (Math.random() * 0.01),
          accuracy: Math.floor(Math.random() * 20) + 5,
        },
      });
    }
  }

  // Criar registros para os últimos 5 dias úteis
  for (let i = 5; i >= 0; i--) {
    const dia = subDays(hoje, i);
    const diaSemana = dia.getDay(); // 0 = domingo, 6 = sábado
    
    // Pular finais de semana
    if (diaSemana === 0 || diaSemana === 6) continue;
    
    await criarRegistrosDia(funcionario1.id, dia);
    await criarRegistrosDia(funcionario2.id, dia, i !== 1); // Funcionário 2 faltou um dia
    await criarRegistrosDia(funcionario3.id, dia, i !== 3); // Funcionário 3 faltou um dia diferente
  }

  // Criar solicitações de ajuste
  console.log('📝 Criando solicitações de ajuste...');
  
  // Solicitação pendente
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 2),
      entryType: 'CLOCK_IN',
      requestedTime: '08:30',
      reason: 'Esqueci de registrar a entrada no horário correto.',
      status: 'PENDING',
      userId: funcionario1.id,
      managerId: gerente1.id,
    },
  });

  // Solicitação aprovada
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 3),
      entryType: 'BREAK_END',
      requestedTime: '13:15',
      reason: 'Tive que estender meu horário de almoço devido a um compromisso médico.',
      status: 'APPROVED',
      userId: funcionario2.id,
      managerId: gerente1.id,
      responseComment: 'Ajuste aprovado conforme comprovante médico.',
      responseDate: subDays(hoje, 2),
    },
  });

  // Solicitação rejeitada
  await prisma.adjustmentRequest.create({
    data: {
      date: subDays(hoje, 4),
      entryType: 'CLOCK_OUT',
      requestedTime: '19:00',
      reason: 'Fiquei até mais tarde finalizando um projeto.',
      status: 'REJECTED',
      userId: funcionario3.id,
      managerId: gerente2.id,
      responseComment: 'Não houve autorização prévia para hora extra.',
      responseDate: subDays(hoje, 3),
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\nCredenciais para teste:');
  console.log('- Admin: admin@exemplo.com / 123456');
  console.log('- Gerente: gerente@exemplo.com / 123456');
  console.log('- Funcionário: joao@exemplo.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
