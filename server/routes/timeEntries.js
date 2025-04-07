import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middlewares/auth.js';
import { parseISO, startOfDay, endOfDay, format } from 'date-fns';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Registrar um ponto (entrada, saída, início ou fim de intervalo)
router.post('/', async (req, res) => {
  try {
    const { type, latitude, longitude, accuracy } = req.body;
    const userId = req.user.id;

    // Validar o tipo de registro
    if (!['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de registro inválido' });
    }

    // Criar o registro de ponto
    const timeEntry = await prisma.timeEntry.create({
      data: {
        type,
        userId,
        latitude,
        longitude,
        accuracy
      }
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Erro ao registrar ponto:', error);
    res.status(500).json({ message: 'Erro ao registrar ponto' });
  }
});

// Obter registros de ponto do dia atual
router.get('/today', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Definir início e fim do dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar registros do dia
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    res.json(entries);
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ message: 'Erro ao buscar registros de ponto' });
  }
});

// Obter registros de ponto por período
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    // Validar datas
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Datas de início e fim são obrigatórias' });
    }
    
    // Converter strings para objetos Date
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    
    // Buscar registros do período
    const entries = await prisma.timeEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Agrupar registros por dia
    const entriesByDay = entries.reduce((acc, entry) => {
      const day = format(entry.timestamp, 'yyyy-MM-dd');
      
      if (!acc[day]) {
        acc[day] = [];
      }
      
      acc[day].push(entry);
      return acc;
    }, {});
    
    res.json(entriesByDay);
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ message: 'Erro ao buscar registros de ponto' });
  }
});

export default router;
