// Página de Funcionários - CRUD completo
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, Tooltip,
  InputAdornment, CircularProgress, Alert
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  ContentCopy as CopyIcon, Search as SearchIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const FORM_INICIAL = { nome: '', cpf: '', email: '', departamento_id: '' };

// Formata CPF: 00000000000 → 000.000.000-00
const formatarCPF = (cpf) => {
  const nums = cpf.replace(/\D/g, '').slice(0, 11);
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState({});

  const carregarDados = useCallback(async () => {
    try {
      const [funcRes, deptRes] = await Promise.all([
        api.get('/funcionarios'),
        api.get('/departamentos')
      ]);
      setFuncionarios(funcRes.data);
      setDepartamentos(deptRes.data);
    } catch {
      toast.error('Erro ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const abrirCriar = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setErros({});
    setDialogOpen(true);
  };

  const abrirEditar = (func) => {
    setEditando(func);
    setForm({
      nome: func.nome,
      cpf: func.cpf,
      email: func.email,
      departamento_id: func.departamento_id
    });
    setErros({});
    setDialogOpen(true);
  };

  const validarForm = () => {
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = 'Nome obrigatório';
    if (form.cpf.replace(/\D/g, '').length !== 11) novosErros.cpf = 'CPF inválido (11 dígitos)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) novosErros.email = 'Email inválido';
    if (!form.departamento_id) novosErros.departamento_id = 'Departamento obrigatório';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const salvar = async () => {
    if (!validarForm()) return;
    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/funcionarios/${editando.id}`, form);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        const res = await api.post('/funcionarios', form);
        toast.success(`Funcionário cadastrado! Token: ${res.data.token}`);
      }
      setDialogOpen(false);
      carregarDados();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar funcionário.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    try {
      await api.delete(`/funcionarios/${id}`);
      toast.success('Funcionário excluído com sucesso!');
      setDeleteDialog(null);
      carregarDados();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir funcionário.');
    }
  };

  const copiarToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.info('Token copiado para a área de transferência!');
  };

  // Filtro de busca
  const funcionariosFiltrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.cpf.includes(busca) ||
    f.email.toLowerCase().includes(busca.toLowerCase()) ||
    f.departamento_nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Funcionários</Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os funcionários da empresa
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCriar} size="large">
          Novo Funcionário
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* Busca */}
          <TextField
            fullWidth
            placeholder="Buscar por nome, CPF, email ou departamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
            sx={{ mb: 2 }}
            size="small"
          />

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : funcionariosFiltrados.length === 0 ? (
            <Alert severity="info">Nenhum funcionário encontrado.</Alert>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {funcionariosFiltrados.map((func) => (
                    <TableRow key={func.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BadgeIcon fontSize="small" color="primary" />
                          <Typography fontWeight={500}>{func.nome}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatarCPF(func.cpf)}</TableCell>
                      <TableCell>{func.email}</TableCell>
                      <TableCell>
                        <Chip label={func.departamento_nome} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', px: 1, py: 0.3, borderRadius: 1, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {func.token}
                          </Typography>
                          <Tooltip title="Copiar token">
                            <IconButton size="small" onClick={() => copiarToken(func.token)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton color="primary" onClick={() => abrirEditar(func)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton color="error" onClick={() => setDeleteDialog(func)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>
          {editando ? 'Editar Funcionário' : 'Novo Funcionário'}
        </DialogTitle>
        <DialogContent>
          {!editando && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Um token UUID único será gerado automaticamente e não poderá ser alterado.
            </Alert>
          )}

          <TextField
            fullWidth label="Nome completo" value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            margin="normal" error={!!erros.nome} helperText={erros.nome}
          />
          <TextField
            fullWidth label="CPF" value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            margin="normal" error={!!erros.cpf} helperText={erros.cpf || '11 dígitos numéricos'}
            placeholder="00000000000"
          />
          <TextField
            fullWidth label="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            margin="normal" error={!!erros.email} helperText={erros.email}
          />
          <FormControl fullWidth margin="normal" error={!!erros.departamento_id}>
            <InputLabel>Departamento</InputLabel>
            <Select
              value={form.departamento_id}
              onChange={(e) => setForm({ ...form, departamento_id: e.target.value })}
              label="Departamento"
            >
              {departamentos.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.nome}</MenuItem>
              ))}
            </Select>
            {erros.departamento_id && (
              <Typography variant="caption" color="error" ml={1}>{erros.departamento_id}</Typography>
            )}
          </FormControl>

          {editando && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              O token do funcionário não pode ser alterado.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={salvando}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={salvando}>
            {salvando ? <CircularProgress size={20} /> : editando ? 'Salvar' : 'Cadastrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle fontWeight={700}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o funcionário <strong>{deleteDialog?.nome}</strong>?
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            Todos os registros de ponto deste funcionário serão apagados.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialog(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={() => excluir(deleteDialog.id)}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
