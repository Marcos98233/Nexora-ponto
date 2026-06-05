// Script de seed: cria administrador padrão com hash bcrypt real
const bcrypt = require('bcrypt');
const pool = require('./database');

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Hash da senha 'adm' com bcrypt
    const hash = await bcrypt.hash('adm', 10);

    // Inserir admin padrão (ignora se já existir)
    await pool.query(
      `INSERT IGNORE INTO admins (email, senha) VALUES (?, ?)`,
      ['adm@gmail.com', hash]
    );

    // Inserir departamentos padrão
    const departamentos = ['RH', 'Financeiro', 'Comercial', 'TI', 'Produção'];
    for (const nome of departamentos) {
      await pool.query(
        `INSERT IGNORE INTO departamentos (nome) VALUES (?)`,
        [nome]
      );
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log('   Admin: adm@gmail.com / Senha: adm');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
    process.exit(1);
  }
}

seed();
