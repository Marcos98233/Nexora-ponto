// Rotas do Dashboard (protegidas por JWT)
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/dashboardController');

router.get('/estatisticas', auth, ctrl.estatisticas);
router.get('/online', auth, ctrl.online);
router.get('/frequencia', auth, ctrl.frequencia);
router.get('/previsoes', auth, ctrl.previsoes);
router.get('/grafico-presenca', auth, ctrl.graficoPresenca);

module.exports = router;
