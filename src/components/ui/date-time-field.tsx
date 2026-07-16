"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pad = (n: number) => String(n).padStart(2, "0");

function to12h(h: number, m: number) {
  const period = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${pad(m)} ${period}`;
}

const TIME_OPTIONS = (() => {
  const opts: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      opts.push({ value: `${pad(h)}:${pad(m)}`, label: to12h(h, m) });
    }
  }
  return opts;
})();

interface DateTimeFieldProps {
  /** Combined value in `YYYY-MM-DDTHH:mm` form (empty string when unset). */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  /** Default time applied when a date is picked but no time is set. */
  defaultTime?: string;
}

export function DateTimeField({
  value,
  onChange,
  disabled,
  min,
  max,
  defaultTime = "10:00",
}: DateTimeFieldProps) {
  const [datePart, rawTime] = value ? value.split("T") : ["", ""];
  const timePart = rawTime ? rawTime.slice(0, 5) : "";

  // Preserve off-grid times (e.g. from existing records) as a selectable option.
  const timeOptions =
    timePart && !TIME_OPTIONS.some((t) => t.value === timePart)
      ? [
          {
            value: timePart,
            label: to12h(
              parseInt(timePart.slice(0, 2), 10),
              parseInt(timePart.slice(3, 5), 10)
            ),
          },
          ...TIME_OPTIONS,
        ]
      : TIME_OPTIONS;

  const handleDate = (d: string) => {
    if (!d) {
      onChange("");
      return;
    }
    onChange(`${d}T${timePart || defaultTime}`);
  };

  const handleTime = (t: string) => {
    if (!datePart) return;
    onChange(`${datePart}T${t}`);
  };

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        value={datePart}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => handleDate(e.target.value)}
        className="flex-1 border-border/60 bg-transparent"
      />
      <Select value={timePart} onValueChange={handleTime} disabled={disabled || !datePart}>
        <SelectTrigger className="w-[128px] shrink-0">
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {timeOptions.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
