// Controller de Departamentos - CRUD completo
const pool = require('../config/database');

/**
 * GET /api/departamentos
 * Lista todos os departamentos com contagem de funcionários.
 */
const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.id, d.nome, d.created_at,
        COUNT(f.id) AS total_funcionarios
      FROM departamentos d
      LEFT JOIN funcionarios f ON f.departamento_id = d.id
      GROUP BY d.id
      ORDER BY d.nome ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/departamentos
 * Cria um novo departamento.
 */
const criar = async (req, res, next) => {
  try {
    const { nome } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ message: 'Nome do departamento é obrigatório.' });
    }

    const [result] = await pool.query(
      'INSERT INTO departamentos (nome) VALUES (?)',
      [nome.trim()]
    );

    const [novo] = await pool.query('SELECT * FROM departamentos WHERE id = ?', [result.insertId]);
    res.status(201).json(novo[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/departamentos/:id
 * Atualiza o nome de um departamento.
 */
const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ message: 'Nome do departamento é obrigatório.' });
    }

    const [result] = await pool.query(
      'UPDATE departamentos SET nome = ? WHERE id = ?',
      [nome.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Departamento não encontrado.' });
    }

    const [atualizado] = await pool.query('SELECT * FROM departamentos WHERE id = ?', [id]);
    res.json(atualizado[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/departamentos/:id
 * Remove um departamento (apenas se não houver funcionários vinculados).
 */
const excluir = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar se há funcionários no departamento
    const [funcionarios] = await pool.query(
      'SELECT COUNT(*) as total FROM funcionarios WHERE departamento_id = ?',
      [id]
    );

    if (funcionarios[0].total > 0) {
      return res.status(409).json({
        message: 'Não é possível excluir: existem funcionários neste departamento.'
      });
    }

    const [result] = await pool.query('DELETE FROM departamentos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Departamento não encontrado.' });
    }

    res.json({ message: 'Departamento excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, criar, atualizar, excluir };
