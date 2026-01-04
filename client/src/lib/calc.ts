import { toPence, fromPence, roundPence } from './money';

export type DividendRatePreset = 'current' | 'april2026';
export type DividendRateTier = 'basic' | 'higher' | 'additional' | 'custom';
export type SplitMethod = 'equal' | 'custom';

export interface PresetRates {
  basic: number;
  higher: number;
  additional: number;
}

export interface Settings {
  vatRate: number;
  corpTaxRate: number;
  dividendPreset: DividendRatePreset;
  presetRates: {
    current: PresetRates;
    april2026: PresetRates;
  };
  customDividendRate: number;
  defaultIncludesVAT: boolean;
  defaultVATRegistered: boolean;
}

export interface Director {
  id: string;
  name: string;
  splitPercent: number;
}

export interface DealInput {
  dealAmount: number;
  includesVAT: boolean;
  vatRegistered: boolean;
}

export interface DealBreakdown {
  net: number;
  vat: number;
  corpTax: number;
  dividendPool: number;
}

export interface DirectorResult {
  id: string;
  name: string;
  splitPercent: number;
  dividendShare: number;
  appliedRate: number;
  personalDividendTax: number;
  takeHome: number;
  adjustedByPenny: boolean;
}

export interface DealResult {
  breakdown: DealBreakdown;
  directors: DirectorResult[];
  totalPersonalTax: number;
  totalTakeHome: number;
}

export const DEFAULT_SETTINGS: Settings = {
  vatRate: 0.20,
  corpTaxRate: 0.25,
  dividendPreset: 'current',
  presetRates: {
    current: {
      basic: 0.0875,
      higher: 0.3375,
      additional: 0.3935,
    },
    april2026: {
      basic: 0.1075,
      higher: 0.3575,
      additional: 0.3935,
    },
  },
  customDividendRate: 0.125,
  defaultIncludesVAT: true,
  defaultVATRegistered: true,
};

export function calculateDealBreakdown(
  input: DealInput,
  settings: Settings
): DealBreakdown {
  const dealAmountPence = toPence(input.dealAmount);

  let netPence: number;
  let vatPence: number;

  if (!input.vatRegistered) {
    vatPence = 0;
    netPence = dealAmountPence;
  } else if (input.includesVAT) {
    netPence = roundPence(dealAmountPence / (1 + settings.vatRate));
    vatPence = dealAmountPence - netPence;
  } else {
    netPence = dealAmountPence;
    vatPence = roundPence(dealAmountPence * settings.vatRate);
  }

  const corpTaxPence = roundPence(netPence * settings.corpTaxRate);
  const dividendPoolPence = netPence - corpTaxPence;

  return {
    net: fromPence(netPence),
    vat: fromPence(vatPence),
    corpTax: fromPence(corpTaxPence),
    dividendPool: fromPence(dividendPoolPence),
  };
}

export function splitDividendPool(
  dividendPool: number,
  directors: Director[],
  splitMethod: SplitMethod
): number[] {
  const poolPence = toPence(dividendPool);
  const count = directors.length;

  if (count === 0) return [];

  if (splitMethod === 'equal') {
    const baseShare = Math.floor(poolPence / count);
    const remainder = poolPence - baseShare * count;
    
    return directors.map((_, index) => {
      const share = baseShare + (index < remainder ? 1 : 0);
      return fromPence(share);
    });
  } else {
    const shares = directors.map((d) => {
      return roundPence(poolPence * d.splitPercent);
    });

    const totalShares = shares.reduce((sum, s) => sum + s, 0);
    const diff = poolPence - totalShares;

    if (diff !== 0 && shares.length > 0) {
      shares[shares.length - 1] += diff;
    }

    return shares.map((s) => fromPence(s));
  }
}

export function getAppliedDividendRate(
  tier: DividendRateTier,
  settings: Settings
): number {
  if (tier === 'custom') {
    return settings.customDividendRate;
  }
  const preset = settings.presetRates[settings.dividendPreset];
  return preset[tier];
}

