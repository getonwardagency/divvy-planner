import { Settings, Director, DealInput, DividendRateTier, SplitMethod, DEFAULT_SETTINGS } from './calc';

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

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
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

export function loadLastState(settings: Settings): AppState {
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        dealInput: {
          ...DEFAULT_STATE.dealInput,
          ...parsed.dealInput,
          dealExpenses: parsed.dealInput?.dealExpenses ?? 0,
          includesVAT: parsed.dealInput?.includesVAT ?? settings.defaultIncludesVAT,
          vatRegistered: parsed.dealInput?.vatRegistered ?? settings.defaultVATRegistered,
        },
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
