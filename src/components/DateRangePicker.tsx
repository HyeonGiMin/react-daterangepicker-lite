import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek
} from 'date-fns';
import clsx from 'clsx';
import type { DateRange } from '../types';
import './date-range-picker.css';

export type PresetRange = {
  label: string;
  range: () => DateRange;
};

type Props = {
  value: DateRange;
  onChange: (next: DateRange) => void;
  displayFormat?: string;
  presetRanges?: PresetRange[];
  minDate?: Date;
  maxDate?: Date;
  closeOnSelect?: boolean;
  className?: string;
  autoApply?: boolean;
  singleDatePicker?: boolean;
  showPresets?: boolean;
};

const defaultPresets: PresetRange[] = [
  {
    label: 'Today',
    range: () => {
      const today = startOfToday();
      return { startDate: today, endDate: today };
    }
  },
  {
    label: 'Yesterday',
    range: () => {
      const yesterday = addDays(startOfToday(), -1);
      return { startDate: yesterday, endDate: yesterday };
    }
  },
  {
    label: 'Last 7 days',
    range: () => {
      const end = endOfDay(startOfToday());
      const start = startOfDay(addDays(end, -6));
      return { startDate: start, endDate: end };
    }
  },
  {
    label: 'Last 30 days',
    range: () => {
      const end = endOfDay(startOfToday());
      const start = startOfDay(addDays(end, -29));
      return { startDate: start, endDate: end };
    }
  },
  {
    label: 'This month',
    range: () => {
      const start = startOfMonth(startOfToday());
      const end = endOfMonth(start);
      return { startDate: start, endDate: end };
    }
  }
];

const buildCalendar = (month: Date) => {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];

  let cursor = start;
  while (!isAfter(cursor, end)) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
};

const DateRangePicker = ({
  value,
  onChange,
  displayFormat = 'yyyy-MM-dd',
  presetRanges = defaultPresets,
  minDate,
  maxDate,
  closeOnSelect = true,
  className,
  autoApply = true,
  singleDatePicker = false,
  showPresets = true
}: Props) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value.startDate ?? startOfToday());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keyup', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keyup', handleKey);
    };
  }, []);

  useEffect(() => {
    if (value.startDate) {
      setViewDate(startOfMonth(value.startDate));
    }
  }, [value.startDate]);

  useEffect(() => {
    setTempRange(value);
  }, [value, open]);

  const label = useMemo(() => {
    if (singleDatePicker) {
      return value.startDate ? format(value.startDate, displayFormat) : 'Select Date';
    }
    const start = value.startDate ? format(value.startDate, displayFormat) : 'Start';
    const end = value.endDate ? format(value.endDate, displayFormat) : 'End';
    return `${start} -> ${end}`;
  }, [value, displayFormat, singleDatePicker]);

  const disableDate = (day: Date) => {
    if (minDate && isBefore(day, startOfDay(minDate))) return true;
    if (maxDate && isAfter(day, endOfDay(maxDate))) return true;
    return false;
  };

  const isActive = (day: Date) => {
    if (tempRange.startDate && isSameDay(day, tempRange.startDate)) return 'start';
    if (tempRange.endDate && isSameDay(day, tempRange.endDate)) return 'end';
    return null;
  };

  const isInRange = (day: Date) => {
    if (tempRange.startDate && tempRange.endDate) {
      return isWithinInterval(day, {
        start: startOfDay(tempRange.startDate),
        end: endOfDay(tempRange.endDate)
      });
    }
    if (tempRange.startDate && hoverDate) {
      const start = isBefore(hoverDate, tempRange.startDate) ? hoverDate : tempRange.startDate;
      const end = isAfter(hoverDate, tempRange.startDate) ? hoverDate : tempRange.startDate;
      return isWithinInterval(day, { start: startOfDay(start), end: endOfDay(end) });
    }
    return false;
  };

  const handleDayClick = (day: Date) => {
    if (disableDate(day)) return;

    if (singleDatePicker) {
      setTempRange({ startDate: day, endDate: day });
      if (autoApply) {
        onChange({ startDate: day, endDate: day });
        if (closeOnSelect) setOpen(false);
      }
      return;
    }

    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({ startDate: day, endDate: null });
      setHoverDate(null);
      return;
    }

    const start = tempRange.startDate;
    if (!start) return;

    if (isBefore(day, start)) {
      setTempRange({ startDate: day, endDate: start });
    } else {
      setTempRange({ startDate: start, endDate: day });
    }

    if (closeOnSelect && autoApply) setOpen(false);
  };

  const applyPreset = (preset: PresetRange, index: number) => {
    const next = preset.range();
    setTempRange(next);
    setActivePresetIndex(index);
    if (autoApply) {
      onChange(next);
      if (closeOnSelect) setOpen(false);
    }
  };

  const handleApply = () => {
    onChange(tempRange);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    setActivePresetIndex(null);
    setOpen(false);
  };

  const renderCalendar = (monthOffset: number) => {
    const month = addMonths(viewDate, monthOffset);
    const days = buildCalendar(month);
    const monthLabel = format(month, 'MMMM yyyy');

    return (
      <div className="drp-calendar">
        <div className="drp-calendar__header">{monthLabel}</div>
        <div className="drp-calendar__weekdays">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="drp-calendar__grid">
          {days.map((day) => {
            const disabled = disableDate(day);
            const active = isActive(day);
            const inRange = singleDatePicker ? false : isInRange(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={clsx('drp-day', {
                  'drp-day--muted': !isSameMonth(day, month),
                  'drp-day--disabled': disabled,
                  'drp-day--in-range': inRange,
                  'drp-day--start': active === 'start',
                  'drp-day--end': active === 'end'
                })}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => !singleDatePicker && setHoverDate(day)}
                onMouseLeave={() => !singleDatePicker && setHoverDate(null)}
                disabled={disabled}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('drp', { 'drp--single': singleDatePicker }, className)} ref={containerRef}>
      <button type="button" className="drp-trigger" onClick={() => setOpen((prev) => !prev)}>
        {label}
      </button>

      {open && (
        <div
          className={clsx('drp-popover', {
            'drp-popover--no-presets': !showPresets,
            'drp-popover--single': singleDatePicker
          })}
        >
          <div className="drp-popover__body">
            {showPresets && (
              <div className="drp-presets">
                {presetRanges.map((preset, index) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={clsx('drp-preset', { active: activePresetIndex === index })}
                    onClick={() => applyPreset(preset, index)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <div className="drp-calendars">
              {renderCalendar(0)}
              {!singleDatePicker && renderCalendar(1)}
            </div>
          </div>

          {!autoApply && (
            <div className="drp-actions">
              <button type="button" className="drp-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="drp-btn drp-btn--apply" onClick={handleApply}>
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
