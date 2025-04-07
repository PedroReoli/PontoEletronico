import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Middleware de autenticação e autorização
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Listar todos os tipos de plantão
router.get('/', async (req, res) => {
  try {
    const shiftTypes = await prisma.shiftType.findMany({
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
    const formattedTypes = shiftTypes.map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      companyId: type.companyId,
      companyName: type.company.name,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt
    }));
    
    res.json(formattedTypes);
  } catch (error) {
    console.error('Erro ao listar tipos de plantão:', error);
    res.status(500).json({ message: 'Erro ao listar tipos de plantão' });
  }
});

// Obter um tipo de plantão específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shiftType = await prisma.shiftType.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!shiftType) {
      return res.status(404).json({ message: 'Tipo de plantão não encontrado' });
    }
    
    // Formatar a resposta
    const formattedType = {
      id: shiftType.id,
      name: shiftType.name,
      description: shiftType.description,
      companyId: shiftType.companyId,
      companyName: shiftType.company.name,
      createdAt: shiftType.createdAt,
      updatedAt: shiftType.updatedAt
    };
    
    res.json(formattedType);
  } catch (error) {
    console.error('Erro ao buscar tipo de plantão:', error);
    res.status(500).json({ message: 'Erro ao buscar tipo de plantão' });
  }
});

// Criar um novo tipo de plantão
router.post('/', async (req, res) => {
  try {
    const { name, description, companyId } = req.body;
    
    // Validar dados
    if (!name || !companyId) {
      return res.status(400).json({ message: 'Nome e empresa são obrigatórios' });
    }
    
    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      return res.status(400).json({ message: 'Empresa não encontrada' });
    }
    
    // Criar o tipo de plantão
    const shiftType = await prisma.shiftType.create({
      data: {
        name,
        description,
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
    const formattedType = {
      id: shiftType.id,
      name: shiftType.name,
      description: shiftType.description,
      companyId: shiftType.companyId,
      companyName: shiftType.company.name,
      createdAt: shiftType.createdAt,
      updatedAt: shiftType.updatedAt
    };
    
    res.status(201).json(formattedType);
  } catch (error) {
    console.error('Erro ao criar tipo de plantão:', error);
    res.status(500).json({ message: 'Erro ao criar tipo de plantão' });
  }
});

// Atualizar um tipo de plantão
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, companyId } = req.body;
    
    // Verificar se o tipo existe
    const existingType = await prisma.shiftType.findUnique({
      where: { id }
    });
    
    if (!existingType) {
      return res.status(404).json({ message: 'Tipo de plantão não encontrado' });
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
    
    // Atualizar o tipo
    const updatedType = await prisma.shiftType.update({
      where: { id },
      data: {
        name,
        description,
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
    const formattedType = {
      id: updatedType.id,
      name: updatedType.name,
      description: updatedType.description,
      companyId: updatedType.companyId,
      companyName: updatedType.company.name,
      createdAt: updatedType.createdAt,
      updatedAt: updatedType.updatedAt
    };
    
    res.json(formattedType);
  } catch (error) {
    console.error('Erro ao atualizar tipo de plantão:', error);
    res.status(500).json({ message: 'Erro ao atualizar tipo de plantão' });
  }
});

// Excluir um tipo de plantão
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o tipo existe
    const existingType = await prisma.shiftType.findUnique({
      where: { id }
    });
    
    if (!existingType) {
      return res.status(404).json({ message: 'Tipo de plantão não encontrado' });
    }
    
    // Verificar se há usuários vinculados ao tipo
    const usersCount = await prisma.user.count({
      where: { shiftTypeId: id }
    });
    
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir o tipo pois existem usuários vinculados a ele' 
      });
    }
    
    // Excluir o tipo
    await prisma.shiftType.delete({
      where: { id }
    });
    
    res.json({ message: 'Tipo de plantão excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tipo de plantão:', error);
    res.status(500).json({ message: 'Erro ao excluir tipo de plantão' });
  }
});

export default router;
