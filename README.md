# ⏱️ Sistema de Controle de Ponto Manual

<div align="center">

### Solução completa para gestão de jornadas flexíveis e plantões

</div>

---

## 📋 Visão Geral

Sistema web completo para controle de ponto com foco em flexibilidade, segurança e gestão personalizada de jornadas, ideal para empresas que operam com múltiplas escalas e plantões.

<div align="center">

![Controle de Ponto](https://via.placeholder.com/800x400?text=Sistema+de+Controle+de+Ponto)

</div>

## 📌 Funcionalidades Principais

| Funcionalidade | Descrição |
|----------------|-----------|
| 🏢 **Multi-empresa** | Suporte a múltiplas empresas com regras independentes |
| 📅 **Jornadas flexíveis** | Jornadas fixas ou personalizadas por funcionário |
| 🔄 **Plantões e escalas** | Suporte a escalas 12x36, noturno e outros formatos |
| ✏️ **Ajustes de ponto** | Sistema completo com aprovação e auditoria |
| 📊 **Relatórios automáticos** | Geração mensal de relatórios em PDF |
| 📈 **Dashboard interativo** | Painel de controle com gráficos e métricas |
| 🔐 **Autenticação segura** | Sistema de sessões exclusivas e tokens |
| 📱 **Design responsivo** | Interface adaptada para mobile e desktop |

## 👥 Perfis de Usuário

### 👨‍💼 Funcionário

- ⏺️ Marca ponto manual (Entrar, Intervalo, Voltar, Sair)
- 📝 Solicita ajustes com justificativa
- 📊 Visualiza histórico e relatórios pessoais

### 👩‍💼 Gestor

- 👁️ Gerencia registros dos subordinados
- ✅ Aprova, rejeita ou edita ajustes
- 🔔 Usa painel de pendências para gestão

### 👨‍💻 Administrador

- ➕ Cadastra empresas, usuários e grupos de jornada
- ⚙️ Define plantões e configura relatórios com logo
- 📋 Acompanha logs e auditoria do sistema


- 📄 **Relatórios PDF** gerados automaticamente todo mês
- 🗄️ **Armazenamento** acessível por 90 dias
- 🗑️ **Dados brutos** excluídos 5 dias após o primeiro acesso
- 📝 **Logs completos** de login, marcações, ajustes e acessos

## 🔒 Segurança

<div class="security-features">

- 🔑 **Autenticação** via e-mail e senha
- ⏱️ **Sessão** expira após 15 minutos de inatividade
- 🚫 **Sem múltiplas sessões** simultâneas
- 🍪 **Tokens** armazenados via cookies httpOnly

</div>



### 📐 Organização CSS

- **variables.css**: Contém todas as variáveis de design
  - Paleta de cores completa
  - Tipografia responsiva com clamp()
  - Espaçamentos padronizados
  - Tokens de design (bordas, sombras)

- **globals.css**: Estilos globais da aplicação
  - Reset CSS moderno
  - Estilos base para HTML e body
  - Configurações de fonte usando variáveis

## 🚀 Sprints Principais

<div class="sprints-container">

### Sprint 01 – Setup Inicial
> Estrutura de pastas, ESLint, Prettier, Vite, Tailwind, Prisma, .env

### Sprint 02 – Modelagem Prisma
> User, Company, PunchRecord, ScheduleGroup, Shift, Adjustments, Reports

### Sprint 03 – Autenticação Segura
> JWT + refresh token, sessão única, cookies httpOnly, middleware de rotas

### Sprint 04 – Gestão de Usuários
> CRUD, perfis (ADMIN, MANAGER, EMPLOYEE), filtros por empresa

### Sprint 05 – Marcação de Ponto
> Botões de ação, duplicidade de marcação, feedback visual

### Sprint 06 – Jornadas e Plantões
> Agrupamento por horários, suporte a múltiplos plantões

### Sprint 07 – Ajustes de Ponto
> Solicitação com anexo, painel de gestão, notificação

### Sprint 08 – Dashboards
> Gráficos com ApexCharts, resumo de horas, faltas e extras

### Sprint 09 – Relatórios em PDF
> Gerador automático com logo, cron job mensal, exclusão de dados

### Sprint 10 – Notificações por E-mail
> Nodemailer, react-email, eventos configuráveis

### Sprint 11 – Logs e Auditoria
> Histórico completo, visualização por tipo/data

### Sprint 12 – Testes e Refatoração
> Vitest/Jest, ajustes visuais, tipagem, organização de código

### Sprint 13 – Polimento Final
> Lazy loading, responsividade, modais e UX geral

</div>

---



### 🛠️ Stack Tecnológica
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



## 🔧 Requisitos Técnicos

- Node.js 18+
- PostgreSQL 14+
- Armazenamento para anexos e relatórios
- Servidor com suporte a HTTPS
- Certificado SSL válido
## 🚀 Próximos Passos

1. **Definição de escopo detalhado**
2. **Aprovação do orçamento**
3. **Início do desenvolvimento (Sprint 01)**
4. **Entregas incrementais a cada 2 semanas**
5. **Testes com usuários reais**
6. **Implantação e treinamento**

