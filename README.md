# DivvyPlan

A simple "deal-to-dividends" planning calculator for UK small company directors.

## Overview

DivvyPlan helps company directors plan how a client deal/invoice converts to dividends. Enter a deal amount and the app calculates:

1. VAT (if applicable)
2. Corporation Tax (default 25%)
3. Dividend pool available for distribution
4. Per-director dividend splits and personal tax estimates

**Important:** This is an INTERNAL planning tool only — NOT tax advice.

## Features

- **Deal Breakdown**: Automatically calculates Net, VAT, Corporation Tax, and Dividend Pool
- **Multiple Directors**: Support for up to 6 directors with equal or custom splits
- **Flexible Dividend Tax Rates**: Pre-configured rates for Current and From April 2026, plus custom rate option
- **LocalStorage Persistence**: Settings and last-used values are saved automatically
- **Copy Summary**: One-click copy of calculation summary to clipboard
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- Vite + React + TypeScript
- Material UI (MUI) with Material 3 design principles
- Vitest for unit testing
- LocalStorage for persistence (no backend required)

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`.

### Running Tests

```bash
# Run unit tests
npx vitest run

# Run tests in watch mode
npx vitest
```

## Core Assumptions

These are clearly shown in the UI:

- Expenses are ignored (profit = net sales)
- Corporation Tax is a flat rate (default 25%)
- Dividend tax is a single effective rate chosen by the user (no banding across thresholds)

## Calculation Rules

All calculations use integer pence internally to avoid floating-point errors:

1. Convert input amount to pence
2. Calculate VAT and net amounts
3. Apply Corporation Tax to net
4. Distribute dividend pool to directors
5. Apply personal dividend tax rate
6. Round to nearest penny at each step

### VAT Calculation

- **Not VAT registered**: VAT = 0, Net = Deal Amount
- **Includes VAT**: Net = Deal Amount / (1 + VAT Rate), VAT = Deal Amount - Net
- **Excludes VAT**: Net = Deal Amount, VAT = Deal Amount × VAT Rate

### Director Splits

- **Equal split**: Dividend pool divided equally, remainder pennies allocated to first directors
- **Custom split**: Percentage-based split with validation for 100% total

## Dividend Rate Presets

### Current Rates
- Basic: 8.75%
- Higher: 33.75%
- Additional: 39.35%

### From April 2026
- Basic: 10.75%
- Higher: 35.75%
- Additional: 39.35%

## Project Structure

```
client/src/
├── components/
│   ├── DealInputsCard.tsx      # Deal amount and VAT inputs
│   ├── DirectorsCard.tsx       # Directors management
│   ├── DividendRateCard.tsx    # Tax rate selection
│   ├── DirectorsTable.tsx      # Results table
│   ├── ResultsSummary.tsx      # Summary tiles
│   └── SettingsDrawer.tsx      # Settings panel
├── lib/
│   ├── calc.ts                 # Calculation logic
│   ├── calc.test.ts            # Unit tests
│   ├── money.ts                # Currency utilities
│   ├── storage.ts              # LocalStorage helpers
│   └── theme.ts                # MUI theme
└── App.tsx                     # Main application
```

## License

MIT
