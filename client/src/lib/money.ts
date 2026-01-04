export function toPence(amount: number): number {
  return Math.round(amount * 100);
}

export function fromPence(pence: number): number {
  return pence / 100;
}

export function roundPence(pence: number): number {
  return Math.round(pence);
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}
