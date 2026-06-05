// Layout principal com Sidebar e Navbar
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Fingerprint as FingerprintIcon,
  MonitorHeart as MonitorIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const menuItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Funcionários', path: '/funcionarios', icon: <PeopleIcon /> },
  { label: 'Departamentos', path: '/departamentos', icon: <BusinessIcon /> },
  { label: 'Frequência', path: '/frequencia', icon: <CalendarIcon /> },
  { label: 'Monitoramento', path: '/monitoramento', icon: <MonitorIcon /> },
  { label: 'Relatórios', path: '/relatorios', icon: <AssessmentIcon /> },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1565C0' }}>
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, minHeight: 64 }}>
        <FingerprintIcon sx={{ color: '#fff', fontSize: 32 }} />
        {(!isMobile || mobileOpen) && (
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            FrequênciaApp
          </Typography>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Navegação */}
      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <Tooltip title={!drawerOpen && !isMobile ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    minHeight: 44
                  }}
                >
                  <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{ color: '#fff', '& span': { fontWeight: isActive ? 700 : 400 } }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Usuário logado */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
            {admin?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
              Administrador
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {admin?.email}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, py: 0.5 }}
        >
          <ListItemIcon sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 30 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sair" sx={{ color: 'rgba(255,255,255,0.7)', '& span': { fontSize: '0.85rem' } }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar mobile */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <FingerprintIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>FrequênciaApp</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', position: 'fixed', height: '100%' }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          mt: isMobile ? 8 : 0,
          minHeight: '100vh',
          p: { xs: 2, md: 3 }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
