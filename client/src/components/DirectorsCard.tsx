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
  disabled: boolean;
  onCommit: (percent: number) => void;
  testId: string;
}

function SplitInput({ value, disabled, onCommit, testId }: SplitInputProps) {
  const [localValue, setLocalValue] = useState(() => (value * 100).toFixed(2));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue((value * 100).toFixed(2));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue((value * 100).toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onCommit(parsed / 100);
    } else {
      setLocalValue((value * 100).toFixed(2));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <TextField
      label="Split"
      type="number"
      value={disabled ? (value * 100).toFixed(2) : localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      size="small"
      sx={{ width: 100 }}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
      }}
      inputProps={{
        min: 0,
        max: 100,
        step: 'any',
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
  const [manuallySetIds, setManuallySetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (splitMethod === 'equal') {
      setManuallySetIds(new Set());
    }
  }, [splitMethod]);

  useEffect(() => {
    const currentIds = new Set(directors.map(d => d.id));
    setManuallySetIds(prev => {
      const updated = new Set<string>();
      prev.forEach(id => {
        if (currentIds.has(id)) {
          updated.add(id);
        }
      });
      return updated;
    });
  }, [directors.length]);

  const handleSplitMethodToggle = (_: React.MouseEvent<HTMLElement>, value: SplitMethod | null) => {
    if (value) {
      onSplitMethodChange(value);
      if (value === 'equal') {
        setManuallySetIds(new Set());
      }
    }
  };

  const handleAddDirector = () => {
    if (directors.length >= 6) return;
    const newId = String(Date.now());
    
    const lockedTotal = directors
      .filter(d => manuallySetIds.has(d.id))
      .reduce((sum, d) => sum + d.splitPercent, 0);
    const unlockedCount = directors.filter(d => !manuallySetIds.has(d.id)).length + 1;
    const remainingPercent = Math.max(0, 1 - lockedTotal);
    const perUnlocked = unlockedCount > 0 ? remainingPercent / unlockedCount : 0;

    const updatedDirectors = directors.map(d => {
      if (manuallySetIds.has(d.id)) {
        return d;
      }
      return { ...d, splitPercent: perUnlocked };
    });

    onDirectorsChange([
      ...updatedDirectors,
      { id: newId, name: `Director ${directors.length + 1}`, splitPercent: perUnlocked },
    ]);
  };

  const handleRemoveDirector = (id: string) => {
    if (directors.length <= 1) return;
    
    const wasManuallySet = manuallySetIds.has(id);
    const removedDirector = directors.find(d => d.id === id);
    const remaining = directors.filter((d) => d.id !== id);
    
    setManuallySetIds(prev => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
    
    if (removedDirector && remaining.length > 0) {
      const newManuallySetIds = new Set(manuallySetIds);
      newManuallySetIds.delete(id);
      
      const lockedTotal = remaining
        .filter(d => newManuallySetIds.has(d.id))
        .reduce((sum, d) => sum + d.splitPercent, 0);
      const unlockedDirectors = remaining.filter(d => !newManuallySetIds.has(d.id));
      const remainingPercent = Math.max(0, 1 - lockedTotal);
      const perUnlocked = unlockedDirectors.length > 0 ? remainingPercent / unlockedDirectors.length : 0;

      onDirectorsChange(
        remaining.map(d => {
          if (newManuallySetIds.has(d.id)) {
            return d;
          }
          return { ...d, splitPercent: perUnlocked };
        })
      );
    } else {
      onDirectorsChange(remaining);
    }
  };

  const handleNameChange = (id: string, name: string) => {
    onDirectorsChange(
      directors.map((d) => (d.id === id ? { ...d, name } : d))
    );
  };

  const handleSplitCommit = (id: string, newPercent: number) => {
    const clampedPercent = Math.min(1, Math.max(0, newPercent));
    
    const newManuallySetIds = new Set(manuallySetIds);
    newManuallySetIds.add(id);
    setManuallySetIds(newManuallySetIds);
    
    const lockedTotal = directors
      .filter(d => newManuallySetIds.has(d.id) && d.id !== id)
      .reduce((sum, d) => sum + d.splitPercent, 0) + clampedPercent;
    
    const unlockedDirectors = directors.filter(d => !newManuallySetIds.has(d.id));
    const remainingPercent = Math.max(0, 1 - lockedTotal);
    const perUnlocked = unlockedDirectors.length > 0 ? remainingPercent / unlockedDirectors.length : 0;
    
    onDirectorsChange(
      directors.map(d => {
        if (d.id === id) {
          return { ...d, splitPercent: clampedPercent };
        }
        if (newManuallySetIds.has(d.id)) {
          return d;
        }
        return { ...d, splitPercent: perUnlocked };
      })
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
                disabled={splitMethod === 'equal'}
                onCommit={(percent) => handleSplitCommit(director.id, percent)}
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
