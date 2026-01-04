import {
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
  Box,
  Grid,
  Paper,
  InputAdornment,
  alpha,
} from '@mui/material';
import type { DealInput, DealBreakdown } from '../lib/calc';
import { formatGBP } from '../lib/money';

interface DealInputsCardProps {
  dealInput: DealInput;
  breakdown: DealBreakdown | null;
  onDealInputChange: (input: DealInput) => void;
}

interface StatBlockProps {
  label: string;
  value: string;
  color?: string;
}

function StatBlock({ label, value, color }: StatBlockProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: color ? alpha(color, 0.08) : 'background.default',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: color || 'text.primary',
          fontSize: '1.1rem',
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function DealInputsCard({
  dealInput,
  breakdown,
  onDealInputChange,
}: DealInputsCardProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const amount = parseFloat(value);
    if (value === '' || (!isNaN(amount) && amount >= 0)) {
      onDealInputChange({
        ...dealInput,
        dealAmount: value === '' ? 0 : amount,
      });
    }
  };

  const handleVATToggle = (_: React.MouseEvent<HTMLElement>, value: boolean | null) => {
    if (value !== null) {
      onDealInputChange({ ...dealInput, includesVAT: value });
    }
  };

  const handleVATRegisteredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDealInputChange({ ...dealInput, vatRegistered: e.target.checked });
  };

  const showEmptyState = dealInput.dealAmount <= 0;

  return (
    <Card data-testid="card-deal-inputs">
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Deal Inputs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Planning tool only — expenses are ignored
        </Typography>

        <TextField
          label="Deal Amount"
          type="number"
          value={dealInput.dealAmount || ''}
          onChange={handleAmountChange}
          fullWidth
          placeholder="0.00"
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>,
          }}
          helperText="Enter the invoice value for the client"
          sx={{ mb: 3 }}
          data-testid="input-deal-amount"
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            VAT Treatment
          </Typography>
          <ToggleButtonGroup
            value={dealInput.includesVAT}
            exclusive
            onChange={handleVATToggle}
            disabled={!dealInput.vatRegistered}
            fullWidth
            sx={{ mb: 1 }}
          >
            <ToggleButton value={true} data-testid="button-includes-vat">
              Includes VAT
            </ToggleButton>
            <ToggleButton value={false} data-testid="button-excludes-vat">
              Excludes VAT
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={dealInput.vatRegistered}
              onChange={handleVATRegisteredChange}
              data-testid="switch-vat-registered"
            />
          }
          label="VAT Registered"
          sx={{ mb: 1 }}
        />
        {!dealInput.vatRegistered && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            VAT is ignored when not VAT registered
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <StatBlock
                label="Net (ex VAT)"
                value={showEmptyState ? '—' : formatGBP(breakdown?.net || 0)}
              />
            </Grid>
            <Grid size={6}>
              <StatBlock
                label="VAT Pot"
                value={showEmptyState ? '—' : formatGBP(breakdown?.vat || 0)}
                color="#f59e0b"
              />
            </Grid>
            <Grid size={6}>
              <StatBlock
                label="Corporation Tax"
                value={showEmptyState ? '—' : formatGBP(breakdown?.corpTax || 0)}
                color="#ef4444"
              />
            </Grid>
            <Grid size={6}>
              <StatBlock
                label="Dividend Pool"
                value={showEmptyState ? '—' : formatGBP(breakdown?.dividendPool || 0)}
                color="#22c55e"
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
