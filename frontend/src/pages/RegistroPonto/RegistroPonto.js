// Página pública de Registro de Ponto (sem necessidade de login)
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  CircularProgress, Divider, Chip, Link, Alert
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function RegistroPonto() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const registrar = async () => {
    if (!token.trim()) {
      toast.error('Informe o token de acesso.');
      return;
    }
    setLoading(true);
    setResultado(null);
    try {
      const res = await api.post('/ponto', { token: token.trim() });
      setResultado(res.data);
      setToken('');
      toast.success(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao registrar ponto.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') registrar();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #00897B 100%)',
        p: 2
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        {/* Card principal */}
        <Card sx={{ borderRadius: 4, overflow: 'hidden', mb: 2 }}>
          {/* Cabeçalho */}
          <Box sx={{ bgcolor: '#1565C0', py: 5, px: 3, textAlign: 'center' }}>
            <FingerprintIcon sx={{ fontSize: 72, color: '#fff', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
              Registro de Ponto
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
              Insira seu token para registrar presença
            </Typography>
            <Chip
              label={`${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`}
              sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }}
            />
          </Box>

          <CardContent sx={{ p: 4 }}>
            <TextField
              fullWidth
              label="Token de Acesso"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              variant="outlined"
              size="large"
              sx={{ mb: 3 }}
              InputProps={{
                sx: { fontFamily: 'monospace', fontSize: '1rem' }
              }}
              autoFocus
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={registrar}
              disabled={loading || !token.trim()}
              sx={{ py: 1.8, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Registrar'}
            </Button>

            {/* Resultado */}
            {resultado && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: resultado.tipo === 'ENTRADA' ? '#E8F5E9' : '#FFF3E0',
                  border: `2px solid ${resultado.tipo === 'ENTRADA' ? '#4CAF50' : '#FF9800'}`,
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                {resultado.tipo === 'ENTRADA'
                  ? <LoginIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 1 }} />
                  : <LogoutIcon sx={{ fontSize: 48, color: '#FF9800', mb: 1 }} />
                }

                <Chip
                  icon={<CheckCircleIcon />}
                  label={resultado.tipo === 'ENTRADA' ? '✓ ENTRADA REGISTRADA' : '✓ SAÍDA REGISTRADA'}
                  color={resultado.tipo === 'ENTRADA' ? 'success' : 'warning'}
                  sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2 }}
                />

                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {resultado.funcionario}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {resultado.departamento}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="h3" fontWeight={800} color={resultado.tipo === 'ENTRADA' ? 'success.main' : 'warning.main'}>
                  {resultado.hora}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {resultado.data}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Instrução */}
        <Alert severity="info" sx={{ borderRadius: 3, mb: 2 }}>
          <Typography variant="body2">
            <strong>Como funciona:</strong> O sistema identifica automaticamente se o próximo registro será <strong>Entrada</strong> ou <strong>Saída</strong>.
            Ex: 08:00 Entrada → 12:00 Saída → 13:00 Entrada → 18:00 Saída
          </Typography>
        </Alert>

        {/* Link para admin */}
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/login" sx={{ color: 'rgba(255,255,255,0.8)', textDecorationColor: 'rgba(255,255,255,0.4)' }}>
            Acesso Administrador →
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
