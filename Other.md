# Regras de Negócio e Relações de Banco de Dados - Controle de Ponto

## Regras de Negócio

### 1. Usuários e Autenticação

- Existem três níveis de acesso: EMPLOYEE (funcionário), MANAGER (gestor) e ADMIN (administrador)
- Cada usuário pertence a uma empresa
- Um usuário pode ter um gestor (relação hierárquica)
- Apenas usuários ativos podem acessar o sistema
- Senhas devem ser armazenadas de forma criptografada
- Tokens de autenticação expiram em 24 horas

### 2. Registro de Ponto

- Um registro de ponto pode ser de quatro tipos: CLOCK_IN (entrada), BREAK_START (início de intervalo), BREAK_END (fim de intervalo) e CLOCK_OUT (saída)
- Os registros devem seguir uma sequência lógica: entrada → início de intervalo → fim de intervalo → saída
- Cada registro armazena a geolocalização do usuário (latitude, longitude e precisão)
- Um usuário só pode registrar um novo ponto se o anterior seguir a sequência lógica
- O sistema calcula automaticamente o tempo trabalhado e o tempo de intervalo

### 3. Jornadas de Trabalho

- Cada funcionário pode pertencer a um grupo de jornada ou ter configurações individuais
- Um grupo de jornada define horário de início, fim e duração do intervalo
- O sistema calcula o saldo de horas com base na jornada esperada vs. realizada
- Tipos de plantão podem ser configurados para casos especiais (ex: plantões de 12h)

### 4. Solicitações de Ajuste

- Funcionários podem solicitar ajustes em seus registros de ponto
- Cada solicitação deve conter data, tipo de registro, horário solicitado e motivo
- Opcionalmente, podem anexar um arquivo comprobatório
- Solicitações são enviadas ao gestor direto do funcionário
- Gestores podem aprovar ou rejeitar solicitações, incluindo comentários
- Após aprovação, o sistema ajusta automaticamente o registro de ponto

### 5. Relatórios

- Relatórios podem ser gerados por período (mês/ano)
- Relatórios incluem todos os registros, tempo trabalhado, tempo de intervalo e saldo
- Dados podem ser exportados em formato CSV
- Administradores podem visualizar relatórios de todos os funcionários
- Gestores podem visualizar relatórios de seus subordinados
- Funcionários podem visualizar apenas seus próprios relatórios

### 6. Empresas e Configurações

- Uma empresa pode ter múltiplos funcionários
- Cada empresa pode configurar seus próprios grupos de jornada e tipos de plantão
- Empresas podem ter um logo personalizado
- Apenas administradores podem gerenciar empresas e suas configurações

## Relações de Banco de Dados

### Modelo de Dados

1. **User (Usuário)**
   - Campos: id, email, password, name, role, active, createdAt, updatedAt
   - Relações:
     - Pertence a uma Company (companyId)
     - Pode ter um Manager (managerId → User)
     - Pode ter vários subordinados (User[] via managerId)
     - Pode pertencer a um ShiftGroup (shiftGroupId)
     - Pode ter um ShiftType (shiftTypeId)
     - Tem vários TimeEntry (registros de ponto)
     - Tem várias AdjustmentRequest (solicitações feitas)
     - Pode gerenciar várias AdjustmentRequest (como gestor)

2. **Company (Empresa)**
   - Campos: id, name, logoUrl, active, createdAt, updatedAt
   - Relações:
     - Tem vários User (usuários)
     - Tem vários ShiftGroup (grupos de jornada)
     - Tem vários ShiftType (tipos de plantão)

3. **ShiftGroup (Grupo de Jornada)**
   - Campos: id, name, startTime, endTime, breakDuration, createdAt, updatedAt
   - Relações:
     - Pertence a uma Company (companyId)
     - Tem vários User (usuários)

4. **ShiftType (Tipo de Plantão)**
   - Campos: id, name, description, createdAt, updatedAt
   - Relações:
     - Pertence a uma Company (companyId)
     - Tem vários User (usuários)

5. **TimeEntry (Registro de Ponto)**
   - Campos: id, type, timestamp, latitude, longitude, accuracy, createdAt, updatedAt
   - Relações:
     - Pertence a um User (userId)

6. **AdjustmentRequest (Solicitação de Ajuste)**
   - Campos: id, date, entryType, requestedTime, reason, attachmentUrl, status, createdAt, updatedAt, responseComment, responseDate
   - Relações:
     - Feita por um User (userId)
     - Gerenciada por um User (managerId)

7. **Report (Relatório)**
   - Campos: id, month, year, fileUrl, accessedAt, createdAt, updatedAt
   - Relações:
     - Pertence a um User (userId)

8. **AuditLog (Log de Auditoria)**
   - Campos: id, action, entityType, entityId, details, ipAddress, createdAt
   - Relações:
     - Associado a um User (userId)

### Diagrama de Relações
