import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Middleware de autenticação e autorização
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Listar todos os grupos de jornada
router.get('/', async (req, res) => {
  try {
    const shiftGroups = await prisma.shiftGroup.findMany({
      include: {
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Formatar os dados para o front-end
    const formattedGroups = shiftGroups.map(group => ({
      id: group.id,
      name: group.name,
      startTime: group.startTime,
      endTime: group.endTime,
      breakDuration: group.breakDuration,
      companyId: group.companyId,
      companyName: group.company.name,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    }));
    
    res.json(formattedGroups);
  } catch (error) {
    console.error('Erro ao listar grupos de jornada:', error);
    res.status(500).json({ message: 'Erro ao listar grupos de jornada' });
  }
});

// Obter um grupo de jornada específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shiftGroup = await prisma.shiftGroup.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!shiftGroup) {
      return res.status(404).json({ message: 'Grupo de jornada não encontrado' });
    }
    
    // Formatar a resposta
    const formattedGroup = {
      id: shiftGroup.id,
      name: shiftGroup.name,
      startTime: shiftGroup.startTime,
      endTime: shiftGroup.endTime,
      breakDuration: shiftGroup.breakDuration,
      companyId: shiftGroup.companyId,
      companyName: shiftGroup.company.name,
      createdAt: shiftGroup.createdAt,
      updatedAt: shiftGroup.updatedAt
    };
    
    res.json(formattedGroup);
  } catch (error) {
    console.error('Erro ao buscar grupo de jornada:', error);
    res.status(500).json({ message: 'Erro ao buscar grupo de jornada' });
  }
});

// Criar um novo grupo de jornada
router.post('/', async (req, res) => {
  try {
    const { name, startTime, endTime, breakDuration, companyId } = req.body;
    
    // Validar dados
    if (!name || !startTime || !endTime || breakDuration === undefined || !companyId) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return res.status(400).json({ message: 'Empresa não encontrada' });
    }
    
    // Criar o grupo de jornada
    const shiftGroup = await prisma.shiftGroup.create({
      data: {
        name,
        startTime,
        endTime,
        breakDuration: Number(breakDuration),
        companyId
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Formatar a resposta
    const formattedGroup = {
      id: shiftGroup.id,
      name: shiftGroup.name,
      startTime: shiftGroup.startTime,
      endTime: shiftGroup.endTime,
      breakDuration: shiftGroup.breakDuration,
      companyId: shiftGroup.companyId,
      companyName: shiftGroup.company.name,
      createdAt: shiftGroup.createdAt,
      updatedAt: shiftGroup.updatedAt
    };
    
    res.status(201).json(formattedGroup);
  } catch (error) {
    console.error('Erro ao criar grupo de jornada:', error);
    res.status(500).json({ message: 'Erro ao criar grupo de jornada' });
  }
});

// Atualizar um grupo de jornada
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, breakDuration, companyId } = req.body;
    
    // Verificar se o grupo existe
    const existingGroup = await prisma.shiftGroup.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ message: 'Grupo de jornada não encontrado' });
    }
    
    // Verificar se a empresa existe
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });
      
      if (!company) {
        return res.status(400).json({ message: 'Empresa não encontrada' });
      }
    }
    
    // Atualizar o grupo
    const updatedGroup = await prisma.shiftGroup.update({
      where: { id },
      data: {
        name,
        startTime,
        endTime,
        breakDuration: Number(breakDuration),
        companyId
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Formatar a resposta
    const formattedGroup = {
      id: updatedGroup.id,
      name: updatedGroup.name,
      startTime: updatedGroup.startTime,
      endTime: updatedGroup.endTime,
      breakDuration: updatedGroup.breakDuration,
      companyId: updatedGroup.companyId,
      companyName: updatedGroup.company.name,
      createdAt: updatedGroup.createdAt,
      updatedAt: updatedGroup.updatedAt
    };
    
    res.json(formattedGroup);
  } catch (error) {
    console.error('Erro ao atualizar grupo de jornada:', error);
    res.status(500).json({ message: 'Erro ao atualizar grupo de jornada' });
  }
});

// Excluir um grupo de jornada
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o grupo existe
    const existingGroup = await prisma.shiftGroup.findUnique({
      where: { id }
    });
    
    if (!existingGroup) {
      return res.status(404).json({ message: 'Grupo de jornada não encontrado' });
    }
    
    // Verificar se há usuários vinculados ao grupo
    const usersCount = await prisma.user.count({
      where: { shiftGroupId: id }
    });
    
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir o grupo pois existem usuários vinculados a ele' 
      });
    }
    
    // Excluir o grupo
    await prisma.shiftGroup.delete({
      where: { id }
    });
    
    res.json({ message: 'Grupo de jornada excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir grupo de jornada:', error);
    res.status(500).json({ message: 'Erro ao excluir grupo de jornada' });
  }
});

export default router;
