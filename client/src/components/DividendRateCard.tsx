import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import type { Settings, DividendRateTier } from '../lib/calc';
import { getAppliedDividendRate } from '../lib/calc';

interface DividendRateCardProps {
  settings: Settings;
  dividendRateTier: DividendRateTier;
  onDividendRateTierChange: (tier: DividendRateTier) => void;
  onCustomRateChange: (rate: number) => void;
}

export default function DividendRateCard({
  settings,
  dividendRateTier,
  onDividendRateTierChange,
  onCustomRateChange,
}: DividendRateCardProps) {
  const appliedRate = getAppliedDividendRate(dividendRateTier, settings);
  const presetName = settings.dividendPreset === 'current' ? 'Current' : 'From April 2026';

  const handleTierChange = (_: React.MouseEvent<HTMLElement>, value: DividendRateTier | null) => {
    if (value) {
      onDividendRateTierChange(value);
    }
  };

  const handleCustomRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= 0 && value <= 1) {
      onCustomRateChange(value);
    }
  };

  return (
    <Card data-testid="card-dividend-rate">
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Dividend Tax Assumption
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select an effective dividend tax rate for calculations
        </Typography>

        <ToggleButtonGroup
          value={dividendRateTier}
          exclusive
          onChange={handleTierChange}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="basic" data-testid="button-tier-basic">
            Basic
          </ToggleButton>
          <ToggleButton value="higher" data-testid="button-tier-higher">
            Higher
          </ToggleButton>
          <ToggleButton value="additional" data-testid="button-tier-additional">
            Additional
          </ToggleButton>
          <ToggleButton value="custom" data-testid="button-tier-custom">
            Custom
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Applied:
          </Typography>
          <Chip
            label={`${(appliedRate * 100).toFixed(2)}%`}
            color="primary"
            sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
            data-testid="chip-applied-rate"
          />
          {dividendRateTier !== 'custom' && (
            <Typography variant="caption" color="text.secondary">
              ({presetName} preset)
            </Typography>
          )}
        </Box>

        {dividendRateTier === 'custom' && (
          <Box>
            <TextField
              label="Custom Rate"
              type="number"
              value={(settings.customDividendRate * 100).toFixed(2)}
              onChange={handleCustomRateInputChange}
              fullWidth
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="This is a simplified effective rate assumption"
              data-testid="input-custom-dividend-rate"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
