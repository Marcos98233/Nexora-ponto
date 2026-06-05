// Conexão centralizada com o banco de dados MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'controle_ponto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-03:00'
});

module.exports = pool;
