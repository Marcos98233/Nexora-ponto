// Rotas de Registro de Ponto
// POST /api/ponto é público (sem autenticação)
// GET /api/ponto/historico/:id é protegido
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/pontoController');

// Rota pública - registro por token
router.post('/', ctrl.registrar);

// Rota protegida - histórico
router.get('/historico/:funcionario_id', auth, ctrl.historico);

module.exports = router;
