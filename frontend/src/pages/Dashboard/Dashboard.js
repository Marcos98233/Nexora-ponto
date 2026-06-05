// Página Dashboard com estatísticas e gráficos
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Chip, LinearProgress, Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../../services/api';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

// Card de estatística
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700} color={color}>
            {value ?? '—'}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{
          bgcolor: `${color}20`,
          borderRadius: 3,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [grafico, setGrafico] = useState([]);
  const [previsao, setPrevisao] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      const [statsRes, graficoRes, previsaoRes] = await Promise.all([
        api.get('/dashboard/estatisticas'),
        api.get('/dashboard/grafico-presenca?periodo=14'),
        api.get('/dashboard/previsoes')
      ]);
      setStats(statsRes.data);
      setGrafico(graficoRes.data);
      setPrevisao(previsaoRes.data);
    } catch {
      toast.error('Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 60000);
    return () => clearInterval(intervalo);
  }, [carregarDados]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Dados do gráfico de barras - Presença vs Falta
  const barData = {
    labels: grafico.map(g => g.data),
    datasets: [
      {
        label: 'Presentes',
        data: grafico.map(g => g.presentes),
        backgroundColor: '#1976D2',
        borderRadius: 6
      },
      {
        label: 'Ausentes',
        data: grafico.map(g => g.ausentes),
        backgroundColor: '#EF5350',
        borderRadius: 6
      }
    ]
  };

  // Dados do gráfico de rosca - Hoje
  const doughnutData = {
    labels: ['Presentes', 'Ausentes'],
    datasets: [{
      data: [stats?.presentes || 0, stats?.ausentes || 0],
      backgroundColor: ['#1976D2', '#EF5350'],
      borderWidth: 0
    }]
  };

  // Gráfico de linha - Previsão histórica
  const lineData = {
    labels: previsao?.historico?.map(h => new Date(h.data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) || [],
    datasets: [{
      label: '% Presença',
      data: previsao?.historico?.map(h => h.percentual) || [],
      borderColor: '#00897B',
      backgroundColor: 'rgba(0,137,123,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4
    }]
  };

  const tendenciaIcon = previsao?.tendencia === 'crescente'
    ? <TrendingUpIcon color="success" />
    : previsao?.tendencia === 'decrescente'
      ? <TrendingDownIcon color="error" />
      : <TrendingFlatIcon color="warning" />;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Visão geral da frequência de funcionários
      </Typography>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="Funcionários" value={stats?.total_funcionarios} icon={<PeopleIcon />} color="#1565C0" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="Departamentos" value={stats?.total_departamentos} icon={<BusinessIcon />} color="#6A1B9A" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="Presentes" value={stats?.presentes} icon={<CheckCircleIcon />} color="#2E7D32" subtitle="Trabalhando agora" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="Ausentes" value={stats?.ausentes} icon={<CancelIcon />} color="#C62828" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="Entradas Hoje" value={stats?.entradas_dia} icon={<LoginIcon />} color="#00695C" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="Saídas Hoje" value={stats?.saidas_dia} icon={<LogoutIcon />} color="#E65100" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        {/* Gráfico de barras */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Presença vs Ausência — Últimos 14 dias
              </Typography>
              <Bar data={barData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de rosca - hoje */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600} mb={2} alignSelf="flex-start">
                Situação Hoje
              </Typography>
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip label={`${stats?.presentes} presentes`} color="primary" size="small" />
                <Chip label={`${stats?.ausentes} ausentes`} color="error" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Previsão de frequência */}
      {previsao && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Histórico de Presença (%) — Últimos 30 dias
                </Typography>
                {lineData.labels.length > 0 ? (
                  <Line data={lineData} options={{ ...chartOptions, scales: { y: { min: 0, max: 100 } } }} />
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Sem dados históricos suficientes.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Previsão de Frequência
                  </Typography>
                  {tendenciaIcon}
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Tendência: <strong>{previsao.tendencia}</strong>
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box mb={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      Probabilidade de Presença
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {previsao.probabilidade_presenca}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={previsao.probabilidade_presenca}
                    color="success"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      Probabilidade de Falta
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="error.main">
                      {previsao.probabilidade_falta}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={previsao.probabilidade_falta}
                    color="error"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" mt={2} display="block">
                  * Previsão baseada em regressão linear dos últimos 30 dias.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
