// Página de Relatórios - Geração de PDF e Excel
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Divider, Alert, CircularProgress
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function Relatorios() {
  const [departamentos, setDepartamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    funcionario_id: '',
    departamento_id: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0]
  });
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [deptRes, funcRes] = await Promise.all([
          api.get('/departamentos'),
          api.get('/funcionarios')
        ]);
        setDepartamentos(deptRes.data);
        setFuncionarios(funcRes.data);
      } catch {
        toast.error('Erro ao carregar filtros.');
      }
    };
    carregar();
  }, []);

  // Monta query string com filtros ativos
  const buildQuery = () => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filtros).filter(([, v]) => v))
    );
    return params.toString();
  };

  // Download de arquivo binário
  const downloadArquivo = async (url, tipo) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}${url}?${buildQuery()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao gerar relatório.');
      }

      const blob = await response.blob();
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;

      const periodo = `${filtros.data_inicio}_${filtros.data_fim}`;
      a.download = tipo === 'pdf'
        ? `relatorio-frequencia-${periodo}.pdf`
        : `relatorio-frequencia-${periodo}.xlsx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);

      toast.success(`Relatório ${tipo.toUpperCase()} gerado com sucesso!`);
    } catch (err) {
      toast.error(err.message || `Erro ao gerar ${tipo.toUpperCase()}.`);
    }
  };

  const gerarPDF = async () => {
    setLoadingPdf(true);
    await downloadArquivo('/relatorios/pdf', 'pdf');
    setLoadingPdf(false);
  };

  const gerarExcel = async () => {
    setLoadingExcel(true);
    await downloadArquivo('/relatorios/excel', 'excel');
    setLoadingExcel(false);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Relatórios</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Exporte dados de frequência em PDF ou Excel
      </Typography>

      <Grid container spacing={3}>
        {/* Filtros */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Filtros do Relatório</Typography>
              </Box>

              <TextField
                fullWidth label="Data Início" type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
              <TextField
                fullWidth label="Data Fim" type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Funcionário (opcional)</InputLabel>
                <Select
                  value={filtros.funcionario_id}
                  onChange={(e) => setFiltros({ ...filtros, funcionario_id: e.target.value })}
                  label="Funcionário (opcional)"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {funcionarios.map(f => (
                    <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Departamento (opcional)</InputLabel>
                <Select
                  value={filtros.departamento_id}
                  onChange={(e) => setFiltros({ ...filtros, departamento_id: e.target.value })}
                  label="Departamento (opcional)"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {departamentos.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mt: 2 }}>
                O relatório inclui: frequência diária, horários de entrada e saída e horas trabalhadas.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Botões de download */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {/* PDF */}
            <Grid item xs={12}>
              <Card sx={{
                background: 'linear-gradient(135deg, #C62828 0%, #E53935 100%)',
                cursor: 'pointer',
                '&:hover': { boxShadow: 12, transform: 'translateY(-2px)' },
                transition: 'all 0.2s'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PdfIcon sx={{ fontSize: 56, color: '#fff' }} />
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="#fff">
                          Exportar PDF
                        </Typography>
                        <Typography color="rgba(255,255,255,0.8)">
                          Relatório formatado para impressão
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.65)">
                          Inclui tabela de frequência com entradas, saídas e horas trabalhadas
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={loadingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                      onClick={gerarPDF}
                      disabled={loadingPdf || !filtros.data_inicio || !filtros.data_fim}
                      sx={{ bgcolor: '#fff', color: '#C62828', '&:hover': { bgcolor: '#fce4e4' }, fontWeight: 700 }}
                      size="large"
                    >
                      {loadingPdf ? 'Gerando...' : 'Baixar PDF'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Excel */}
            <Grid item xs={12}>
              <Card sx={{
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                cursor: 'pointer',
                '&:hover': { boxShadow: 12, transform: 'translateY(-2px)' },
                transition: 'all 0.2s'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ExcelIcon sx={{ fontSize: 56, color: '#fff' }} />
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="#fff">
                          Exportar Excel
                        </Typography>
                        <Typography color="rgba(255,255,255,0.8)">
                          Planilha para análise de dados
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.65)">
                          Formato .xlsx compatível com Microsoft Excel e Google Sheets
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={loadingExcel ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                      onClick={gerarExcel}
                      disabled={loadingExcel || !filtros.data_inicio || !filtros.data_fim}
                      sx={{ bgcolor: '#fff', color: '#1B5E20', '&:hover': { bgcolor: '#e8f5e9' }, fontWeight: 700 }}
                      size="large"
                    >
                      {loadingExcel ? 'Gerando...' : 'Baixar Excel'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Dicas */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>💡 Dicas</Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    • Selecione um intervalo de datas para gerar o relatório do período desejado.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    • Filtre por funcionário ou departamento para relatórios específicos.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • O PDF é ideal para arquivamento e impressão. O Excel para análises e filtros.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
