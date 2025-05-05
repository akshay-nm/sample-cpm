import { addDays, format } from "date-fns";

interface WeekBarProps {
  totalDays: number;
  dayWidth: number;
  startDate: Date;
}

export default function WeekBar({
  totalDays,
  dayWidth,
  startDate,
}: WeekBarProps) {
  const numWeeks = Math.ceil(totalDays / 7);

  return (
    <div style={{ position: "relative" }}>

      <div className="flex border-b border-gray-300 text-sm bg-white sticky top-0 z-10 shadow-sm">
        {Array.from({ length: numWeeks }).map((_, i) => {
          const weekStart = addDays(startDate, i * 7);
          const formattedDate = format(weekStart, "dd MMM");

          return (
            <div
              key={i}
              className="border-r border-gray-300 text-xs text-center py-1"
              style={{ width: `${7 * dayWidth}px` }}
            >
              <div className="font-semibold">Week {i + 1}</div>
              <div className="text-gray-500">{formattedDate}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
