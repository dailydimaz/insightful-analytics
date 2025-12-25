import { Calendar } from "lucide-react";
import { DateRange } from "@/hooks/useAnalytics";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const options: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
        <Calendar className="h-4 w-4" />
        <span>{options.find(o => o.value === value)?.label}</span>
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52 z-50">
        {options.map((option) => (
          <li key={option.value}>
            <button
              className={value === option.value ? "active" : ""}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
