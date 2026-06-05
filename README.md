# Sistema de Controle de Frequência por Token Único

Sistema web completo para controle de frequência de funcionários utilizando token UUID único gerado no momento do cadastro.

---

## Tecnologias

**Backend:** Node.js · Express · MySQL · JWT · bcrypt · Socket.IO · UUID · PDFKit · ExcelJS  
**Frontend:** React · Material UI · Chart.js · React Router DOM · Axios · Socket.IO Client · React Toastify

---

## Estrutura do Projeto

```
controle-ponto/
├── backend/
│   ├── config/
│   │   ├── database.js       # Conexão centralizada MySQL
│   │   ├── database.sql      # Script SQL completo
│   │   └── seed.js           # Seed do admin padrão
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── funcionariosController.js
│   │   ├── departamentosController.js
│   │   ├── pontoController.js
│   │   ├── dashboardController.js
│   │   └── relatoriosController.js
│   ├── middlewares/
│   │   ├── auth.js            # Middleware JWT
│   │   └── errorHandler.js   # Handler global de erros
│   ├── routes/
│   │   ├── auth.js
│   │   ├── funcionarios.js
│   │   ├── departamentos.js
│   │   ├── ponto.js
│   │   ├── dashboard.js
│   │   └── relatorios.js
│   ├── sockets/
│   │   └── pontoSocket.js    # Socket.IO - monitoramento real
│   ├── .env
│   ├── app.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── contexts/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login/
    │   │   ├── Dashboard/
    │   │   ├── Funcionarios/
    │   │   ├── Departamentos/
    │   │   ├── Frequencia/
    │   │   ├── Relatorios/
    │   │   ├── RegistroPonto/
    │   │   └── Monitoramento/
    │   ├── components/
    │   │   └── Layout/
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── theme.js
    └── package.json
```

---

## Configuração e Instalação

### 1. Banco de Dados MySQL

Acesse o MySQL e execute o script SQL:

```bash
mysql -u root -p < backend/config/database.sql
```

Ou manualmente no MySQL:

```sql
CREATE DATABASE controle_ponto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE controle_ponto;
-- Execute o conteúdo de backend/config/database.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Configure o arquivo `.env` com suas credenciais:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=controle_ponto
JWT_SECRET=controle_ponto_jwt_secret_2024
PORT=5000
```

Execute o seed para criar o administrador padrão:

```bash
node config/seed.js
```

Inicie o servidor:

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

O backend estará disponível em: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

O frontend estará disponível em: `http://localhost:3000`

---

## Acesso ao Sistema

### Administrador

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000/login` | Login administrativo |
| `http://localhost:3000/` | Dashboard |
| `http://localhost:3000/funcionarios` | CRUD de Funcionários |
| `http://localhost:3000/departamentos` | CRUD de Departamentos |
| `http://localhost:3000/frequencia` | Controle de Frequência |
| `http://localhost:3000/monitoramento` | Monitoramento em Tempo Real |
| `http://localhost:3000/relatorios` | Relatórios PDF/Excel |

**Credenciais padrão:**
- Email: `adm@gmail.com`
- Senha: `adm`

### Funcionários (sem login)

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000/ponto` | Registro de ponto por token |

---

## Rotas da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login do administrador |

### Funcionários (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/funcionarios` | Listar todos |
| GET | `/api/funcionarios/:id` | Buscar por ID |
| POST | `/api/funcionarios` | Criar (gera token UUID) |
| PUT | `/api/funcionarios/:id` | Atualizar |
| DELETE | `/api/funcionarios/:id` | Excluir |

### Departamentos (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/departamentos` | Listar todos |
| POST | `/api/departamentos` | Criar |
| PUT | `/api/departamentos/:id` | Atualizar |
| DELETE | `/api/departamentos/:id` | Excluir |

### Registro de Ponto
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/ponto` | Registrar entrada/saída (público) |
| GET | `/api/ponto/historico/:id` | Histórico (requer JWT) |

### Dashboard (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/estatisticas` | Totais gerais |
| GET | `/api/dashboard/online` | Funcionários presentes |
| GET | `/api/dashboard/frequencia` | Frequência com filtros |
| GET | `/api/dashboard/previsoes` | Previsão por regressão linear |
| GET | `/api/dashboard/grafico-presenca` | Dados para gráfico |

### Relatórios (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/relatorios/pdf` | Download PDF |
| GET | `/api/relatorios/excel` | Download Excel |

---

## Funcionalidades

- **Token UUID único** gerado automaticamente no cadastro do funcionário (imutável)
- **Registro de ponto** público por token — sistema detecta entrada/saída automaticamente
- **Dashboard analítico** com gráficos de presença, faltas e comparativo
- **Previsão de frequência** por regressão linear (histórico 30 dias)
- **Monitoramento em tempo real** com Socket.IO (atualização a cada 30s)
- **Controle de frequência semanal** com filtros por funcionário, departamento e período
- **Relatórios em PDF e Excel** com filtros de período, funcionário e departamento
- **Autenticação JWT** com proteção de rotas e expiração de 8 horas
- **Senhas criptografadas** com bcrypt (10 rounds)
- **Responsivo** — funciona em mobile, tablet e desktop

---

## Banco de Dados

```sql
admins         → id, email, senha, created_at
departamentos  → id, nome, created_at
funcionarios   → id, nome, cpf, email, token, departamento_id, created_at
registros      → id, funcionario_id, tipo (ENTRADA|SAIDA), data_hora
```
