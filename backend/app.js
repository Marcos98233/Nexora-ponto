// Configuração principal do Express
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const funcionariosRoutes = require('./routes/funcionarios');
const departamentosRoutes = require('./routes/departamentos');
const pontoRoutes = require('./routes/ponto');
const dashboardRoutes = require('./routes/dashboard');
const relatoriosRoutes = require('./routes/relatorios');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/ponto', pontoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler global de erros (deve ser o último middleware)
app.use(errorHandler);

module.exports = app;
