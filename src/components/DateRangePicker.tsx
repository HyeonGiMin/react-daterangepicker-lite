import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parse,
  isValid,
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
import type { Locale } from 'date-fns';
import clsx from 'clsx';
import type { DateRange } from '../types';
import './date-range-picker.css';

export type PresetRange = {
  label: string;
  range: () => DateRange;
};

export type PresetDate = {
  label: string;
  date: () => Date;
};

type Props = {
  value: DateRange;
  onChange: (next: DateRange) => void;
  displayFormat?: string;
  presetRanges?: PresetRange[];
  presetDates?: PresetDate[];
  minDate?: Date;
  maxDate?: Date;
  closeOnSelect?: boolean;
  className?: string;
  autoApply?: boolean;
  singleDatePicker?: boolean;
  showPresets?: boolean;
  locale?: Locale;
  showClearButton?: boolean;
  triggerWidth?: number | string;
  editable?: boolean;
  separateCalendars?: boolean;
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

const defaultSinglePresets: PresetDate[] = [
  {
    label: 'Today',
    date: () => startOfToday()
  },
  {
    label: 'Yesterday',
    date: () => addDays(startOfToday(), -1)
  },
  {
    label: '7 days ago',
    date: () => addDays(startOfToday(), -7)
  },
  {
    label: '30 days ago',
    date: () => addDays(startOfToday(), -30)
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
  presetDates,
  minDate,
  maxDate,
  closeOnSelect = true,
  className,
  autoApply = true,
  singleDatePicker = false,
  showPresets = true,
  locale,
  showClearButton = false,
  triggerWidth,
  editable = false,
  separateCalendars = false
}: Props) => {
  const [open, setOpen] = useState(false);
  const [viewDateStart, setViewDateStart] = useState<Date>(value.startDate ?? startOfToday());
  const [viewDateEnd, setViewDateEnd] = useState<Date>(
    value.startDate ? addMonths(value.startDate, 1) : addMonths(startOfToday(), 1)
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [openYearDropdown, setOpenYearDropdown] = useState<number | null>(null);
  const [openMonthDropdown, setOpenMonthDropdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [textValue, setTextValue] = useState<string>('');

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
      setViewDateStart(startOfMonth(value.startDate));
      if (value.endDate && !isSameMonth(value.startDate, value.endDate)) {
        // Different months: show start month on left, end month on right
        setViewDateEnd(startOfMonth(value.endDate));
      } else {
        // Same month or no end date: show start month on left, next month on right
        setViewDateEnd(addMonths(startOfMonth(value.startDate), 1));
      }
    }
  }, [value.startDate, value.endDate]);

  useEffect(() => {
    setTempRange(value);
  }, [value, open]);

  // keep text in sync when external value changes
  useEffect(() => {
    const l = ((): string => {
      if (singleDatePicker) {
        return value.startDate ? format(value.startDate, displayFormat, { locale }) : '';
      }
      const start = value.startDate ? format(value.startDate, displayFormat, { locale }) : '';
      const end = value.endDate ? format(value.endDate, displayFormat, { locale }) : '';
      return start && end ? `${start} ~ ${end}` : '';
    })();
    setTextValue(l);
  }, [value.startDate, value.endDate, singleDatePicker, displayFormat, locale]);

  const getCanGoPrev = (calendarIndex: number) => {
    if (!minDate) return true;
    const viewDate = calendarIndex === 0 ? viewDateStart : viewDateEnd;
    const prevMonthEnd = endOfMonth(addMonths(viewDate, -1));
    return !isBefore(prevMonthEnd, startOfDay(minDate));
  };

  const getCanGoNext = (calendarIndex: number) => {
    if (!maxDate) return true;
    const viewDate = calendarIndex === 0 ? viewDateStart : viewDateEnd;
    const nextMonthStart = startOfMonth(addMonths(viewDate, 1));
    return !isAfter(nextMonthStart, endOfDay(maxDate));
  };

  const handleMonthYearChange = (calendarIndex: number, newDate: Date) => {
    const newMonth = startOfMonth(newDate);
    if (calendarIndex === 0) {
      // Left calendar: change independently
      setViewDateStart(newMonth);
    } else {
      // Right calendar: change independently
      setViewDateEnd(newMonth);
    }
  };

  const label = useMemo(() => {
    if (singleDatePicker) {
      return value.startDate ? format(value.startDate, displayFormat, { locale }) : 'Select Date';
    }
    const start = value.startDate ? format(value.startDate, displayFormat, { locale }) : 'Start';
    const end = value.endDate ? format(value.endDate, displayFormat, { locale }) : 'End';
    return `${start} ~ ${end}`;
  }, [value, displayFormat, singleDatePicker, locale]);

  const applyText = () => {
    if (!editable) return;
    if (singleDatePicker) {
      const parsed = parse(textValue.trim(), displayFormat, new Date(), { locale });
      if (isValid(parsed) && !disableDate(parsed)) {
        const next = { startDate: parsed, endDate: parsed } as DateRange;
        setTempRange(next);
        setViewDateStart(startOfMonth(parsed));
        setViewDateEnd(addMonths(startOfMonth(parsed), 1));
        if (autoApply) {
          onChange(next);
        }
      }
      return;
    }
    // range input: split by '~'
    const parts = textValue.split('~');
    if (parts.length !== 2) return;
    const sTxt = parts[0].trim();
    const eTxt = parts[1].trim();
    const sParsed = parse(sTxt, displayFormat, new Date(), { locale });
    const eParsed = parse(eTxt, displayFormat, new Date(), { locale });
    if (isValid(sParsed) && isValid(eParsed) && !disableDate(sParsed) && !disableDate(eParsed)) {
      let start = startOfDay(sParsed);
      let end = endOfDay(eParsed);
      if (isAfter(start, end)) {
        start = startOfDay(eParsed);
        end = endOfDay(sParsed);
      }
      const next = { startDate: start, endDate: end } as DateRange;
      setTempRange(next);
      setViewDateStart(startOfMonth(start));
      setViewDateEnd(startOfMonth(addMonths(start, 1)));
      if (autoApply) {
        onChange(next);
      }
    }
  };

  // Currently selected preset index computed from tempRange; null if no match
  const matchedPresetIndex = useMemo(() => {
    if (singleDatePicker) {
      if (!tempRange.startDate) return null;
      const list = presetDates ?? defaultSinglePresets;
      const s = tempRange.startDate;
      const idx = list.findIndex((p) => isSameDay(p.date(), s!));
      return idx >= 0 ? idx : null;
    }
    if (!tempRange.startDate || !tempRange.endDate) return null;
    const s = tempRange.startDate;
    const e = tempRange.endDate;
    const idx = presetRanges.findIndex((preset) => {
      const r = preset.range();
      if (!r.startDate || !r.endDate) return false;
      return isSameDay(r.startDate!, s!) && isSameDay(r.endDate!, e!);
    });
    return idx >= 0 ? idx : null;
  }, [singleDatePicker, presetDates, presetRanges, tempRange.startDate, tempRange.endDate]);

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

  const handleDayClick = (day: Date, calendarIndex?: number) => {
    // Close all dropdowns
    setOpenYearDropdown(null);
    setOpenMonthDropdown(null);

    if (disableDate(day)) return;

    if (singleDatePicker) {
      setTempRange({ startDate: day, endDate: day });
      if (autoApply) {
        onChange({ startDate: day, endDate: day });
        if (closeOnSelect) setOpen(false);
      }
      return;
    }

    if (separateCalendars && calendarIndex !== undefined) {
      // Range_FromTo mode: left calendar sets start, right calendar sets end
      // Calendar views remain fixed and don't change when selecting dates
      if (calendarIndex === 0) {
        // Left calendar: set startDate
        const end = tempRange.endDate;
        let newRange: DateRange;
        if (end && isAfter(day, end)) {
          // If new start is after current end, swap them
          newRange = { startDate: end, endDate: day };
        } else {
          newRange = { startDate: day, endDate: end };
        }
        setTempRange(newRange);
        if (autoApply && newRange.startDate && newRange.endDate) {
          onChange(newRange);
          if (closeOnSelect) setOpen(false);
        }
      } else {
        // Right calendar: set endDate
        const start = tempRange.startDate;
        let newRange: DateRange;
        if (start && isBefore(day, start)) {
          // If new end is before current start, swap them
          newRange = { startDate: day, endDate: start };
        } else {
          newRange = { startDate: start, endDate: day };
        }
        setTempRange(newRange);
        if (autoApply && newRange.startDate && newRange.endDate) {
          onChange(newRange);
          if (closeOnSelect) setOpen(false);
        }
      }
      return;
    }

    // Free range mode: original behavior
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({ startDate: day, endDate: null });
      setHoverDate(null);
      return;
    }

    const start = tempRange.startDate;
    if (!start) return;

    let newRange: DateRange;
    if (isBefore(day, start)) {
      newRange = { startDate: day, endDate: start };
    } else {
      newRange = { startDate: start, endDate: day };
    }
    setTempRange(newRange);
    if (autoApply) {
      onChange(newRange);
      if (closeOnSelect) setOpen(false);
    }
  };

  const applyPreset = (preset: PresetRange) => {
    const next = preset.range();
    setTempRange(next);
    if (autoApply) {
      onChange(next);
      if (closeOnSelect) setOpen(false);
    }
  };

  const applyPresetDate = (preset: PresetDate) => {
    const d = preset.date();
    const next = { startDate: d, endDate: d } as DateRange;
    setTempRange(next);
    // Sync calendar view to selected date
    setViewDateStart(startOfMonth(d));
    setViewDateEnd(addMonths(startOfMonth(d), 1));
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
    setOpen(false);
  };

  const renderCalendar = (
    calendarIndex: number,
    navOptions: { showPrev?: boolean; showNext?: boolean } = {}
  ) => {
    const { showPrev = false, showNext = false } = navOptions;
    const viewDate = calendarIndex === 0 ? viewDateStart : viewDateEnd;
    const month = viewDate;
    const days = buildCalendar(month);

    const monthNames = locale?.localize?.month
      ? Array.from({ length: 12 }, (_, i) => locale.localize!.month(i, { width: 'wide' }))
      : [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ];

    const weekdayNames = locale?.localize?.day
      ? Array.from({ length: 7 }, (_, i) => locale.localize!.day(i, { width: 'short' }))
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const handlePrev = () => {
      if (!getCanGoPrev(calendarIndex)) return;
      if (calendarIndex === 0) {
        const newStart = addMonths(viewDateStart, -1);
        if (separateCalendars && tempRange.endDate) {
          // In From-To mode: left can't go before right
          if (isBefore(startOfMonth(newStart), startOfMonth(tempRange.endDate))) {
            setViewDateStart(newStart);
          }
        } else if (!singleDatePicker && !separateCalendars) {
          // In free Range mode: keep right 1 month ahead
          setViewDateStart(newStart);
          setViewDateEnd(addMonths(newStart, 1));
        } else {
          setViewDateStart(newStart);
        }
      } else {
        const newEnd = addMonths(viewDateEnd, -1);
        if (separateCalendars && tempRange.startDate) {
          // In From-To mode: right can't go before left
          if (isAfter(startOfMonth(newEnd), startOfMonth(tempRange.startDate))) {
            setViewDateEnd(newEnd);
          }
        } else if (!singleDatePicker && !separateCalendars) {
          // In free Range mode: prevent right from crossing before left
          if (!isBefore(startOfMonth(newEnd), addMonths(startOfMonth(viewDateStart), 1))) {
            setViewDateEnd(newEnd);
            setViewDateStart(addMonths(newEnd, -1));
          }
        } else {
          setViewDateEnd(newEnd);
        }
      }
    };

    const handleNext = () => {
      if (!getCanGoNext(calendarIndex)) return;
      if (calendarIndex === 0) {
        const newStart = addMonths(viewDateStart, 1);
        if (separateCalendars && tempRange.endDate) {
          // In From-To mode: left can't go after right
          if (isBefore(startOfMonth(newStart), startOfMonth(tempRange.endDate))) {
            setViewDateStart(newStart);
          }
        } else if (!singleDatePicker && !separateCalendars) {
          // In free Range mode: keep right 1 month ahead
          if (isBefore(startOfMonth(newStart), startOfMonth(viewDateEnd))) {
            setViewDateStart(newStart);
            setViewDateEnd(addMonths(newStart, 1));
          }
        } else {
          setViewDateStart(newStart);
        }
      } else {
        const newEnd = addMonths(viewDateEnd, 1);
        if (separateCalendars && tempRange.startDate) {
          // In From-To mode: right can't go before left
          if (isAfter(startOfMonth(newEnd), startOfMonth(tempRange.startDate))) {
            setViewDateEnd(newEnd);
          }
        } else if (!singleDatePicker && !separateCalendars) {
          // In free Range mode: right moves freely
          setViewDateEnd(newEnd);
          setViewDateStart(addMonths(newEnd, -1));
        } else {
          setViewDateEnd(newEnd);
        }
      }
    };

    return (
      <div className="drp-calendar">
        {!singleDatePicker && separateCalendars && (
          <div className="drp-calendar__label">{calendarIndex === 0 ? 'From' : 'To'}</div>
        )}
        <div className="drp-calendar__header">
          {showPrev ? (
            <button
              type="button"
              className="drp-nav-btn"
              aria-label="Previous month"
              onClick={handlePrev}
              disabled={!getCanGoPrev(calendarIndex)}
            >
              {'<'}
            </button>
          ) : (
            <span className="drp-nav-spacer" />
          )}
          <div className="drp-calendar__picker">
            <div className="drp-custom-select">
              <button
                type="button"
                className="drp-custom-select__trigger"
                onClick={() => {
                  setOpenMonthDropdown(null);
                  setOpenYearDropdown(openYearDropdown === calendarIndex ? null : calendarIndex);
                }}
              >
                {viewDate.getFullYear()}
              </button>
              {openYearDropdown === calendarIndex && (
                <div className="drp-custom-select__dropdown">
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    const isDisabled = (() => {
                      if (singleDatePicker) return false;
                      const testDate = new Date(year, viewDate.getMonth(), 1);
                      if (separateCalendars) {
                        if (calendarIndex === 0) {
                          // Left calendar: can't select year >= right calendar's endDate
                          return tempRange.endDate && !isBefore(startOfMonth(testDate), startOfMonth(tempRange.endDate));
                        } else {
                          // Right calendar: can't select year <= left calendar's startDate
                          return tempRange.startDate && !isAfter(startOfMonth(testDate), startOfMonth(tempRange.startDate));
                        }
                      }
                      if (calendarIndex === 0) {
                        // Left calendar: can't select year/month >= right calendar
                        return !isBefore(startOfMonth(testDate), startOfMonth(viewDateEnd));
                      } else {
                        // Right calendar: can't select year/month <= left calendar
                        return !isAfter(startOfMonth(testDate), startOfMonth(viewDateStart));
                      }
                    })();
                    return (
                      <button
                        key={year}
                        type="button"
                        className={clsx('drp-custom-select__option', {
                          'drp-custom-select__option--active': year === viewDate.getFullYear(),
                          'drp-custom-select__option--disabled': isDisabled
                        })}
                        onClick={() => {
                          if (isDisabled) return;
                          const newDate = new Date(year, viewDate.getMonth(), 1);
                          handleMonthYearChange(calendarIndex, newDate);
                          setOpenYearDropdown(null);
                          setOpenMonthDropdown(null);
                        }}
                        disabled={isDisabled ?? false}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="drp-custom-select">
              <button
                type="button"
                className="drp-custom-select__trigger"
                onClick={() => {
                  setOpenYearDropdown(null);
                  setOpenMonthDropdown(openMonthDropdown === calendarIndex ? null : calendarIndex);
                }}
              >
                {monthNames[viewDate.getMonth()]}
              </button>
              {openMonthDropdown === calendarIndex && (
                <div className="drp-custom-select__dropdown">
                  {monthNames.map((monthName, idx) => {
                    const isDisabled = (() => {
                      if (singleDatePicker) return false;
                      const testDate = new Date(viewDate.getFullYear(), idx, 1);
                      if (separateCalendars) {
                        if (calendarIndex === 0) {
                          // Left calendar: can't select month >= right calendar's endDate
                          return tempRange.endDate && !isBefore(startOfMonth(testDate), startOfMonth(tempRange.endDate));
                        } else {
                          // Right calendar: can't select month <= left calendar's startDate
                          return tempRange.startDate && !isAfter(startOfMonth(testDate), startOfMonth(tempRange.startDate));
                        }
                      }
                      if (calendarIndex === 0) {
                        // Left calendar: can't select year/month >= right calendar
                        return !isBefore(startOfMonth(testDate), startOfMonth(viewDateEnd));
                      } else {
                        // Right calendar: can't select year/month <= left calendar
                        return !isAfter(startOfMonth(testDate), startOfMonth(viewDateStart));
                      }
                    })();
                    return (
                      <button
                        key={monthName}
                        type="button"
                        className={clsx('drp-custom-select__option', {
                          'drp-custom-select__option--active': idx === viewDate.getMonth(),
                          'drp-custom-select__option--disabled': isDisabled
                        })}
                        onClick={() => {
                          if (isDisabled) return;
                          const newDate = new Date(viewDate.getFullYear(), idx, 1);
                          handleMonthYearChange(calendarIndex, newDate);
                          setOpenMonthDropdown(null);
                          setOpenYearDropdown(null);
                        }}
                        disabled={isDisabled ?? false}
                      >
                        {monthName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {showNext ? (
            <button
              type="button"
              className="drp-nav-btn"
              aria-label="Next month"
              onClick={handleNext}
              disabled={!getCanGoNext(calendarIndex)}
            >
              {'>'}
            </button>
          ) : (
            <span className="drp-nav-spacer" />
          )}
        </div>
        <div className="drp-calendar__weekdays">
          {weekdayNames.map((d) => (
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
                onClick={() => handleDayClick(day, calendarIndex)}
                onMouseEnter={() => !singleDatePicker && !separateCalendars && setHoverDate(day)}
                onMouseLeave={() => !singleDatePicker && setHoverDate(null)}
                disabled={disabled}
              >
                {format(day, 'd', { locale })}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('drp', { 'drp--single': singleDatePicker }, className)} ref={containerRef}>
      <div className="drp-trigger-wrapper">
        {editable ? (
          <input
            type="text"
            className="drp-input"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onClick={() => setOpen((prev) => !prev)}
            onBlur={applyText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyText();
              }
            }}
            placeholder={singleDatePicker ? displayFormat : `${displayFormat} ~ ${displayFormat}`}
            style={
              triggerWidth
                ? { width: typeof triggerWidth === 'number' ? `${triggerWidth}px` : triggerWidth }
                : undefined
            }
          />
        ) : (
          <button
            type="button"
            className="drp-trigger"
            style={
              triggerWidth
                ? { width: typeof triggerWidth === 'number' ? `${triggerWidth}px` : triggerWidth }
                : undefined
            }
            onClick={() => setOpen((prev) => !prev)}
          >
            {label}
          </button>
        )}
        {showClearButton && (value.startDate || value.endDate) && (
          <button
            type="button"
            className="drp-clear-btn"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ startDate: null, endDate: null });
              setTempRange({ startDate: null, endDate: null });
              setTextValue('');
            }}
            aria-label="Clear dates"
          >
            ×
          </button>
        )}
      </div>

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
                {(singleDatePicker ? (presetDates ?? defaultSinglePresets) : presetRanges).map(
                  (preset, index) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={clsx('drp-preset', { active: matchedPresetIndex === index })}
                      onClick={() =>
                        singleDatePicker
                          ? applyPresetDate(preset as PresetDate)
                          : applyPreset(preset as PresetRange)
                      }
                    >
                      {preset.label}
                    </button>
                  )
                )}
              </div>
            )}

            <div className="drp-calendars">
              {renderCalendar(0, { showPrev: true, showNext: true })}
              {!singleDatePicker && renderCalendar(1, { showPrev: true, showNext: true })}
            </div>
          </div>

          {!autoApply && (
            <div className="drp-actions">
              {showClearButton && (
                <button
                  type="button"
                  className="drp-btn"
                  onClick={() => {
                    setTempRange({ startDate: null, endDate: null });
                    onChange({ startDate: null, endDate: null });
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
              )}
              <button type="button" className="drp-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="drp-btn drp-btn--apply" onClick={handleApply}>
                Apply
              </button>
            </div>
          )}
          {autoApply && showClearButton && (
            <div className="drp-actions">
              <button
                type="button"
                className="drp-btn"
                onClick={() => {
                  setTempRange({ startDate: null, endDate: null });
                  onChange({ startDate: null, endDate: null });
                  setOpen(false);
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
