import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value: string; // stored as "Apr 02, 2026"
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Minimum selectable date (inclusive). Dates before this are disabled. */
  minDate?: Date;
  /** Maximum selectable date (inclusive). Dates after this are disabled. */
  maxDate?: Date;
}

function parseStoredDate(val: string): Date | undefined {
  if (!val) return undefined;
  const formats = [
    "MMM dd, yyyy",   // Apr 02, 2026
    "MMMM dd yyyy",   // April 02 2026 (legacy)
    "MMMM d yyyy",    // April 2 2026 (legacy)
    "EEE, dd MMM",    // Sat, 28 Mar (no year)
    "dd MMM yyyy",    // 02 Apr 2026
    "yyyy-MM-dd",     // ISO
  ];
  for (const fmt of formats) {
    try {
      const d = parse(val, fmt, new Date());
      if (isValid(d)) return d;
    } catch {
      // try next
    }
  }
  const fallback = new Date(val);
  if (isValid(fallback)) return fallback;
  return undefined;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseStoredDate(value);

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "MMM dd, yyyy"));
    } else {
      onChange("");
    }
    setOpen(false);
  }

  // Build disabled matcher for react-day-picker
  const disabledMatcher: ((date: Date) => boolean) | undefined =
    minDate || maxDate
      ? (date: Date) => {
          if (minDate && date < minDate) return true;
          if (maxDate && date > maxDate) return true;
          return false;
        }
      : undefined;

  // Default month: if minDate is set and no selection yet, open to minDate month
  const defaultMonth = selected ?? minDate ?? undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-white border-gray-200 hover:bg-gray-50",
            !value && "text-muted-foreground",
            disabled && "opacity-60 cursor-not-allowed",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
          {value ? value : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          defaultMonth={defaultMonth}
          disabled={disabledMatcher}
        />
      </PopoverContent>
    </Popover>
  );
}
