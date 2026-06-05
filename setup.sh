#!/bin/bash
# =============================================================
# SCRIPT DE INSTALAÇÃO - SISTEMA DE CONTROLE DE FREQUÊNCIA
# Execute: chmod +x setup.sh && ./setup.sh
# =============================================================

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  INSTALAÇÃO - CONTROLE DE FREQUÊNCIA     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ----- Verificar Node.js -----
if ! command -v node &>/dev/null; then
  echo "❌ Node.js não encontrado. Instale em https://nodejs.org"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# ----- Verificar MySQL -----
if ! command -v mysql &>/dev/null; then
  echo "⚠️  MySQL não encontrado no PATH. Certifique-se de que está instalado."
fi

# ----- Backend -----
echo ""
echo "📦 Instalando dependências do Backend..."
cd backend
npm install
echo "✅ Backend pronto."

# ----- Frontend -----
echo ""
echo "📦 Instalando dependências do Frontend..."
cd ../frontend
npm install
echo "✅ Frontend pronto."

cd ..

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  PRÓXIMOS PASSOS                         ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║  1. Configure backend/.env com senha DB  ║"
echo "║                                          ║"
echo "║  2. Crie o banco de dados:               ║"
echo "║     mysql -u root -p <                   ║"
echo "║       backend/config/database.sql        ║"
echo "║                                          ║"
echo "║  3. Execute o seed do administrador:     ║"
echo "║     cd backend && node config/seed.js    ║"
echo "║                                          ║"
echo "║  4. Inicie o backend:                    ║"
echo "║     cd backend && npm run dev            ║"
echo "║                                          ║"
echo "║  5. Inicie o frontend (outro terminal):  ║"
echo "║     cd frontend && npm start             ║"
echo "║                                          ║"
echo "║  6. Acesse:                              ║"
echo "║     Admin:      localhost:3000/login     ║"
echo "║     Ponto:      localhost:3000/ponto     ║"
echo "║                                          ║"
echo "║  Login padrão:                           ║"
echo "║     Email: adm@gmail.com                 ║"
echo "║     Senha: adm                           ║"
echo "╚══════════════════════════════════════════╝"
echo ""
