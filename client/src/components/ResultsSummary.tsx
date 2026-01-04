import { Paper, Typography, Grid, Box, alpha } from '@mui/material';
import type { DealResult, DealBreakdown } from '../lib/calc';
import { formatGBP } from '../lib/money';

interface ResultsSummaryProps {
  breakdown: DealBreakdown | null;
  result: DealResult | null;
  isEmpty: boolean;
}

interface SummaryTileProps {
  label: string;
  value: string;
  color: string;
  testId: string;
}

function SummaryTile({ label, value, color, testId }: SummaryTileProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        textAlign: 'center',
        backgroundColor: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.15)}`,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      data-testid={testId}
    >
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: color,
          fontSize: { xs: '1.2rem', sm: '1.5rem' },
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function ResultsSummary({ breakdown, result, isEmpty }: ResultsSummaryProps) {
  return (
    <Box sx={{ mb: 3 }} data-testid="section-results-summary">
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <SummaryTile
            label="VAT Pot"
            value={isEmpty ? '—' : formatGBP(breakdown?.vat || 0)}
            color="#f59e0b"
            testId="tile-vat-pot"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <SummaryTile
            label="Corp Tax"
            value={isEmpty ? '—' : formatGBP(breakdown?.corpTax || 0)}
            color="#ef4444"
            testId="tile-corp-tax"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <SummaryTile
            label="Dividend Pool"
            value={isEmpty ? '—' : formatGBP(breakdown?.dividendPool || 0)}
            color="#22c55e"
            testId="tile-dividend-pool"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <SummaryTile
            label="Total Tax"
            value={isEmpty ? '—' : formatGBP(result?.totalPersonalTax || 0)}
            color="#9333ea"
            testId="tile-total-tax"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <SummaryTile
            label="Take-Home"
            value={isEmpty ? '—' : formatGBP(result?.totalTakeHome || 0)}
            color="#1976d2"
            testId="tile-take-home"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
