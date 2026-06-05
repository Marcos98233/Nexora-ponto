// Middleware de autenticação JWT
const jwt = require('jsonwebtoken');

/**
 * Verifica se o token JWT é válido.
 * Protege todas as rotas administrativas.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.admin = decoded; // Disponibiliza dados do admin na requisição
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

module.exports = authMiddleware;
