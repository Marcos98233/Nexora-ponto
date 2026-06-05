// App principal com roteamento e configurações globais
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Funcionarios from './pages/Funcionarios/Funcionarios';
import Departamentos from './pages/Departamentos/Departamentos';
import Frequencia from './pages/Frequencia/Frequencia';
import Relatorios from './pages/Relatorios/Relatorios';
import RegistroPonto from './pages/RegistroPonto/RegistroPonto';
import Monitoramento from './pages/Monitoramento/Monitoramento';
import Layout from './components/Layout/Layout';

// Componente de rota protegida
const RotaProtegida = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? children : <Navigate to="/login" replace />;
};

// Componente de rota pública (redireciona se já logado)
const RotaPublica = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return !admin ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública: Registro de Ponto (sem login) */}
      <Route path="/ponto" element={<RegistroPonto />} />

      {/* Rota pública: Login do Administrador */}
      <Route path="/login" element={
        <RotaPublica><Login /></RotaPublica>
      } />

      {/* Rotas protegidas: painel administrativo */}
      <Route path="/" element={
        <RotaProtegida>
          <Layout />
        </RotaProtegida>
      }>
        <Route index element={<Dashboard />} />
        <Route path="funcionarios" element={<Funcionarios />} />
        <Route path="departamentos" element={<Departamentos />} />
        <Route path="frequencia" element={<Frequencia />} />
        <Route path="monitoramento" element={<Monitoramento />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  );
}

export default App;
