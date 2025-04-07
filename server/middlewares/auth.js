import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

export const authenticate = async (req, res, next) => {
  try {
    // Verificar se o token existe no cabeçalho
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Extrair o token do cabeçalho
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        active: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    if (!user.active) {
      return res.status(401).json({ message: 'Usuário inativo' });
    }

    // Adicionar o usuário ao objeto de requisição
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar permissões
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    next();
  };
};
