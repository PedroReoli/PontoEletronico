import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import timeEntryRoutes from './routes/timeEntries.js';
import shiftGroupRoutes from './routes/shiftGroups.js';
import shiftTypeRoutes from './routes/shiftTypes.js';
import adjustmentRoutes from './routes/adjustments.js';
import reportRoutes from './routes/reports.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
dotenv.config();

// Configuração para __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização do Prisma
export const prisma = new PrismaClient();

// Configuração do Express
const app = express();
app.use(cors());
app.use(express.json());

// Pasta para uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/companies', companyRoutes);
app.use('/api/admin/shift-groups', shiftGroupRoutes);
app.use('/api/admin/shift-types', shiftTypeRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/manager/adjustments', adjustmentRoutes);
app.use('/api/manager/team', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin/dashboard-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalShiftGroups,
      totalShiftTypes,
      pendingAdjustments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.shiftGroup.count(),
      prisma.shiftType.count(),
      prisma.adjustmentRequest.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      totalUsers,
      totalCompanies,
      totalShiftGroups,
      totalShiftTypes,
      pendingAdjustments
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização do servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
