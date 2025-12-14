# react-daterangepicker-lite

React date range picker inspired by daterangepicker and react-bootstrap-daterangepicker, rebuilt without jQuery or moment. Uses date-fns under the hood.

## Features

- Lightweight React + TypeScript, no jQuery or moment
- Two-month calendar with range highlighting and hover preview
- Quick preset ranges (Today, Yesterday, Last 7/30 days, This month) plus custom presets
- Min/max date disabling and outside-click/escape closing
- Library build via Vite for reuse in other projects

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev
```

## Basic usage

```tsx
import { useState } from 'react';
import { DateRangePicker, type DateRange, type PresetRange } from 'react-daterangepicker-lite';

const presets: PresetRange[] = [
  {
    label: 'Next 7 days',
    range: () => {
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { startDate: start, endDate: end };
    }
  }
];

export function Example() {
  const [range, setRange] = useState<DateRange>({ startDate: null, endDate: null });

  return <DateRangePicker value={range} onChange={setRange} presetRanges={presets} />;
}
```

## Props (high level)

- `value`: `{ startDate: Date | null; endDate: Date | null }` controlled selection
- `onChange(next)`: callback when range changes
- `displayFormat`: date-fns format string for trigger label (default `yyyy-MM-dd`)
- `presetRanges`: array of `{ label, range: () => DateRange }` shown as quick buttons
- `minDate` / `maxDate`: disable dates outside bounds
- `closeOnSelect`: close popover after selecting end date or preset (default `true`)
- `className`: optional class on wrapper

## Build for distribution

```bash
npm run build
npm pack   # optionally create a tarball you can install elsewhere
```

Outputs are written to `dist/` as both ESM and UMD bundles, plus type definitions.

## Lint and tests

```bash
npm run lint
npm run test
npm run typecheck
```

## Notes

- Component styles live in `src/components/date-range-picker.css` and can be overridden.
- The demo app (`npm run dev`) uses Vite for rapid iteration.
