import { useState } from 'react';
import { ko } from 'date-fns/locale';
import DateRangePicker, { type PresetRange, type PresetDate } from './components/DateRangePicker';
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

const singlePresets: PresetDate[] = [
  { label: '오늘', date: () => new Date() },
  {
    label: '어제',
    date: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }
  },
  {
    label: '7일 전',
    date: () => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return d;
    }
  },
  {
    label: '30일 전',
    date: () => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d;
    }
  }
];

const App = () => {
  const [range, setRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [rangeWithClear, setRangeWithClear] = useState<DateRange>({
    startDate: new Date(2026, 0, 5),
    endDate: new Date(2026, 0, 15)
  });
  const [rangeEditable, setRangeEditable] = useState<DateRange>({
    startDate: new Date(2026, 0, 7),
    endDate: new Date(2026, 0, 13)
  });
  const [rangeNonEditable, setRangeNonEditable] = useState<DateRange>({
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 0, 31)
  });
  const [singleEditable, setSingleEditable] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date()
  });
  const [rangeFromTo, setRangeFromTo] = useState<DateRange>({
    startDate: new Date(2026, 0, 5),
    endDate: new Date(2026, 0, 20)
  });
  const [rangeFromToApply, setRangeFromToApply] = useState<DateRange>({
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 25)
  });

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
        <h2>With Clear Button</h2>
        <DateRangePicker
          value={rangeWithClear}
          onChange={setRangeWithClear}
          presetRanges={presets}
          showClearButton
          triggerWidth={320}
          editable
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Range Picker (Non-Editable Trigger)</h2>
        <DateRangePicker
          value={rangeNonEditable}
          onChange={setRangeNonEditable}
          presetRanges={presets}
          triggerWidth={320}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Range Picker (Editable Trigger)</h2>
        <DateRangePicker
          value={rangeEditable}
          onChange={setRangeEditable}
          presetRanges={presets}
          editable
          triggerWidth={320}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Range Picker (From-To Mode)</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          왼쪽 캘린더는 시작일, 오른쪽 캘린더는 종료일을 선택합니다.
        </p>
        <DateRangePicker
          value={rangeFromTo}
          onChange={setRangeFromTo}
          presetRanges={presets}
          separateCalendars
          triggerWidth={320}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Range Picker (From-To Mode with Apply Button)</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          왼쪽 캘린더는 시작일, 오른쪽 캘린더는 종료일을 선택하고 Apply 버튼으로 확정합니다.
        </p>
        <DateRangePicker
          value={rangeFromToApply}
          onChange={setRangeFromToApply}
          presetRanges={presets}
          separateCalendars
          autoApply={false}
          triggerWidth={320}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Single Date Picker with Presets (Auto Apply)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          singleDatePicker
          presetDates={singlePresets}
          showClearButton
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
          presetDates={singlePresets}
          showClearButton
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

      <section style={{ marginBottom: '3rem' }}>
        <h2>Single Picker (Editable Trigger)</h2>
        <DateRangePicker
          value={singleEditable}
          onChange={setSingleEditable}
          singleDatePicker
          showPresets={false}
          presetDates={singlePresets}
          editable
          triggerWidth={240}
        />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Korean Locale Example (한국어)</h2>
        <DateRangePicker
          value={range}
          onChange={setRange}
          presetRanges={presets}
          locale={ko}
          displayFormat="yyyy-MM-dd"
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
