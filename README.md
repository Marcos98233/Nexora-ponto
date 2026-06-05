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
