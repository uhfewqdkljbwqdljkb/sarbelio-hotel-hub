import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, subDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last-7' },
  { label: 'Last 14 Days', value: 'last-14' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Custom', value: 'custom' },
];

function getPresetRange(preset: string): DateRange {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: now, to: now };
    case 'last-7':
      return { from: subDays(now, 6), to: now };
    case 'last-14':
      return { from: subDays(now, 13), to: now };
    case 'this-month':
      return { from: startOfMonth(now), to: now };
    case 'last-month': {
      const lm = subMonths(now, 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    }
    case 'this-year':
      return { from: startOfYear(now), to: now };
    default:
      return { from: startOfMonth(now), to: now };
  }
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState('this-month');

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'custom') {
      onDateRangeChange(getPresetRange(value));
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.from, 'MMM d, yyyy')} – {format(dateRange.to, 'MMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setPreset('custom');
                onDateRangeChange({ from: range.from, to: range.to });
              } else if (range?.from) {
                setPreset('custom');
                onDateRangeChange({ from: range.from, to: range.from });
              }
            }}
            numberOfMonths={2}
            className={cn('p-3 pointer-events-auto')}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { getPresetRange };
