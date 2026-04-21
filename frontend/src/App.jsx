import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ProcurementPage from './pages/ProcurementPage';
import AlertsPage from './pages/AlertsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import GlobalFeedback from './components/GlobalFeedback';

const muiTheme = createTheme({
  shape: {
    borderRadius: 16
  },
  components: {
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: 'small'
      }
    },
    MuiFormControl: {
      defaultProps: {
        fullWidth: true,
        size: 'small'
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16
        }
      }
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 38
        }
      }
    }
  }
});

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <PreferencesProvider>
            <AppProvider>
              <GlobalFeedback />
              <Layout>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <InventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/procurement"
                    element={
                      <ProtectedRoute>
                        <ProcurementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/alerts"
                    element={
                      <ProtectedRoute>
                        <AlertsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-insights"
                    element={
                      <ProtectedRoute>
                        <AIInsightsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            </AppProvider>
          </PreferencesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
