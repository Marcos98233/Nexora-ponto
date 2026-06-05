-- ============================================================
-- SCRIPT SQL COMPLETO - SISTEMA DE CONTROLE DE FREQUÊNCIA
-- ============================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS controle_ponto
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE controle_ponto;

-- ============================================================
-- TABELA: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA: departamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS departamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA: funcionarios
-- ============================================================
CREATE TABLE IF NOT EXISTS funcionarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  departamento_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE RESTRICT
);

-- ============================================================
-- TABELA: registros
-- ============================================================
CREATE TABLE IF NOT EXISTS registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funcionario_id INT NOT NULL,
  tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
  data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

-- ============================================================
-- SEEDS: Dados iniciais
-- ============================================================

-- Administrador padrão (senha: adm, hash bcrypt rounds=10)
INSERT IGNORE INTO admins (email, senha)
VALUES (
  'adm@gmail.com',
  '$2b$10$dUBeppgYM22Z005pzgLkA.VIxpdImTrdefqJVGKCI2RPxRPQP8U6m'
);

-- Departamentos padrão
INSERT IGNORE INTO departamentos (nome) VALUES
  ('RH'),
  ('Financeiro'),
  ('Comercial'),
  ('TI'),
  ('Produção');
