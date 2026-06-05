// Rotas de Funcionários (protegidas por JWT)
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/funcionariosController');

router.get('/', auth, ctrl.listar);
router.get('/:id', auth, ctrl.buscar);
router.post('/', auth, ctrl.criar);
router.put('/:id', auth, ctrl.atualizar);
router.delete('/:id', auth, ctrl.excluir);

module.exports = router;
