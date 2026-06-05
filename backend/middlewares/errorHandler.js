// Middleware global de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err.message);

  // Erros de banco de dados MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Registro duplicado. Verifique CPF, email ou token já cadastrados.'
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      message: 'Não é possível excluir: registro referenciado em outro lugar.'
    });
  }

  // Erros de validação customizados
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  // Erro genérico
  return res.status(500).json({
    message: 'Erro interno do servidor.',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
