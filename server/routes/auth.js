import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: { select: { name: true } } }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      return res.status(401).json({ message: 'Usuário inativo' });
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar dados do usuário e token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company.name
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// Rota para obter dados do usuário atual
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

// Rota para registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, companyCode } = req.body;

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Verificar o código da empresa
    const company = await prisma.company.findFirst({
      where: { id: companyCode } // Assumindo que o código da empresa é o ID
    });

    if (!company) {
      return res.status(400).json({ message: 'Código de empresa inválido' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE', // Papel padrão
        companyId: company.id
      }
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// Rota para recuperação de senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return res.json({ message: 'Se o email estiver registrado, enviaremos instruções para redefinir a senha' });
    }

    // Aqui você implementaria o envio de email com instruções
    // Para simplificar, apenas retornamos uma mensagem de sucesso

    res.json({ message: 'Se o email estiver registrado, enviaremos instruções para redefinir a senha' });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação' });
  }
});

export default router;
