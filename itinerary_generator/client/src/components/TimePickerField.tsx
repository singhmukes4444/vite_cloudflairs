import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClockIcon } from "lucide-react";

interface TimePickerFieldProps {
  value: string; // stored as "HH:MM" (24h), e.g. "14:30" — legacy "07:45 AM" also accepted
  onChange: (val: string) => void;
  placeholder?: string;
}

interface ParsedTime {
  hour: string | undefined;   // "00"–"23" or undefined when unset
  minute: string | undefined; // "00"–"55" or undefined when unset
}

/** Convert any time string (12h or 24h) to { hour, minute } in 24h format */
function parseTime(val: string): ParsedTime {
  if (!val) return { hour: undefined, minute: undefined };
  const cleaned = val.trim().toUpperCase().replace(/([AP]M)/, " $1").replace(/\s+/, " ");
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return { hour: undefined, minute: undefined };
  let h = parseInt(match[1]);
  const m = match[2];
  const p = match[3];

  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;

  return { hour: String(h).padStart(2, "0"), minute: m };
}

/** Emit time as "HH:MM" 24h string */
function buildTimeString(hour: string | undefined, minute: string | undefined): string {
  if (!hour && !minute) return "";
  return `${hour || "00"}:${minute || "00"}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export function TimePickerField({ value, onChange }: TimePickerFieldProps) {
  const parsed = useMemo(() => parseTime(value), [value]);

  const hour = parsed.hour;
  const minute = parsed.minute;

  function handleChange(field: "hour" | "minute", val: string) {
    const newHour = field === "hour" ? val : hour;
    const newMinute = field === "minute" ? val : minute;
    onChange(buildTimeString(newHour, newMinute));
  }

  return (
    <div className="flex items-center gap-1.5">
      <ClockIcon className="h-4 w-4 text-gray-400 shrink-0" />
      {/* Hour 00–23 */}
      <Select value={hour ?? undefined} onValueChange={v => handleChange("hour", v)}>
        <SelectTrigger className="w-[72px] h-9 text-sm">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map(h => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-gray-400 font-medium text-sm">:</span>
      {/* Minute */}
      <Select value={minute ?? undefined} onValueChange={v => handleChange("minute", v)}>
        <SelectTrigger className="w-[72px] h-9 text-sm">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
