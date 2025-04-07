import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middlewares/auth.js';
import { format, parseISO, startOfMonth, endOfMonth, differenceInMinutes, addMinutes } from 'date-fns';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Obter relatório de registros de ponto por mês
router.get('/time-entries', async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    // Validar parâmetros
    if (!month || !year) {
      return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
    }
    
    // Converter para números
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Definir início e fim do mês
    const startDate = startOfMonth(new Date(yearNum, monthNum - 1));
    const endDate = endOfMonth(new Date(yearNum, monthNum - 1));
    
    // Buscar registros do mês
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Buscar configurações de jornada do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shiftGroup: true
      }
    });
    
    // Determinar a jornada padrão (do grupo ou individual)
    let expectedWorkHours = 8 * 60; // 8 horas em minutos (padrão)
    let expectedBreakMinutes = 60; // 1 hora em minutos (padrão)
    
    if (user.shiftGroup) {
      // Converter horários de string para minutos desde meia-noite
      const startParts = user.shiftGroup.startTime.split(':').map(Number);
      const endParts = user.shiftGroup.endTime.split(':').map(Number);
      
      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];
      
      expectedWorkHours = endMinutes - startMinutes;
      expectedBreakMinutes = user.shiftGroup.breakDuration;
    } else if (user.startTime && user.endTime) {
      // Usar configurações individuais
      const startParts = user.startTime.split(':').map(Number);
      const endParts = user.endTime.split(':').map(Number);
      
      const startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];
      
      expectedWorkHours = endMinutes - startMinutes;
      expectedBreakMinutes = user.breakDuration || 60;
    }
    
    // Agrupar registros por dia
    const entriesByDay = {};
    
    entries.forEach(entry => {
      const day = format(entry.timestamp, 'yyyy-MM-dd');
      
      if (!entriesByDay[day]) {
        entriesByDay[day] = [];
      }
      
      entriesByDay[day].push(entry);
    });
    
    // Processar os dados para o relatório
    const report = Object.keys(entriesByDay).map(day => {
      const dayEntries = entriesByDay[day];
      
      // Encontrar registros por tipo
      const clockIn = dayEntries.find(e => e.type === 'CLOCK_IN');
      const breakStart = dayEntries.find(e => e.type === 'BREAK_START');
      const breakEnd = dayEntries.find(e => e.type === 'BREAK_END');
      const clockOut = dayEntries.find(e => e.type === 'CLOCK_OUT');
      
      // Calcular tempo trabalhado
      let totalWorkedMinutes = 0;
      let totalBreakMinutes = 0;
      
      if (clockIn && clockOut) {
        if (breakStart && breakEnd) {
          // Com intervalo
          totalBreakMinutes = differenceInMinutes(breakEnd.timestamp, breakStart.timestamp);
          
          // Tempo antes do intervalo + tempo depois do intervalo
          const beforeBreak = differenceInMinutes(breakStart.timestamp, clockIn.timestamp);
          const afterBreak = differenceInMinutes(clockOut.timestamp, breakEnd.timestamp);
          
          totalWorkedMinutes = beforeBreak + afterBreak;
        } else {
          // Sem intervalo registrado
          totalWorkedMinutes = differenceInMinutes(clockOut.timestamp, clockIn.timestamp);
        }
      }
      
      // Calcular saldo (positivo ou negativo)
      const expectedTotal = expectedWorkHours - expectedBreakMinutes;
      const balance = totalWorkedMinutes - expectedTotal;
      
      // Formatar tempos para exibição
      const formatMinutes = (minutes) => {
        const hours = Math.floor(Math.abs(minutes) / 60);
        const mins = Math.abs(minutes) % 60;
        const sign = minutes < 0 ? '-' : '';
        return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };
      
      return {
        id: day,
        date: format(parseISO(day), 'dd/MM/yyyy'),
        clockIn: clockIn ? format(clockIn.timestamp, 'HH:mm') : null,
        breakStart: breakStart ? format(breakStart.timestamp, 'HH:mm') : null,
        breakEnd: breakEnd ? format(breakEnd.timestamp, 'HH:mm') : null,
        clockOut: clockOut ? format(clockOut.timestamp, 'HH:mm') : null,
        totalWorked: formatMinutes(totalWorkedMinutes),
        totalBreak: formatMinutes(totalBreakMinutes),
        balance: formatMinutes(balance)
      };
    });
    
    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório' });
  }
});

export default router;
