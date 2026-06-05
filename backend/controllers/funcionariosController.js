// Controller de Funcionários - CRUD completo com geração de token UUID
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

/**
 * Valida formato de CPF (apenas dígitos, 11 caracteres).
 */
const validarCPF = (cpf) => {
  const numeros = cpf.replace(/\D/g, '');
  return numeros.length === 11;
};

/**
 * Valida formato de email.
 */
const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * GET /api/funcionarios
 * Lista todos os funcionários com nome do departamento.
 */
const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.id, f.nome, f.cpf, f.email, f.token, f.created_at,
        d.id AS departamento_id, d.nome AS departamento_nome
      FROM funcionarios f
      INNER JOIN departamentos d ON d.id = f.departamento_id
      ORDER BY f.nome ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/funcionarios/:id
 * Retorna um funcionário específico.
 */
const buscar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT f.id, f.nome, f.cpf, f.email, f.token, f.created_at,
        d.id AS departamento_id, d.nome AS departamento_nome
      FROM funcionarios f
      INNER JOIN departamentos d ON d.id = f.departamento_id
      WHERE f.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/funcionarios
 * Cria um novo funcionário e gera automaticamente um token UUID único.
 */
const criar = async (req, res, next) => {
  try {
    const { nome, cpf, email, departamento_id } = req.body;

    // Validações
    if (!nome || !cpf || !email || !departamento_id) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({ message: 'CPF inválido. Informe 11 dígitos numéricos.' });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }

    // Verificar se departamento existe
    const [dept] = await pool.query('SELECT id FROM departamentos WHERE id = ?', [departamento_id]);
    if (dept.length === 0) {
      return res.status(400).json({ message: 'Departamento não encontrado.' });
    }

    // Gerar token UUID único (nunca poderá ser alterado)
    const token = uuidv4();

    const [result] = await pool.query(
      'INSERT INTO funcionarios (nome, cpf, email, token, departamento_id) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), cpf.replace(/\D/g, ''), email.trim().toLowerCase(), token, departamento_id]
    );

    const [novo] = await pool.query(`
      SELECT f.id, f.nome, f.cpf, f.email, f.token, f.created_at,
        d.id AS departamento_id, d.nome AS departamento_nome
      FROM funcionarios f
      INNER JOIN departamentos d ON d.id = f.departamento_id
      WHERE f.id = ?
    `, [result.insertId]);

    res.status(201).json(novo[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/funcionarios/:id
 * Atualiza dados do funcionário (exceto o token, que é imutável).
 */
const atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, cpf, email, departamento_id } = req.body;

    if (!nome || !cpf || !email || !departamento_id) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!validarCPF(cpf)) {
      return res.status(400).json({ message: 'CPF inválido. Informe 11 dígitos numéricos.' });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }

    // Verificar se departamento existe
    const [dept] = await pool.query('SELECT id FROM departamentos WHERE id = ?', [departamento_id]);
    if (dept.length === 0) {
      return res.status(400).json({ message: 'Departamento não encontrado.' });
    }

    const [result] = await pool.query(
      `UPDATE funcionarios
       SET nome = ?, cpf = ?, email = ?, departamento_id = ?
       WHERE id = ?`,
      [nome.trim(), cpf.replace(/\D/g, ''), email.trim().toLowerCase(), departamento_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    const [atualizado] = await pool.query(`
      SELECT f.id, f.nome, f.cpf, f.email, f.token, f.created_at,
        d.id AS departamento_id, d.nome AS departamento_nome
      FROM funcionarios f
      INNER JOIN departamentos d ON d.id = f.departamento_id
      WHERE f.id = ?
    `, [id]);

    res.json(atualizado[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/funcionarios/:id
 * Remove um funcionário e todos os seus registros.
 */
const excluir = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM funcionarios WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    res.json({ message: 'Funcionário excluído com sucesso.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscar, criar, atualizar, excluir };
