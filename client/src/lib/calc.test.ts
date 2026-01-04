import { describe, it, expect } from 'vitest';
import {
  calculateDealBreakdown,
  calculateDirectorResults,
  getAppliedDividendRate,
  DEFAULT_SETTINGS,
  type DealInput,
  type Director,
  type Settings,
} from './calc';

describe('calculateDealBreakdown', () => {
  it('calculates correctly when amount includes VAT', () => {
    const input: DealInput = {
      dealAmount: 5000.0,
      dealExpenses: 0,
      vatRegistered: true,
      includesVAT: true,
    };
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      vatRate: 0.20,
      corpTaxRate: 0.25,
    };

    const result = calculateDealBreakdown(input, settings);

    expect(result.net).toBeCloseTo(4166.67, 2);
    expect(result.vat).toBeCloseTo(833.33, 2);
    expect(result.corpTax).toBeCloseTo(1041.67, 2);
    expect(result.dividendPool).toBeCloseTo(3125.0, 2);
  });

  it('calculates correctly when amount excludes VAT', () => {
    const input: DealInput = {
      dealAmount: 5000.0,
      dealExpenses: 0,
      vatRegistered: true,
      includesVAT: false,
    };
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      vatRate: 0.20,
      corpTaxRate: 0.25,
    };

    const result = calculateDealBreakdown(input, settings);

    expect(result.net).toBeCloseTo(5000.0, 2);
    expect(result.vat).toBeCloseTo(1000.0, 2);
    expect(result.corpTax).toBeCloseTo(1250.0, 2);
    expect(result.dividendPool).toBeCloseTo(3750.0, 2);
  });

  it('ignores VAT when not VAT registered', () => {
    const input: DealInput = {
      dealAmount: 5000.0,
      dealExpenses: 0,
      vatRegistered: false,
      includesVAT: true,
    };
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      vatRate: 0.20,
      corpTaxRate: 0.25,
    };

    const result = calculateDealBreakdown(input, settings);

    expect(result.net).toBe(5000.0);
    expect(result.vat).toBe(0);
    expect(result.corpTax).toBeCloseTo(1250.0, 2);
    expect(result.dividendPool).toBeCloseTo(3750.0, 2);
  });

  it('deducts deal expenses before calculating corp tax', () => {
    const input: DealInput = {
      dealAmount: 5000.0,
      dealExpenses: 1000.0,
      vatRegistered: true,
      includesVAT: false,
    };
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      vatRate: 0.20,
      corpTaxRate: 0.25,
    };

    const result = calculateDealBreakdown(input, settings);

    expect(result.net).toBeCloseTo(5000.0, 2);
    expect(result.expenses).toBeCloseTo(1000.0, 2);
    expect(result.profit).toBeCloseTo(4000.0, 2);
    expect(result.corpTax).toBeCloseTo(1000.0, 2);
    expect(result.dividendPool).toBeCloseTo(3000.0, 2);
  });

  it('handles expenses greater than net by setting profit to zero', () => {
    const input: DealInput = {
      dealAmount: 1000.0,
      dealExpenses: 2000.0,
      vatRegistered: false,
      includesVAT: false,
    };
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      corpTaxRate: 0.25,
    };

    const result = calculateDealBreakdown(input, settings);

    expect(result.net).toBe(1000.0);
    expect(result.expenses).toBe(2000.0);
    expect(result.profit).toBe(0);
    expect(result.corpTax).toBe(0);
    expect(result.dividendPool).toBe(0);
  });
});

