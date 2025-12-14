import { useState } from 'react';
import DateRangePicker, { type PresetRange } from './components/DateRangePicker';
import type { DateRange } from './types';

const presets: PresetRange[] = [
  {
    label: 'Today',
    range: () => {
      const today = new Date();
      return { startDate: today, endDate: today };
    }
  },
  {
    label: 'Yesterday',
    range: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: yesterday, endDate: yesterday };
    }
  },
  {
    label: 'Last 7 days',
    range: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { startDate: start, endDate: end };
    }
  },
  {
    label: 'Last 30 days',
    range: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { startDate: start, endDate: end };
    }
  },
  {
    label: 'This month',
    range: () => {
      const start = new Date();
      start.setDate(1);
      const end = new Date();
      return { startDate: start, endDate: end };
    }
  },
  {
    label: 'Last 3 months',
    range: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return { startDate: start, endDate: end };
    }
  }
];

const App = () => {
  const [range, setRange] = useState<DateRange>({ startDate: null, endDate: null });

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Date Range Picker Lite</h1>
      <p>Lightweight React 19 date range picker without jQuery or moment. Uses date-fns.</p>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Without Apply Button (Instant Selection)</h2>
        <DateRangePicker value={range} onChange={setRange} presetRanges={presets} />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>With Apply Button (Confirm Selection)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          autoApply={false}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Single Date Picker with Presets (Auto Apply)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          singleDatePicker
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Single Date Picker with Presets (Apply Button)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          singleDatePicker
          autoApply={false}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Single Date Picker without Presets (Auto Apply)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          singleDatePicker
          showPresets={false}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Single Date Picker without Presets (Apply Button)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          singleDatePicker
          showPresets={false}
          autoApply={false}
        />
      </section>

      <section>
        <h2>Range Picker without Presets</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          showPresets={false}
          autoApply={false}
        />
      </section>

      <pre
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#e2e8f0',
          borderRadius: '0.5rem'
        }}
      >
        {JSON.stringify(range, null, 2)}
      </pre>
    </main>
  );
};

export default App;
