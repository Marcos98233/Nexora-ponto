// Rotas de Departamentos (protegidas por JWT)
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/departamentosController');

router.get('/', auth, ctrl.listar);
router.post('/', auth, ctrl.criar);
router.put('/:id', auth, ctrl.atualizar);
router.delete('/:id', auth, ctrl.excluir);

module.exports = router;