describe('calculateDirectorResults', () => {
  it('splits equally between 2 directors with basic rate 8.75%', () => {
    const directors: Director[] = [
      { id: '1', name: 'Director A', splitPercent: 0.5 },
      { id: '2', name: 'Director B', splitPercent: 0.5 },
    ];
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      presetRates: {
        ...DEFAULT_SETTINGS.presetRates,
        current: {
          basic: 0.0875,
          higher: 0.3375,
          additional: 0.3935,
        },
      },
      dividendPreset: 'current',
    };

    const results = calculateDirectorResults(
      3125.0,
      directors,
      'equal',
      'basic',
      settings
    );

    expect(results).toHaveLength(2);
    
    results.forEach((r) => {
      expect(r.dividendShare).toBeCloseTo(1562.50, 2);
      expect(r.personalDividendTax).toBeCloseTo(136.72, 2);
      expect(r.takeHome).toBeCloseTo(1425.78, 2);
    });
  });

  it('handles custom percentage splits correctly', () => {
    const directors: Director[] = [
      { id: '1', name: 'Director A', splitPercent: 0.6 },
      { id: '2', name: 'Director B', splitPercent: 0.4 },
    ];
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      dividendPreset: 'current',
    };

    const results = calculateDirectorResults(
      1000.0,
      directors,
      'custom',
      'basic',
      settings
    );

    expect(results).toHaveLength(2);
    expect(results[0].dividendShare).toBeCloseTo(600.0, 2);
    expect(results[1].dividendShare).toBeCloseTo(400.0, 2);
  });
});

describe('Dividend rate presets', () => {
  it('returns correct "From April 2026" preset values', () => {
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      dividendPreset: 'april2026',
    };

    const basicRate = getAppliedDividendRate('basic', settings);
    const higherRate = getAppliedDividendRate('higher', settings);
    const additionalRate = getAppliedDividendRate('additional', settings);

    expect(basicRate).toBe(0.1075);
    expect(higherRate).toBe(0.3575);
    expect(additionalRate).toBe(0.3935);
  });

  it('returns correct "Current" preset values', () => {
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      dividendPreset: 'current',
    };

    const basicRate = getAppliedDividendRate('basic', settings);
    const higherRate = getAppliedDividendRate('higher', settings);
    const additionalRate = getAppliedDividendRate('additional', settings);

    expect(basicRate).toBe(0.0875);
    expect(higherRate).toBe(0.3375);
    expect(additionalRate).toBe(0.3935);
  });
});

describe('Custom dividend rate', () => {
  it('uses custom rate of 12.5% correctly', () => {
    const directors: Director[] = [
      { id: '1', name: 'Director A', splitPercent: 1 },
    ];
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      customDividendRate: 0.125,
    };

    const results = calculateDirectorResults(
      1000.0,
      directors,
      'equal',
      'custom',
      settings
    );

    expect(results[0].appliedRate).toBe(0.125);
    expect(results[0].personalDividendTax).toBeCloseTo(125.0, 2);
    expect(results[0].takeHome).toBeCloseTo(875.0, 2);
  });

  it('applies custom rate to share correctly with rounding', () => {
    const directors: Director[] = [
      { id: '1', name: 'Director A', splitPercent: 1 },
    ];
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      customDividendRate: 0.125,
    };

    const results = calculateDirectorResults(
      333.33,
      directors,
      'equal',
      'custom',
      settings
    );

    expect(results[0].appliedRate).toBe(0.125);
    const expectedTax = Math.round(33333 * 0.125) / 100;
    expect(results[0].personalDividendTax).toBeCloseTo(expectedTax, 2);
  });
});

describe('Equal split with remainder distribution', () => {
  it('distributes remainder pennies to first directors', () => {
    const directors: Director[] = [
      { id: '1', name: 'A', splitPercent: 1 / 3 },
      { id: '2', name: 'B', splitPercent: 1 / 3 },
      { id: '3', name: 'C', splitPercent: 1 / 3 },
    ];
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
    };

    const results = calculateDirectorResults(
      100.0,
      directors,
      'equal',
      'basic',
      settings
    );

    const totalShares = results.reduce((sum, r) => sum + r.dividendShare, 0);
    expect(totalShares).toBeCloseTo(100.0, 2);
  });
});
