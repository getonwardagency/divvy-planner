import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useState } from 'react';
import type { Settings, DividendRatePreset } from '../lib/calc';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onReset: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  settings,
  onSettingsChange,
  onReset,
}: SettingsDrawerProps) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handlePresetChange = (_: React.MouseEvent<HTMLElement>, value: DividendRatePreset | null) => {
    if (value) {
      onSettingsChange({ ...settings, dividendPreset: value });
    }
  };

  const handleVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= 0 && value <= 1) {
      onSettingsChange({ ...settings, vatRate: value });
    }
  };

  const handleCorpTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= 0 && value <= 1) {
      onSettingsChange({ ...settings, corpTaxRate: value });
    }
  };

  const handlePresetRateChange = (
    preset: DividendRatePreset,
    tier: 'basic' | 'higher' | 'additional',
    value: string
  ) => {
    const rate = parseFloat(value) / 100;
    if (!isNaN(rate) && rate >= 0 && rate <= 1) {
      onSettingsChange({
        ...settings,
        presetRates: {
          ...settings.presetRates,
          [preset]: {
            ...settings.presetRates[preset],
            [tier]: rate,
          },
        },
      });
    }
  };

  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= 0 && value <= 1) {
      onSettingsChange({ ...settings, customDividendRate: value });
    }
  };

  const handleConfirmReset = () => {
    onReset();
    setResetDialogOpen(false);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" data-testid="text-settings-title">Settings</Typography>
            <IconButton onClick={onClose} data-testid="button-close-settings">
              <CloseIcon />
            </IconButton>
          </Box>

          <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Default Values</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.defaultIncludesVAT}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, defaultIncludesVAT: e.target.checked })
                    }
                    data-testid="switch-default-includes-vat"
                  />
                }
                label="Amount includes VAT by default"
                sx={{ mb: 2, display: 'block' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.defaultVATRegistered}
                    onChange={(e) =>
                      onSettingsChange({ ...settings, defaultVATRegistered: e.target.checked })
                    }
                    data-testid="switch-default-vat-registered"
                  />
                }
                label="VAT registered by default"
                sx={{ display: 'block' }}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Tax Rates</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="VAT Rate"
                type="number"
                value={(settings.vatRate * 100).toFixed(0)}
                onChange={handleVatRateChange}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Standard UK VAT rate"
                sx={{ mb: 3 }}
                data-testid="input-vat-rate"
              />
              <TextField
                label="Corporation Tax Rate"
                type="number"
                value={(settings.corpTaxRate * 100).toFixed(0)}
                onChange={handleCorpTaxRateChange}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="UK main rate for companies with profits over £250k"
                data-testid="input-corp-tax-rate"
              />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Dividend Presets</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Select which preset set to use for dividend tax rates:
              </Typography>
              <ToggleButtonGroup
                value={settings.dividendPreset}
                exclusive
                onChange={handlePresetChange}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="current" data-testid="button-preset-current">
                  Current
                </ToggleButton>
                <ToggleButton value="april2026" data-testid="button-preset-april2026">
                  From April 2026
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                {settings.dividendPreset === 'current' ? 'Current' : 'From April 2026'} Rates
              </Typography>
              
              <TextField
                label="Basic Rate"
                type="number"
                value={(settings.presetRates[settings.dividendPreset].basic * 100).toFixed(2)}
                onChange={(e) =>
                  handlePresetRateChange(settings.dividendPreset, 'basic', e.target.value)
                }
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ mb: 2 }}
                data-testid="input-basic-rate"
              />
              <TextField
                label="Higher Rate"
                type="number"
                value={(settings.presetRates[settings.dividendPreset].higher * 100).toFixed(2)}
                onChange={(e) =>
                  handlePresetRateChange(settings.dividendPreset, 'higher', e.target.value)
                }
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ mb: 2 }}
                data-testid="input-higher-rate"
              />
              <TextField
                label="Additional Rate"
                type="number"
                value={(settings.presetRates[settings.dividendPreset].additional * 100).toFixed(2)}
                onChange={(e) =>
                  handlePresetRateChange(settings.dividendPreset, 'additional', e.target.value)
                }
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                data-testid="input-additional-rate"
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                Custom Rate
              </Typography>
              <TextField
                label="Custom Dividend Tax Rate"
                type="number"
                value={(settings.customDividendRate * 100).toFixed(2)}
                onChange={handleCustomRateChange}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Used when 'Custom' is selected on the main screen"
                data-testid="input-custom-rate"
              />
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="text"
              color="error"
              startIcon={<RestartAltIcon />}
              onClick={() => setResetDialogOpen(true)}
              fullWidth
              data-testid="button-reset-defaults"
            >
              Reset to Defaults
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Settings?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset all settings to their default values. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} data-testid="button-cancel-reset">
            Cancel
          </Button>
          <Button onClick={handleConfirmReset} color="error" variant="contained" data-testid="button-confirm-reset">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
