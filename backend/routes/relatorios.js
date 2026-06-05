// Rotas de Relatórios (protegidas por JWT)
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/relatoriosController');

router.get('/pdf', auth, ctrl.gerarPDF);
router.get('/excel', auth, ctrl.gerarExcel);

module.exports = router;
