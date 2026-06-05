// Tema customizado Material UI
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#1976D2',
      dark: '#0D47A1',
      contrastText: '#fff'
    },
    secondary: {
      main: '#00897B',
      light: '#26A69A',
      dark: '#00695C'
    },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    warning: { main: '#F57F17' },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#212121',
      secondary: '#616161'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#1565C0',
            color: '#fff',
            fontWeight: 700
          }
        }
      }
    }
  }
});

export default theme;
