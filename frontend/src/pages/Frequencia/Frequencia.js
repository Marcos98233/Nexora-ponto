// Página de Controle de Frequência - Visão semanal com filtros
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Grid, Chip, CircularProgress, Alert, Button, Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterList as FilterIcon,
  ClearAll as ClearIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Formata data YYYY-MM-DD para DD/MM
const formatarData = (data) => {
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
};

// Retorna nome do dia da semana abreviado
const nomeDia = (data) => {
  const d = new Date(data + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
};

export default function Frequencia() {
  const [dados, setDados] = useState({ datas: [], funcionarios: [] });
  const [departamentos, setDepartamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros - padrão: semana atual
  const getInicioSemana = () => {
    const hoje = new Date();
    const dia = hoje.getDay();
    const seg = new Date(hoje);
    seg.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1));
    return seg.toISOString().split('T')[0];
  };

  const getFimSemana = () => {
    const hoje = new Date();
    const dia = hoje.getDay();
    const seg = new Date(hoje);
    seg.setDate(hoje.getDate() - (dia === 0 ? 6 : dia - 1));
    const sex = new Date(seg);
    sex.setDate(seg.getDate() + 4);
    return sex.toISOString().split('T')[0];
  };

  const [filtros, setFiltros] = useState({
    funcionario_id: '',
    departamento_id: '',
    data_inicio: getInicioSemana(),
    data_fim: getFimSemana()
  });

  const carregar = useCallback(async (params = filtros) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      );
      const [freqRes, deptRes, funcRes] = await Promise.all([
        api.get(`/dashboard/frequencia?${query}`),
        api.get('/departamentos'),
        api.get('/funcionarios')
      ]);
      setDados(freqRes.data);
      setDepartamentos(deptRes.data);
      setFuncionarios(funcRes.data);
    } catch {
      toast.error('Erro ao carregar frequência.');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => { carregar(); }, []); // eslint-disable-line

  const aplicarFiltros = () => carregar(filtros);

  const limparFiltros = () => {
    const novo = {
      funcionario_id: '',
      departamento_id: '',
      data_inicio: getInicioSemana(),
      data_fim: getFimSemana()
    };
    setFiltros(novo);
    carregar(novo);
  };

  // Contar presentes e ausentes
  const totalPresentes = (func) =>
    Object.values(func.presenca).filter(v => v === 'presente').length;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Controle de Frequência</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Visualize a frequência semanal dos funcionários
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon color="primary" />
            <Typography fontWeight={700}>Filtros</Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Funcionário</InputLabel>
                <Select
                  value={filtros.funcionario_id}
                  onChange={(e) => setFiltros({ ...filtros, funcionario_id: e.target.value })}
                  label="Funcionário"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {funcionarios.map(f => (
                    <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={filtros.departamento_id}
                  onChange={(e) => setFiltros({ ...filtros, departamento_id: e.target.value })}
                  label="Departamento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {departamentos.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth size="small" label="Data Início" type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth size="small" label="Data Fim" type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button fullWidth variant="contained" onClick={aplicarFiltros} size="medium">
                Filtrar
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button fullWidth variant="outlined" onClick={limparFiltros} startIcon={<ClearIcon />} size="medium">
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de frequência */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : dados.funcionarios.length === 0 ? (
            <Alert severity="info">Nenhum registro encontrado para o período.</Alert>
          ) : (
            <>
              {/* Legenda */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="caption">Presente</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CancelIcon color="error" fontSize="small" />
                  <Typography variant="caption">Ausente</Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 180 }}>Funcionário</TableCell>
                      <TableCell sx={{ minWidth: 130 }}>Departamento</TableCell>
                      {dados.datas.map(data => (
                        <TableCell key={data} align="center" sx={{ minWidth: 70 }}>
                          <Typography variant="caption" display="block" fontWeight={700}>
                            {nomeDia(data)}
                          </Typography>
                          <Typography variant="caption">
                            {formatarData(data)}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ minWidth: 90 }}>Presença</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dados.funcionarios.map((func) => {
                      const presentes = totalPresentes(func);
                      const total = dados.datas.length;
                      const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
                      return (
                        <TableRow key={func.funcionario_id} hover>
                          <TableCell>
                            <Typography fontWeight={500} variant="body2">{func.nome}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={func.departamento} size="small" variant="outlined" />
                          </TableCell>
                          {dados.datas.map(data => (
                            <TableCell key={data} align="center">
                              <Tooltip title={func.presenca[data] === 'presente' ? 'Presente' : 'Ausente'}>
                                {func.presenca[data] === 'presente'
                                  ? <CheckCircleIcon color="success" fontSize="small" />
                                  : <CancelIcon color="error" fontSize="small" />
                                }
                              </Tooltip>
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <Chip
                              label={`${presentes}/${total} (${pct}%)`}
                              size="small"
                              color={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error'}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
