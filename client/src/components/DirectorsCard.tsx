import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  IconButton,
  Button,
  Chip,
  InputAdornment,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { Director, SplitMethod } from '../lib/calc';

interface SplitInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  testId: string;
}

function SplitInput({ value, onChange, disabled, testId }: SplitInputProps) {
  const [localValue, setLocalValue] = useState(() => (value * 100).toFixed(2));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused || disabled) {
      setLocalValue((value * 100).toFixed(2));
    }
  }, [value, isFocused, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const input = e.target.value;
    if (input === '' || /^[0-9]*\.?[0-9]*$/.test(input)) {
      setLocalValue(input);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (disabled) return;
    const percent = parseFloat(localValue) / 100;
    if (!isNaN(percent) && percent >= 0 && percent <= 1) {
      onChange(percent);
      setLocalValue(percent * 100 + '');
    } else {
      setLocalValue((value * 100).toFixed(2));
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
  };

  return (
    <TextField
      label="Split"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      size="small"
      sx={{ width: 100 }}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
      }}
      data-testid={testId}
    />
  );
}

interface DirectorsCardProps {
  directors: Director[];
  splitMethod: SplitMethod;
  onDirectorsChange: (directors: Director[]) => void;
  onSplitMethodChange: (method: SplitMethod) => void;
}

export default function DirectorsCard({
  directors,
  splitMethod,
  onDirectorsChange,
  onSplitMethodChange,
}: DirectorsCardProps) {
  const handleSplitMethodToggle = (_: React.MouseEvent<HTMLElement>, value: SplitMethod | null) => {
    if (value) {
      onSplitMethodChange(value);
    }
  };

  const handleAddDirector = () => {
    if (directors.length >= 6) return;
    const newId = String(Date.now());
    onDirectorsChange([
      ...directors,
      { id: newId, name: `Director ${directors.length + 1}`, splitPercent: 0 },
    ]);
  };

  const handleRemoveDirector = (id: string) => {
    if (directors.length <= 1) return;
    onDirectorsChange(directors.filter((d) => d.id !== id));
  };

  const handleNameChange = (id: string, name: string) => {
    onDirectorsChange(
      directors.map((d) => (d.id === id ? { ...d, name } : d))
    );
  };

  const handleSplitChange = (id: string, percent: number) => {
    onDirectorsChange(
      directors.map((d) => (d.id === id ? { ...d, splitPercent: percent } : d))
    );
  };

  const totalSplit = directors.reduce((sum, d) => sum + d.splitPercent, 0);
  const splitIsValid = Math.abs(totalSplit - 1) < 0.0001;
  const equalSplit = 100 / directors.length;

  return (
    <Card data-testid="card-directors">
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Directors & Split</Typography>
          <Button
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={handleAddDirector}
            disabled={directors.length >= 6}
            data-testid="button-add-director"
          >
            Add Director
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Up to 6 directors supported
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Split Method
          </Typography>
          <ToggleButtonGroup
            value={splitMethod}
            exclusive
            onChange={handleSplitMethodToggle}
            fullWidth
          >
            <ToggleButton value="equal" data-testid="button-equal-split">
              Equal Split
            </ToggleButton>
            <ToggleButton value="custom" data-testid="button-custom-split">
              Custom Split
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {splitMethod === 'custom' && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total:
            </Typography>
            <Chip
              label={`${(totalSplit * 100).toFixed(1)}%`}
              size="small"
              color={splitIsValid ? 'success' : 'error'}
              data-testid="chip-split-total"
            />
          </Box>
        )}

        {splitMethod === 'custom' && !splitIsValid && (
          <Alert severity="error" sx={{ mb: 2 }} data-testid="alert-split-error">
            Split percentages must total 100%
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {directors.map((director, index) => (
            <Box
              key={director.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 1,
                backgroundColor: 'background.default',
              }}
              data-testid={`row-director-${director.id}`}
            >
              <TextField
                label="Name"
                value={director.name}
                onChange={(e) => handleNameChange(director.id, e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
                data-testid={`input-director-name-${director.id}`}
              />
              <SplitInput
                value={splitMethod === 'equal' ? equalSplit / 100 : director.splitPercent}
                onChange={(percent) => handleSplitChange(director.id, percent)}
                disabled={splitMethod === 'equal'}
                testId={`input-director-split-${director.id}`}
              />
              <IconButton
                onClick={() => handleRemoveDirector(director.id)}
                disabled={directors.length <= 1}
                size="small"
                color="error"
                data-testid={`button-remove-director-${director.id}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
