import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rota para listar membros da equipe (para gestores)
router.get('/team', authorize(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const managerId = req.user.id;
    
    // Buscar subordinados do gestor
    const teamMembers = await prisma.user.findMany({
      where: {
        OR: [
          { managerId },
          ...(req.user.role === 'ADMIN' ? [{}] : []) // Se for admin, busca todos
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        timeEntries: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      }
    });

    // Determinar o status de cada membro
    const formattedMembers = teamMembers.map(member => {
      let status = 'NOT_STARTED';
      let lastEntry = null;

      if (member.timeEntries.length > 0) {
        lastEntry = member.timeEntries[0];
        
        switch (lastEntry.type) {
          case 'CLOCK_IN':
            status = 'PRESENT';
            break;
          case 'BREAK_START':
            status = 'BREAK';
            break;
          case 'BREAK_END':
            status = 'PRESENT';
            break;
          case 'CLOCK_OUT':
            status = 'ABSENT';
            break;
        }
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        status,
        lastEntry: lastEntry ? {
          type: lastEntry.type,
          timestamp: lastEntry.timestamp
        } : undefined
      };
    });

    res.json(formattedMembers);
  } catch (error) {
    console.error('Erro ao buscar equipe:', error);
    res.status(500).json({ message: 'Erro ao buscar membros da equipe' });
  }
});

// Rotas de administração de usuários
// Listar todos os usuários (apenas admin)
router.get('/', authorize(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        companyId: true,
        company: {
          select: {
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Formatar os dados para o front-end
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      companyId: user.companyId,
      companyName: user.company.name,
      createdAt: user.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Criar um novo usuário (apenas admin)
router.post('/', authorize(['ADMIN']), async (req, res) => {
  try {
    const { name, email, password, role, companyId, active } = req.body;

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId,
        active: active ?? true
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
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      companyId: user.companyId,
      companyName: user.company.name,
      createdAt: user.createdAt
    };

    res.status(201).json(formattedUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
});

// Atualizar um usuário (apenas admin)
router.put('/:id', authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, companyId, active } = req.body;

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      });

      if (emailInUse) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }

    // Preparar dados para atualização
    const updateData = {
      name,
      email,
      role,
      companyId,
      active
    };

    // Se uma nova senha foi fornecida, hash e adicione aos dados
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

    // Formatar a resposta
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      active: updatedUser.active,
      companyId: updatedUser.companyId,
      companyName: updatedUser.company.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Excluir um usuário (apenas admin)
router.delete('/:id', authorize(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Excluir o usuário
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
});

export default router;
