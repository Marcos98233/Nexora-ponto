// Página de Monitoramento em Tempo Real (Socket.IO)
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Avatar, CircularProgress, Alert, Badge, IconButton, Tooltip
} from '@mui/material';
import {
  Circle as CircleIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// Conectar ao servidor Socket.IO
let socket;

export default function Monitoramento() {
  const [funcionariosOnline, setFuncionariosOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conectado, setConectado] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  useEffect(() => {
    // Inicializar conexão Socket.IO
    socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setConectado(true);
      setLoading(false);
      console.log('Socket conectado:', socket.id);
    });

    socket.on('disconnect', () => {
      setConectado(false);
    });

    // Receber lista de funcionários online
    socket.on('funcionarios-online', (lista) => {
      setFuncionariosOnline(lista);
      setUltimaAtualizacao(new Date());
      setLoading(false);
    });

    // Evento para recarregar quando houver novo registro
    socket.on('atualizar-online', () => {
      socket.emit('solicitar-online');
    });

    // Cleanup ao desmontar
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Atualizar manualmente
  const atualizar = () => {
    if (socket && conectado) {
      setLoading(true);
      socket.emit('solicitar-online');
    } else {
      toast.warning('Sem conexão com o servidor.');
    }
  };

  // Cores dos avatares
  const coresAvatar = ['#1565C0', '#6A1B9A', '#00695C', '#E65100', '#C62828', '#1B5E20', '#0277BD'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Monitoramento em Tempo Real</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <CircleIcon sx={{ fontSize: 12, color: conectado ? '#4CAF50' : '#f44336' }} />
            <Typography variant="body2" color="text.secondary">
              {conectado ? 'Conectado via Socket.IO' : 'Desconectado'}
            </Typography>
            {ultimaAtualizacao && (
              <Typography variant="caption" color="text.secondary">
                · Atualizado {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Typography>
            )}
          </Box>
        </Box>
        <Tooltip title="Atualizar agora">
          <IconButton onClick={atualizar} color="primary" size="large">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Contador */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1565C0 0%, #00897B 100%)' }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h2" fontWeight={800} sx={{ color: '#fff' }}>
            {funcionariosOnline.length}
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            {funcionariosOnline.length === 1 ? 'Funcionário trabalhando agora' : 'Funcionários trabalhando agora'}
          </Typography>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={48} />
        </Box>
      ) : funcionariosOnline.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <Typography fontWeight={600}>Nenhum funcionário trabalhando no momento.</Typography>
          <Typography variant="body2" mt={0.5}>
            Os funcionários aparecerão aqui após registrarem a entrada.
          </Typography>
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {funcionariosOnline.map((func, idx) => (
            <Grid item xs={12} sm={6} md={4} key={func.funcionario_id}>
              <Card sx={{
                '&:hover': { boxShadow: 8, transform: 'translateY(-2px)' },
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'visible'
              }}>
                {/* Badge online */}
                <Box sx={{ position: 'absolute', top: -6, right: -6 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={
                      <CircleIcon sx={{ fontSize: 16, color: '#4CAF50', filter: 'drop-shadow(0 0 4px #4CAF50)' }} />
                    }
                  >
                    <Box />
                  </Badge>
                </Box>

                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: coresAvatar[idx % coresAvatar.length],
                        width: 52,
                        height: 52,
                        fontSize: '1.3rem',
                        fontWeight: 700
                      }}
                    >
                      {func.nome.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={700} noWrap>
                        {func.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {func.departamento}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`Entrada: ${func.hora_entrada}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`⏱ ${func.tempo_trabalhado}h`}
                      size="small"
                      sx={{
                        bgcolor: '#E8F5E9',
                        color: '#2E7D32',
                        fontWeight: 700,
                        border: '1px solid #A5D6A7'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="caption" color="text.secondary" mt={3} display="block" textAlign="center">
        * Atualização automática a cada 30 segundos via Socket.IO
      </Typography>
    </Box>
  );
}
