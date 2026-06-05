// Página de Login do Administrador
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Divider, Link
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility, VisibilityOff
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error('Preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao fazer login.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #00897B 100%)',
        p: 2
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4, overflow: 'hidden' }}>
        {/* Banner superior */}
        <Box sx={{ bgcolor: '#1565C0', py: 4, px: 3, textAlign: 'center' }}>
          <FingerprintIcon sx={{ fontSize: 56, color: '#fff', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
            Controle de Frequência
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
            Painel Administrativo
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3} textAlign="center">
            Faça seu login
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                )
              }}
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="Senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setMostrarSenha(!mostrarSenha)} edge="end">
                      {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Registrar ponto como funcionário?
            </Typography>
            <Link href="/ponto" underline="hover" fontWeight={600}>
              Acessar registro de ponto →
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
