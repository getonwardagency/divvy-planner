import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Grid,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import theme from './lib/theme';
import logoUrl from '@assets/DivvyPlan_Logo_1767558279552.png';
import SettingsDrawer from './components/SettingsDrawer';
import DealInputsCard from './components/DealInputsCard';
import DirectorsCard from './components/DirectorsCard';
import DividendRateCard from './components/DividendRateCard';
import ResultsSummary from './components/ResultsSummary';
import DirectorsTable from './components/DirectorsTable';
import {
  loadSettings,
  saveSettings,
  loadLastState,
  saveLastState,
  resetSettings,
  type AppState,
} from './lib/storage';
import {
  calculateDealResult,
  validateDirectorSplits,
  DEFAULT_SETTINGS,
  type Settings,
  type DealInput,
  type Director,
  type SplitMethod,
  type DividendRateTier,
} from './lib/calc';

function App() {
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [appState, setAppState] = useState<AppState>(() => loadLastState(settings));

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveLastState(appState);
  }, [appState]);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const handleResetSettings = () => {
    const defaultSettings = resetSettings();
    setSettings(defaultSettings);
  };

  const handleDealInputChange = (dealInput: DealInput) => {
    setAppState((prev) => ({ ...prev, dealInput }));
  };

  const handleDirectorsChange = (directors: Director[]) => {
    setAppState((prev) => ({ ...prev, directors }));
  };

  const handleSplitMethodChange = (splitMethod: SplitMethod) => {
    setAppState((prev) => ({ ...prev, splitMethod }));
  };

  const handleDividendRateTierChange = (dividendRateTier: DividendRateTier) => {
    setAppState((prev) => ({ ...prev, dividendRateTier }));
  };

  const handleCustomRateChange = (rate: number) => {
    setSettings((prev) => ({ ...prev, customDividendRate: rate }));
  };

  const isEmpty = appState.dealInput.dealAmount <= 0;

  const splitIsValid = useMemo(() => {
    if (appState.splitMethod === 'equal') return true;
    return validateDirectorSplits(appState.directors);
  }, [appState.directors, appState.splitMethod]);

  const result = useMemo(() => {
    if (isEmpty) return null;
    return calculateDealResult(
      appState.dealInput,
      appState.directors,
      appState.splitMethod,
      appState.dividendRateTier,
      settings
    );
  }, [appState, settings, isEmpty]);

  const breakdown = result?.breakdown || null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <img 
                src={logoUrl} 
                alt="DivvyPlan" 
                style={{ width: 230 }}
                data-testid="img-logo"
              />
            </Box>
            <IconButton
              edge="end"
              onClick={() => setSettingsDrawerOpen(true)}
              data-testid="button-open-settings"
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 1 }} data-testid="text-page-title">
              Deal-to-Dividends Calculator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plan how a client deal converts to dividends for company directors. This is an internal planning tool only — not tax advice.
            </Typography>
          </Box>

          <ResultsSummary
            breakdown={breakdown}
            result={result}
            isEmpty={isEmpty}
          />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <DealInputsCard
                  dealInput={appState.dealInput}
                  breakdown={breakdown}
                  onDealInputChange={handleDealInputChange}
                />
                <DividendRateCard
                  settings={settings}
                  dividendRateTier={appState.dividendRateTier}
                  onDividendRateTierChange={handleDividendRateTierChange}
                  onCustomRateChange={handleCustomRateChange}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <DirectorsCard
                  directors={appState.directors}
                  splitMethod={appState.splitMethod}
                  onDirectorsChange={handleDirectorsChange}
                  onSplitMethodChange={handleSplitMethodChange}
                />
                <DirectorsTable
                  directors={result?.directors || []}
                  dealInput={appState.dealInput}
                  result={result}
                  settings={settings}
                  dividendRateTier={appState.dividendRateTier}
                  isEmpty={isEmpty}
                  isValid={splitIsValid}
                />
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Corporation Tax: {(settings.corpTaxRate * 100).toFixed(0)}% • VAT: {(settings.vatRate * 100).toFixed(0)}% • Using {settings.dividendPreset === 'current' ? 'Current' : 'From April 2026'} dividend rates
            </Typography>
          </Box>
        </Container>

        <SettingsDrawer
          open={settingsDrawerOpen}
          onClose={() => setSettingsDrawerOpen(false)}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onReset={handleResetSettings}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
