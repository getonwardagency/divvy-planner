# DivvyPlan Design Guidelines

## Design System Foundation
**Material 3-Inspired Approach**
- Use Material UI (MUI) components following Material 3 design principles
- Light theme with clean surface hierarchy and elevated containers
- Soft dividers, subtle tonal variation, and generous whitespace over hard lines
- Consistent rounded corners on all Cards, inputs, buttons, and table containers
- Gentle shadows for elevation, not heavy borders

## Visual Hierarchy & Typography

**Type Scale (MUI variants)**
- Page title: h5/h6 with medium weight
- Section titles: subtitle1 with medium weight  
- Supporting text: body2, slightly muted
- All currency figures: Apply `font-variant-numeric: tabular-nums` for alignment
- Strong visual hierarchy: section headings → inputs → results

## Layout Structure

**Single-Page Layout**
- Top AppBar: Title "DivvyPlan" + Settings icon (opens right Drawer)
- Centered Container: maxWidth="md" or "lg"
- Responsive grid layout

**Vertical Rhythm**
- 24px spacing between major sections
- 16px spacing within sections
- Consistent, calm spacing throughout

**Hero Summary Area**
- Compact row of 3-5 summary tiles (MUI Paper) at top
- Live-updating key outputs: VAT pot, Corp Tax pot, Dividend Pool, Total Personal Tax, Total Take-home
- Desktop: horizontal layout; Mobile: 2 per row stack

## Component Design

### 1. Deal Inputs Card
- Title + helper text: "Planning tool, ignores expenses"
- Currency input: OutlinedTextField with "£" start adornment
- ToggleButtonGroup for "Includes VAT" / "Excludes VAT" (segmented control style)
- Switch for VAT registration
- Compact breakdown: 2x2 grid of small stat blocks showing Net, VAT pot, Corp Tax pot, Dividend pool

### 2. Directors & Split Card
- Title + "Add director" action button
- ToggleButtonGroup: "Equal split" / "Custom split"
- Table-style editor with Name field, Split % input, Remove button per row
- Equal mode: Show "Auto" chip next to split %
- Custom mode: Live "Total: 100%" indicator in header with inline error if not 100%

### 3. Dividend Tax Card
- ToggleButtonGroup: Basic / Higher / Additional / Custom
- Prominent chip showing "Applied rate" with preset name
- Custom selection: percentage input field with "%" end adornment
- Helper text: "This is a simplified effective rate assumption"

### 4. Results Card
- Directors results table (sticky header on desktop)
- Columns: Director, Split, Dividend share, Tax rate, Personal tax, Take-home
- Right-align numeric columns with tabular-nums
- "Copy summary" primary button below table
- Snackbar confirmation on copy success

### Settings Drawer
- Width: 360-420px on desktop
- Grouped sections (Accordions or clear separations): Defaults, Rates, Dividend presets
- Inline helper text for each rate
- "Reset to defaults" text button with confirmation dialog

## Color & Semantic Styling

- Use MUI theme system color tokens
- Accessible contrast throughout
- Semantic colors (sparingly):
  - Subtle tonal chips for pots (VAT/Corp Tax/Dividend Pool/Personal Tax)
  - Error styling for validation issues
  - Warning for alerts
  - Success for copy confirmation

## Interactions & Micro-UX

- **Live Calculation**: Results update as user types
- **Empty States**: Show "—" in summary tiles when deal amount blank (premium feel)
- **Validation States**: Visual highlights for invalid inputs, disable actions when invalid
- **Motion**: Subtle transitions (Drawer, expanding sections) - keep quick and minimal
- **Tooltips**: Small info tooltips for penny adjustments ("Adjusted by 1p to match totals")

## Responsive Behavior

**Mobile**
- Summary tiles: 2 per row stack
- Tables: horizontally scrollable with clean container
- Settings Drawer: full-height with comfortable padding

**Desktop**
- Cards align cleanly with generous spacing
- Tables with comfortable padding, no cramped UI
- Sticky table headers

## Premium Fintech Feel

**Goals**: Calm, clean, high trust, fast to scan
- Elevated surface containers with gentle shadows
- Clear separation via spacing and elevation
- Strong visual hierarchy
- Scannable numeric displays with tabular formatting
- No heavy outlines or cluttered borders
- Consistent component styling and corner radius

## Images
No images required for this internal calculation tool.