// Controller de autenticação do administrador
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * POST /api/auth/login
 * Autentica o administrador e retorna um token JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // Buscar admin no banco
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const admin = rows[0];

    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, admin.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Gerar token JWT (expira em 8 horas)
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
