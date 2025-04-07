# Controle de Ponto - Sistema de Registro Eletrônico

## Sobre o Projeto

Este projeto foi desenvolvido para suprir uma necessidade da AutoCM3 de implementar um sistema de marcação de ponto eletrônico para seus funcionários. O desenvolvimento levou aproximadamente 4 dias de trabalho intenso, utilizando diversas IAs para auxiliar na estruturação e codificação do projeto.

## Visão Técnica

### Stack Tecnológica

``` bash
Frontend:
- React 18
- Vite
- TypeScript
- React Router DOM
- Axios
- TailwindCSS
- Date-fns

Backend:
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Bcrypt para criptografia
- Multer para upload de arquivos
```
---
<div align="center">
  <img src="https://skillicons.dev/icons?i=react" height="40" alt="react logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=tailwind" height="40" alt="tailwindcss logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=vite" height="40" alt="vite logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=css" height="40" alt="css3 logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=postgres" height="40" alt="postgresql logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=ts" height="40" alt="typescript logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=js" height="40" alt="javascript logo"  />
  <img width="12" />
  <img src="https://skillicons.dev/icons?i=prisma" height="40" alt="prisma logo"  />
</div>

### Arquitetura

O projeto segue uma arquitetura cliente-servidor com separação clara entre frontend e backend:

``` 
Frontend (Vite + React)
  ↓
  HTTP/REST API
  ↓
Backend (Express + Prisma)
  ↓
PostgreSQL Database
```

### Estrutura de Diretórios

``` 
/
├── src/                  # Código fonte do frontend
│   ├── components/       # Componentes React reutilizáveis
│   ├── contexts/         # Contextos React (AuthContext)
│   ├── hooks/            # Custom hooks (useAuth, useGeolocation)
│   ├── pages/            # Páginas da aplicação
│   │   ├── admin/        # Páginas administrativas
│   │   └── ...
│   ├── services/         # Serviços (API)
│   ├── styles/           # Estilos CSS
│   └── utils/            # Utilitários
├── server/               # Código fonte do backend
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Rotas da API
│   └── utils/            # Utilitários do servidor
├── prisma/               # Configuração do Prisma ORM
│   └── schema.prisma     # Schema do banco de dados
└── uploads/              # Diretório para arquivos enviados
```

### Funcionalidades Principais

1. **Autenticação e Autorização**
   - Login/Logout com JWT
   - Diferentes níveis de acesso (ADMIN, MANAGER, EMPLOYEE)
   - Proteção de rotas baseada em papéis

2. **Registro de Ponto**
   - Marcação de entrada, saída e intervalos
   - Captura de geolocalização
   - Visualização de registros diários

3. **Gestão de Equipes**
   - Dashboard para gestores
   - Visualização de status da equipe em tempo real
   - Aprovação/rejeição de solicitações de ajuste

4. **Administração**
   - Gerenciamento de usuários
   - Gerenciamento de empresas
   - Configuração de grupos de jornada e tipos de plantão

5. **Relatórios**
   - Geração de relatórios de ponto
   - Exportação para CSV
   - Cálculo de horas trabalhadas e saldo

### Implementações Técnicas Notáveis

1. **Geolocalização**
   - Uso da API Geolocation do navegador
   - Custom hook para gerenciar estados de localização
   - Armazenamento de coordenadas e precisão

2. **Autenticação Stateful**
   - Token JWT armazenado no localStorage
   - Interceptor Axios para renovação automática
   - Context API para gerenciamento de estado de autenticação

3. **Responsividade**
   - Design mobile-first com TailwindCSS
   - Layout adaptativo para diferentes tamanhos de tela
   - Sidebar colapsável para dispositivos móveis

4. **Segurança**
   - Senhas hasheadas com bcrypt
   - Proteção contra CSRF
   - Validação de dados com middlewares

5. **Otimização de Performance**
   - Lazy loading de componentes
   - Memoização de funções e componentes
   - Paginação de dados em tabelas grandes

## Instalação e Execução

### Pré-requisitos

``` bash
- Node.js >= 16
- PostgreSQL >= 13
```

### Configuração

1. Clone o repositório
2. Instale as dependências:

``` bash
npm install
```

3. Configure o arquivo .env:

``` bash
# Database
DATABASE_URL="postgresql://postgres:senha@localhost:5432/controle_ponto?schema=public"

# JWT
JWT_SECRET="sua_chave_secreta_aqui"

# Server
PORT=3333
NODE_ENV=development
```

4. Execute as migrações do banco de dados:

``` bash
npm run prisma:migrate
```

5. Inicie a aplicação:

``` bash
npm run dev:full
```



## Considerações Finais

Este projeto demonstra a implementação de um sistema completo de controle de ponto, seguindo boas práticas de desenvolvimento e utilizando tecnologias modernas. A arquitetura escolhida permite escalabilidade e manutenibilidade, enquanto a separação clara entre frontend e backend facilita o desenvolvimento paralelo e a testabilidade.
