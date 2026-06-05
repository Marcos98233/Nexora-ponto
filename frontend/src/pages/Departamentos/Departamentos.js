// Página de Departamentos - CRUD completo
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Chip, Tooltip, CircularProgress, Alert,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Business as BusinessIcon, People as PeopleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';

const COR_ICONS = ['#1565C0', '#6A1B9A', '#00695C', '#E65100', '#C62828', '#1B5E20'];

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await api.get('/departamentos');
      setDepartamentos(res.data);
    } catch {
      toast.error('Erro ao carregar departamentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () => {
    setEditando(null);
    setNome('');
    setErro('');
    setDialogOpen(true);
  };

  const abrirEditar = (dept) => {
    setEditando(dept);
    setNome(dept.nome);
    setErro('');
    setDialogOpen(true);
  };

  const salvar = async () => {
    if (!nome.trim()) { setErro('Nome obrigatório'); return; }
    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/departamentos/${editando.id}`, { nome });
        toast.success('Departamento atualizado!');
      } else {
        await api.post('/departamentos', { nome });
        toast.success('Departamento criado!');
      }
      setDialogOpen(false);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar departamento.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    try {
      await api.delete(`/departamentos/${id}`);
      toast.success('Departamento excluído!');
      setDeleteDialog(null);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao excluir.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Departamentos</Typography>
          <Typography variant="body2" color="text.secondary">
            Organize os setores da empresa
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCriar} size="large">
          Novo Departamento
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : departamentos.length === 0 ? (
        <Alert severity="info">Nenhum departamento cadastrado.</Alert>
      ) : (
        <Grid container spacing={2}>
          {departamentos.map((dept, idx) => (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
              <Card sx={{ '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <Box sx={{
                        bgcolor: `${COR_ICONS[idx % COR_ICONS.length]}20`,
                        borderRadius: 2,
                        p: 1.2,
                        display: 'flex'
                      }}>
                        <BusinessIcon sx={{ color: COR_ICONS[idx % COR_ICONS.length], fontSize: 28 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} noWrap>
                          {dept.nome}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {dept.total_funcionarios} funcionário{dept.total_funcionarios !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => abrirEditar(dept)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small" color="error"
                          onClick={() => setDeleteDialog(dept)}
                          disabled={dept.total_funcionarios > 0}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  {dept.total_funcionarios > 0 && (
                    <Chip
                      label="Possui funcionários"
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ mt: 1.5 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>
          {editando ? 'Editar Departamento' : 'Novo Departamento'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Nome do departamento"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErro(''); }}
            margin="normal"
            error={!!erro}
            helperText={erro}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && salvar()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={salvando}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={salvando}>
            {salvando ? <CircularProgress size={20} /> : editando ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Exclusão */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle fontWeight={700}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Excluir o departamento <strong>{deleteDialog?.nome}</strong>?
          </Typography>
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
