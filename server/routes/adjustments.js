import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Listar solicitações de ajuste (para gestores)
router.get('/', authorize(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const { status } = req.query;
    const managerId = req.user.id;
    
    // Filtrar por status se fornecido
    const statusFilter = status && status !== 'ALL' ? { status } : {};
    
    // Buscar solicitações
    const adjustments = await prisma.adjustmentRequest.findMany({
      where: {
        ...statusFilter,
        OR: [
          { managerId },
          ...(req.user.role === 'ADMIN' ? [{}] : []) // Se for admin, busca todos
        ]
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Formatar os dados para o front-end
    const formattedAdjustments = adjustments.map(adjustment => ({
      id: adjustment.id,
      userId: adjustment.userId,
      userName: adjustment.user.name,
      date: adjustment.date,
      entryType: adjustment.entryType,
      requestedTime: adjustment.requestedTime,
      reason: adjustment.reason,
      attachmentUrl: adjustment.attachmentUrl,
      status: adjustment.status,
      responseComment: adjustment.responseComment,
      responseDate: adjustment.responseDate,
      createdAt: adjustment.createdAt
    }));
    
    res.json(formattedAdjustments);
  } catch (error) {
    console.error('Erro ao listar solicitações de ajuste:', error);
    res.status(500).json({ message: 'Erro ao listar solicitações de ajuste' });
  }
});

// Criar uma solicitação de ajuste (para funcionários)
router.post('/', async (req, res) => {
  try {
    const { date, entryType, requestedTime, reason } = req.body;
    const userId = req.user.id;
    
    // Validar dados
    if (!date || !entryType || !requestedTime || !reason) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Buscar o gestor do funcionário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { managerId: true }
    });
    
    // Criar a solicitação
    const adjustment = await prisma.adjustmentRequest.create({
      data: {
        date: new Date(date),
        entryType,
        requestedTime,
        reason,
        userId,
        managerId: user.managerId,
        status: 'PENDING'
      }
    });
    
    res.status(201).json(adjustment);
  } catch (error) {
    console.error('Erro ao criar solicitação de ajuste:', error);
    res.status(500).json({ message: 'Erro ao criar solicitação de ajuste' });
  }
});

// Upload de anexo para solicitação de ajuste
router.post('/:id/attachment', upload.single('attachment'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    // Verificar se a solicitação existe e pertence ao usuário
    const adjustment = await prisma.adjustmentRequest.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!adjustment) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    // Atualizar o caminho do anexo
    const attachmentUrl = `/uploads/${file.filename}`;
    
    await prisma.adjustmentRequest.update({
      where: { id },
      data: {
        attachmentUrl
      }
    });
    
    res.json({
      message: 'Anexo adicionado com sucesso',
      attachmentUrl
    });
  } catch (error) {
    console.error('Erro ao fazer upload do anexo:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do anexo' });
  }
});

// Aprovar uma solicitação de ajuste (para gestores)
router.put('/:id/approve', authorize(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { responseComment } = req.body;
    const managerId = req.user.id;
    
    // Verificar se a solicitação existe
    const adjustment = await prisma.adjustmentRequest.findUnique({
      where: { id }
    });
    
    if (!adjustment) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    // Verificar se a solicitação está pendente
    if (adjustment.status !== 'PENDING') {
      return res.status(400).json({ message: 'Apenas solicitações pendentes podem ser aprovadas' });
    }
    
    // Atualizar a solicitação
    const updatedAdjustment = await prisma.adjustmentRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        managerId,
        responseComment,
        responseDate: new Date()
      }
    });
    
    // Aqui você implementaria a lógica para criar/ajustar o registro de ponto
    // com base na solicitação aprovada
    
    res.json({
      message: 'Solicitação aprovada com sucesso',
      adjustment: updatedAdjustment
    });
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    res.status(500).json({ message: 'Erro ao aprovar solicitação' });
  }
});

// Rejeitar uma solicitação de ajuste (para gestores)
router.put('/:id/reject', authorize(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { responseComment } = req.body;
    const managerId = req.user.id;
    
    // Verificar se a solicitação existe
    const adjustment = await prisma.adjustmentRequest.findUnique({
      where: { id }
    });
    
    if (!adjustment) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }
    
    // Verificar se a solicitação está pendente
    if (adjustment.status !== 'PENDING') {
      return res.status(400).json({ message: 'Apenas solicitações pendentes podem ser rejeitadas' });
    }
    
    // Atualizar a solicitação
    const updatedAdjustment = await prisma.adjustmentRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        managerId,
        responseComment,
        responseDate: new Date()
      }
    });
    
    res.json({
      message: 'Solicitação rejeitada com sucesso',
      adjustment: updatedAdjustment
    });
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    res.status(500).json({ message: 'Erro ao rejeitar solicitação' });
  }
});

export default router;