export function calculateDirectorResults(
  dividendPool: number,
  directors: Director[],
  splitMethod: SplitMethod,
  dividendRateTier: DividendRateTier,
  settings: Settings
): DirectorResult[] {
  const shares = splitDividendPool(dividendPool, directors, splitMethod);
  const appliedRate = getAppliedDividendRate(dividendRateTier, settings);

  const poolPence = toPence(dividendPool);
  const totalSharesPence = shares.reduce((sum, s) => sum + toPence(s), 0);

  return directors.map((director, index) => {
    const dividendShare = shares[index];
    const dividendSharePence = toPence(dividendShare);
    const personalTaxPence = roundPence(dividendSharePence * appliedRate);
    const takeHomePence = dividendSharePence - personalTaxPence;

    const adjustedByPenny = 
      index === directors.length - 1 && 
      splitMethod === 'custom' && 
      totalSharesPence !== poolPence;

    return {
      id: director.id,
      name: director.name,
      splitPercent: splitMethod === 'equal' 
        ? 1 / directors.length 
        : director.splitPercent,
      dividendShare,
      appliedRate,
      personalDividendTax: fromPence(personalTaxPence),
      takeHome: fromPence(takeHomePence),
      adjustedByPenny,
    };
  });
}

export function calculateDealResult(
  input: DealInput,
  directors: Director[],
  splitMethod: SplitMethod,
  dividendRateTier: DividendRateTier,
  settings: Settings
): DealResult {
  const breakdown = calculateDealBreakdown(input, settings);
  const directorResults = calculateDirectorResults(
    breakdown.dividendPool,
    directors,
    splitMethod,
    dividendRateTier,
    settings
  );

  const totalPersonalTax = directorResults.reduce(
    (sum, d) => sum + d.personalDividendTax,
    0
  );
  const totalTakeHome = directorResults.reduce(
    (sum, d) => sum + d.takeHome,
    0
  );

  return {
    breakdown,
    directors: directorResults,
    totalPersonalTax,
    totalTakeHome,
  };
}

export function validateDirectorSplits(directors: Director[]): boolean {
  if (directors.length === 0) return false;
  const total = directors.reduce((sum, d) => sum + d.splitPercent, 0);
  return Math.abs(total - 1) < 0.0001;
}

export function generateCopySummary(
  input: DealInput,
  result: DealResult,
  settings: Settings,
  dividendRateTier: DividendRateTier
): string {
  const { breakdown, directors } = result;
  const appliedRate = getAppliedDividendRate(dividendRateTier, settings);

  const lines = [
    `DivvyPlan Summary`,
    `================`,
    ``,
    `Deal Amount: £${input.dealAmount.toFixed(2)}`,
    `VAT Registered: ${input.vatRegistered ? 'Yes' : 'No'}`,
    input.vatRegistered ? `VAT Treatment: ${input.includesVAT ? 'Includes VAT' : 'Excludes VAT'}` : '',
    ``,
    `Breakdown:`,
    `  Net (ex VAT): £${breakdown.net.toFixed(2)}`,
    `  VAT: £${breakdown.vat.toFixed(2)}`,
    `  Corporation Tax (${(settings.corpTaxRate * 100).toFixed(0)}%): £${breakdown.corpTax.toFixed(2)}`,
    `  Dividend Pool: £${breakdown.dividendPool.toFixed(2)}`,
    ``,
    `Directors (${(appliedRate * 100).toFixed(2)}% dividend tax):`,
    ...directors.map(
      (d) =>
        `  ${d.name}: £${d.dividendShare.toFixed(2)} dividend → £${d.personalDividendTax.toFixed(2)} tax → £${d.takeHome.toFixed(2)} take-home`
    ),
    ``,
    `Totals:`,
    `  Total Dividend Tax: £${result.totalPersonalTax.toFixed(2)}`,
    `  Total Take-Home: £${result.totalTakeHome.toFixed(2)}`,
    ``,
    `Note: This is a planning estimate only, not tax advice.`,
  ].filter(Boolean);

  return lines.join('\n');
}
