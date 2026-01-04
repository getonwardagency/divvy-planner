import { Settings, Director, DealInput, DividendRateTier, SplitMethod, DEFAULT_SETTINGS, PresetRates } from './calc';

const SETTINGS_KEY = 'divvyplan_settings';
const STATE_KEY = 'divvyplan_state';

export interface AppState {
  dealInput: DealInput;
  directors: Director[];
  splitMethod: SplitMethod;
  dividendRateTier: DividendRateTier;
}

export const DEFAULT_STATE: AppState = {
  dealInput: {
    dealAmount: 0,
    dealExpenses: 0,
    includesVAT: true,
    vatRegistered: true,
  },
  directors: [
    { id: '1', name: 'Director 1', splitPercent: 1 },
  ],
  splitMethod: 'equal',
  dividendRateTier: 'basic',
};

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

function clampRate(value: unknown, min: number, max: number, fallback: number): number {
  if (!isValidNumber(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

function validatePresetRates(stored: unknown, defaults: PresetRates): PresetRates {
  if (!stored || typeof stored !== 'object') return { ...defaults };
  const s = stored as Record<string, unknown>;
  return {
    basic: clampRate(s.basic, 0, 1, defaults.basic),
    higher: clampRate(s.higher, 0, 1, defaults.higher),
    additional: clampRate(s.additional, 0, 1, defaults.additional),
  };
}

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed !== 'object' || parsed === null) {
        return { ...DEFAULT_SETTINGS };
      }

      const storedPresetRates = parsed.presetRates;
      const mergedPresetRates = {
        current: validatePresetRates(
          storedPresetRates?.current,
          DEFAULT_SETTINGS.presetRates.current
        ),
        april2026: validatePresetRates(
          storedPresetRates?.april2026,
          DEFAULT_SETTINGS.presetRates.april2026
        ),
      };

      return {
        vatRate: clampRate(parsed.vatRate, 0, 1, DEFAULT_SETTINGS.vatRate),
        corpTaxRate: clampRate(parsed.corpTaxRate, 0, 1, DEFAULT_SETTINGS.corpTaxRate),
        dividendPreset: parsed.dividendPreset === 'april2026' ? 'april2026' : 'current',
        presetRates: mergedPresetRates,
        customDividendRate: clampRate(parsed.customDividendRate, 0, 1, DEFAULT_SETTINGS.customDividendRate),
        defaultIncludesVAT: typeof parsed.defaultIncludesVAT === 'boolean' 
          ? parsed.defaultIncludesVAT 
          : DEFAULT_SETTINGS.defaultIncludesVAT,
        defaultVATRegistered: typeof parsed.defaultVATRegistered === 'boolean' 
          ? parsed.defaultVATRegistered 
          : DEFAULT_SETTINGS.defaultVATRegistered,
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

function validateDealInput(parsed: unknown, settings: Settings): DealInput {
  const defaults = {
    ...DEFAULT_STATE.dealInput,
    includesVAT: settings.defaultIncludesVAT,
    vatRegistered: settings.defaultVATRegistered,
  };
  
  if (!parsed || typeof parsed !== 'object') return defaults;
  const p = parsed as Record<string, unknown>;
  
  return {
    dealAmount: isValidNumber(p.dealAmount) && p.dealAmount >= 0 
      ? p.dealAmount 
      : defaults.dealAmount,
    dealExpenses: isValidNumber(p.dealExpenses) && p.dealExpenses >= 0 
      ? p.dealExpenses 
      : defaults.dealExpenses,
    includesVAT: typeof p.includesVAT === 'boolean' 
      ? p.includesVAT 
      : defaults.includesVAT,
    vatRegistered: typeof p.vatRegistered === 'boolean' 
      ? p.vatRegistered 
      : defaults.vatRegistered,
  };
}

function validateDirectors(parsed: unknown): Director[] {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [...DEFAULT_STATE.directors];
  }
  
  const validDirectors = parsed
    .filter((d): d is Record<string, unknown> => 
      d && typeof d === 'object' &&
      typeof d.id === 'string' &&
      typeof d.name === 'string' &&
      isValidNumber(d.splitPercent) &&
      d.splitPercent >= 0 && d.splitPercent <= 1
    )
    .map((d) => ({
      id: d.id as string,
      name: d.name as string,
      splitPercent: d.splitPercent as number,
    }));
  
  return validDirectors.length > 0 ? validDirectors : [...DEFAULT_STATE.directors];
}

function validateSplitMethod(value: unknown): SplitMethod {
  return value === 'custom' ? 'custom' : 'equal';
}

function validateDividendRateTier(value: unknown): DividendRateTier {
  const validTiers = ['basic', 'higher', 'additional', 'custom'];
  return validTiers.includes(value as string) ? (value as DividendRateTier) : 'basic';
}

export function loadLastState(settings: Settings): AppState {
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          ...DEFAULT_STATE,
          dealInput: {
            ...DEFAULT_STATE.dealInput,
            includesVAT: settings.defaultIncludesVAT,
            vatRegistered: settings.defaultVATRegistered,
          },
        };
      }

      return {
        dealInput: validateDealInput(parsed.dealInput, settings),
        directors: validateDirectors(parsed.directors),
        splitMethod: validateSplitMethod(parsed.splitMethod),
        dividendRateTier: validateDividendRateTier(parsed.dividendRateTier),
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    ...DEFAULT_STATE,
    dealInput: {
      ...DEFAULT_STATE.dealInput,
      includesVAT: settings.defaultIncludesVAT,
      vatRegistered: settings.defaultVATRegistered,
    },
  };
}

export function saveLastState(state: AppState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function resetSettings(): Settings {
  localStorage.removeItem(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS };
}

export function clearAllData(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(STATE_KEY);
}
