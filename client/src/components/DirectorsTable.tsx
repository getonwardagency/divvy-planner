import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Snackbar,
  Tooltip,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import type { DirectorResult, DealInput, DealResult, Settings, DividendRateTier } from '../lib/calc';
import { generateCopySummary } from '../lib/calc';
import { formatGBP } from '../lib/money';

interface DirectorsTableProps {
  directors: DirectorResult[];
  dealInput: DealInput;
  result: DealResult | null;
  settings: Settings;
  dividendRateTier: DividendRateTier;
  isEmpty: boolean;
  isValid: boolean;
}

export default function DirectorsTable({
  directors,
  dealInput,
  result,
  settings,
  dividendRateTier,
  isEmpty,
  isValid,
}: DirectorsTableProps) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async () => {
    if (!result || isEmpty || !isValid) return;

    const summary = generateCopySummary(dealInput, result, settings, dividendRateTier);
    try {
      await navigator.clipboard.writeText(summary);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasAdjustment = directors.some((d) => d.adjustedByPenny);

  return (
    <Card data-testid="card-results">
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Results
        </Typography>

        <TableContainer sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Director</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Split</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Dividend Share</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Tax Rate</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Personal Tax</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Take-Home</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Enter a deal amount to see results
                  </TableCell>
                </TableRow>
              ) : (
                directors.map((director) => (
                  <TableRow key={director.id} data-testid={`row-result-${director.id}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {director.name}
                        {director.adjustedByPenny && (
                          <Tooltip title="Adjusted by 1p to match totals" arrow>
                            <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                      data-testid={`cell-split-${director.id}`}
                    >
                      {(director.splitPercent * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                      data-testid={`cell-dividend-share-${director.id}`}
                    >
                      {formatGBP(director.dividendShare)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                      data-testid={`cell-tax-rate-${director.id}`}
                    >
                      {(director.appliedRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                      data-testid={`cell-personal-tax-${director.id}`}
                    >
                      {formatGBP(director.personalDividendTax)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
                      data-testid={`cell-take-home-${director.id}`}
                    >
                      {formatGBP(director.takeHome)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {hasAdjustment && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon fontSize="small" />}>
            Some values adjusted by 1p to match totals exactly.
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          disabled={isEmpty || !isValid}
          fullWidth
          data-testid="button-copy-summary"
        >
          Copy Summary
        </Button>
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Summary copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Card>
  );
}
