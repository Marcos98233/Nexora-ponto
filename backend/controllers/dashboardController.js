// Controller do Dashboard - Estatísticas, Monitoramento e Previsões
const pool = require('../config/database');

/**
 * GET /api/dashboard/estatisticas
 * Retorna totais gerais: funcionários, departamentos, presentes, ausentes, etc.
 */
const estatisticas = async (req, res, next) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    // Total de funcionários e departamentos
    const [[{ total_funcionarios }]] = await pool.query(
      'SELECT COUNT(*) AS total_funcionarios FROM funcionarios'
    );
    const [[{ total_departamentos }]] = await pool.query(
      'SELECT COUNT(*) AS total_departamentos FROM departamentos'
    );

    // Funcionários que fizeram ENTRADA hoje
    const [entradaHoje] = await pool.query(`
      SELECT DISTINCT funcionario_id FROM registros
      WHERE tipo = 'ENTRADA' AND DATE(data_hora) = ?
    `, [hoje]);

    // Funcionários que já fizeram SAÍDA (e não voltaram) hoje
    // Presentes: fizeram mais ENTRADAs do que SAÍDAs hoje
    const [statusHoje] = await pool.query(`
      SELECT funcionario_id,
        SUM(CASE WHEN tipo = 'ENTRADA' THEN 1 ELSE 0 END) AS entradas,
        SUM(CASE WHEN tipo = 'SAIDA' THEN 1 ELSE 0 END) AS saidas
      FROM registros
      WHERE DATE(data_hora) = ?
      GROUP BY funcionario_id
    `, [hoje]);

    const presentes = statusHoje.filter(r => r.entradas > r.saidas).length;
    const ausentes = total_funcionarios - presentes;
    const total_entradas = entradaHoje.length;
    const [saidaHoje] = await pool.query(`
      SELECT DISTINCT funcionario_id FROM registros
      WHERE tipo = 'SAIDA' AND DATE(data_hora) = ?
    `, [hoje]);

    res.json({
      total_funcionarios,
      total_departamentos,
      presentes,
      ausentes,
      entradas_dia: total_entradas,
      saidas_dia: saidaHoje.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/online
 * Retorna funcionários que estão trabalhando agora (entrada sem saída correspondente).
 */
const online = async (req, res, next) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    // Buscar todos funcionários com registros hoje
    const [registros] = await pool.query(`
      SELECT r.funcionario_id, r.tipo, r.data_hora,
        f.nome, d.nome AS departamento
      FROM registros r
      INNER JOIN funcionarios f ON f.id = r.funcionario_id
      INNER JOIN departamentos d ON d.id = f.departamento_id
      WHERE DATE(r.data_hora) = ?
      ORDER BY r.funcionario_id, r.data_hora ASC
    `, [hoje]);

    // Agrupar por funcionário
    const funcionariosMap = {};
    for (const reg of registros) {
      if (!funcionariosMap[reg.funcionario_id]) {
        funcionariosMap[reg.funcionario_id] = {
          funcionario_id: reg.funcionario_id,
          nome: reg.nome,
          departamento: reg.departamento,
          registros: []
        };
      }
      funcionariosMap[reg.funcionario_id].registros.push(reg);
    }

    // Filtrar apenas quem está presente (mais entradas que saídas)
    const agora = new Date();
    const funcionariosOnline = [];

    for (const func of Object.values(funcionariosMap)) {
      const regs = func.registros;
      const entradas = regs.filter(r => r.tipo === 'ENTRADA').length;
      const saidas = regs.filter(r => r.tipo === 'SAIDA').length;

      if (entradas > saidas) {
        // Última entrada sem saída correspondente
        const ultimaEntrada = regs.filter(r => r.tipo === 'ENTRADA').at(-1);
        const entradaTime = new Date(ultimaEntrada.data_hora);
        const diffMs = agora - entradaTime;
        const horas = Math.floor(diffMs / 3600000);
        const minutos = Math.floor((diffMs % 3600000) / 60000);

        funcionariosOnline.push({
          funcionario_id: func.funcionario_id,
          nome: func.nome,
          departamento: func.departamento,
          hora_entrada: entradaTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tempo_trabalhado: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
        });
      }
    }

    res.json(funcionariosOnline);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/frequencia
 * Retorna frequência semanal de todos os funcionários com filtros.
 */
const frequencia = async (req, res, next) => {
  try {
    const { funcionario_id, departamento_id, data_inicio, data_fim } = req.query;

    // Período padrão: semana atual
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0=Dom
    const seg = new Date(hoje);
    seg.setDate(hoje.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
    const sex = new Date(seg);
    sex.setDate(seg.getDate() + 4);

    const inicio = data_inicio || seg.toISOString().split('T')[0];
    const fim = data_fim || sex.toISOString().split('T')[0];

    // Buscar funcionários com filtros
    let queryFuncionarios = `
      SELECT f.id, f.nome, d.nome AS departamento, d.id AS departamento_id
      FROM funcionarios f
      INNER JOIN departamentos d ON d.id = f.departamento_id
      WHERE 1=1
    `;
    const params = [];

    if (funcionario_id) {
      queryFuncionarios += ' AND f.id = ?';
      params.push(funcionario_id);
    }
    if (departamento_id) {
      queryFuncionarios += ' AND d.id = ?';
      params.push(departamento_id);
    }
    queryFuncionarios += ' ORDER BY f.nome ASC';

    const [funcionarios] = await pool.query(queryFuncionarios, params);

    // Buscar registros no período
    const [registros] = await pool.query(`
      SELECT funcionario_id, DATE(data_hora) AS data, tipo
      FROM registros
      WHERE DATE(data_hora) BETWEEN ? AND ?
      ORDER BY data_hora ASC
    `, [inicio, fim]);

    // Montar mapa de presença por funcionário/data
    const presencaMap = {};
    for (const reg of registros) {
      const key = `${reg.funcionario_id}_${reg.data}`;
      if (!presencaMap[key]) presencaMap[key] = { entradas: 0, saidas: 0 };
      if (reg.tipo === 'ENTRADA') presencaMap[key].entradas++;
      else presencaMap[key].saidas++;
    }

    // Gerar lista de datas no período
    const datas = [];
    const d = new Date(inicio);
    const fimDate = new Date(fim);
    while (d <= fimDate) {
      const dia = d.getDay();
      if (dia !== 0 && dia !== 6) { // Apenas dias úteis
        datas.push(d.toISOString().split('T')[0]);
      }
      d.setDate(d.getDate() + 1);
    }

    // Montar resultado
    const resultado = funcionarios.map(func => {
      const presenca = {};
      for (const data of datas) {
        const key = `${func.id}_${data}`;
        presenca[data] = presencaMap[key]
          ? (presencaMap[key].entradas > 0 ? 'presente' : 'ausente')
          : 'ausente';
      }
      return {
        funcionario_id: func.id,
        nome: func.nome,
        departamento: func.departamento,
        presenca
      };
    });

    res.json({ datas, funcionarios: resultado });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/previsoes
 * Previsão de frequência baseada em regressão linear histórica.
 */
const previsoes = async (req, res, next) => {
  try {
    // Buscar presença dos últimos 30 dias
    const [dados] = await pool.query(`
      SELECT
        DATE(data_hora) AS data,
        COUNT(DISTINCT CASE WHEN tipo = 'ENTRADA' THEN funcionario_id END) AS presentes
      FROM registros
      WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(data_hora)
      ORDER BY data ASC
    `);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM funcionarios'
    );

    if (dados.length < 3 || total === 0) {
      return res.json({
        probabilidade_presenca: 85,
        probabilidade_falta: 15,
        tendencia: 'estável',
        historico: []
      });
    }

    // Calcular médias para regressão linear simples
    const n = dados.length;
    const xs = dados.map((_, i) => i);
    const ys = dados.map(d => (d.presentes / total) * 100);

    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
    const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Previsão para o próximo dia
    const proximoDia = n;
    let previsto = Math.min(100, Math.max(0, slope * proximoDia + intercept));
    previsto = Math.round(previsto);

    const tendencia = slope > 1 ? 'crescente' : slope < -1 ? 'decrescente' : 'estável';

    res.json({
      probabilidade_presenca: previsto,
      probabilidade_falta: 100 - previsto,
      tendencia,
      historico: dados.map(d => ({
        data: d.data,
        presentes: d.presentes,
        percentual: Math.round((d.presentes / total) * 100)
      }))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/grafico-presenca
 * Dados para gráfico de presença/falta por período.
 */
const graficoPresenca = async (req, res, next) => {
  try {
    const { periodo = '7' } = req.query;
    const dias = parseInt(periodo);

    const [dados] = await pool.query(`
      SELECT
        DATE(data_hora) AS data,
        COUNT(DISTINCT CASE WHEN tipo = 'ENTRADA' THEN funcionario_id END) AS presentes
      FROM registros
      WHERE data_hora >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(data_hora)
      ORDER BY data ASC
    `, [dias]);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM funcionarios'
    );

    const resultado = dados.map(d => ({
      data: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      presentes: d.presentes,
      ausentes: total - d.presentes
    }));

    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

module.exports = { estatisticas, online, frequencia, previsoes, graficoPresenca };
