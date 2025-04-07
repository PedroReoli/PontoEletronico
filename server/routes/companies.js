import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Middleware de autenticação e autorização
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Listar todas as empresas
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json(companies);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ message: 'Erro ao listar empresas' });
  }
});

// Obter uma empresa específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await prisma.company.findUnique({
      where: { id }
    });
    
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ message: 'Erro ao buscar empresa' });
  }
});

// Criar uma nova empresa
router.post('/', async (req, res) => {
  try {
    const { name, active } = req.body;
    
    const company = await prisma.company.create({
      data: {
        name,
        active: active ?? true
      }
    });
    
    res.status(201).json(company);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ message: 'Erro ao criar empresa' });
  }
});

// Atualizar uma empresa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    
    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    
    // Atualizar a empresa
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name,
        active
      }
    });
    
    res.json(updatedCompany);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ message: 'Erro ao atualizar empresa' });
  }
});

// Excluir uma empresa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    
    // Verificar se há usuários vinculados à empresa
    const usersCount = await prisma.user.count({
      where: { companyId: id }
    });
    
    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir a empresa pois existem usuários vinculados a ela' 
      });
    }
    
    // Excluir a empresa
    await prisma.company.delete({
      where: { id }
    });
    
    res.json({ message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({ message: 'Erro ao excluir empresa' });
  }
});

// Upload de logo da empresa
router.post('/:id/logo', upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });
    
    if (!existingCompany) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }
    
    // Atualizar o caminho do logo
    const logoUrl = `/uploads/${file.filename}`;
    
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        logoUrl
      }
    });
    
    res.json({
      message: 'Logo atualizado com sucesso',
      logoUrl
    });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do logo' });
  }
});

export default router;
