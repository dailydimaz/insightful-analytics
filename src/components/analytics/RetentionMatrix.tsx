import { CohortData, RetentionSummary } from "@/hooks/useRetention";
import { format, parseISO } from "date-fns";

interface RetentionMatrixProps {
  cohorts: CohortData[] | undefined;
  summary: RetentionSummary[] | undefined;
  isLoading?: boolean;
}

export function RetentionMatrix({ cohorts, summary, isLoading }: RetentionMatrixProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!cohorts || cohorts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No retention data available yet.</p>
        <p className="text-sm mt-2">Start tracking visitors to see retention cohorts.</p>
      </div>
    );
  }

  const retentionDays = [1, 3, 7, 14, 30];

  // Get color based on retention rate
  const getRetentionColor = (rate: number): string => {
    if (rate < 0) return "bg-muted/30"; // N/A
    if (rate === 0) return "bg-muted/50";
    if (rate < 10) return "bg-primary/10";
    if (rate < 20) return "bg-primary/20";
    if (rate < 30) return "bg-primary/30";
    if (rate < 40) return "bg-primary/40";
    if (rate < 50) return "bg-primary/50";
    if (rate < 60) return "bg-primary/60";
    if (rate < 70) return "bg-primary/70";
    if (rate < 80) return "bg-primary/80";
    return "bg-primary/90";
  };

  const getTextColor = (rate: number): string => {
    if (rate < 0) return "text-muted-foreground/50";
    if (rate < 50) return "text-foreground";
    return "text-primary-foreground";
  };

  // Limit to last 10 cohorts for display
  const displayCohorts = cohorts.slice(-10);

  return (
    <div className="space-y-6">
      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">
                Cohort
              </th>
              <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">
                Users
              </th>
              {retentionDays.map(day => (
                <th 
                  key={day} 
                  className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap"
                >
                  Day {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayCohorts.map((cohort) => (
              <tr key={cohort.cohort_date} className="border-b border-border/50 last:border-0">
                <td className="py-2 px-3 font-medium whitespace-nowrap">
                  {format(parseISO(cohort.cohort_date), "MMM d")}
                </td>
                <td className="py-2 px-3 text-center text-muted-foreground">
                  {cohort.cohort_size}
                </td>
                {retentionDays.map(day => {
                  const retention = cohort.retention.find(r => r.day === day);
                  const rate = retention?.rate ?? -1;
                  
                  return (
                    <td key={day} className="py-2 px-1">
                      <div 
                        className={`
                          flex items-center justify-center py-2 px-3 rounded-md
                          ${getRetentionColor(rate)}
                          ${getTextColor(rate)}
                          transition-colors
                        `}
                      >
                        {rate >= 0 ? `${rate}%` : "-"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Summary row */}
          <tfoot>
            <tr className="bg-muted/30">
              <td className="py-3 px-3 font-semibold">Average</td>
              <td className="py-3 px-3 text-center text-muted-foreground">-</td>
              {summary?.map(s => (
                <td key={s.day} className="py-3 px-1">
                  <div className={`
                    flex items-center justify-center py-2 px-3 rounded-md font-semibold
                    ${getRetentionColor(s.average_rate)}
                    ${getTextColor(s.average_rate)}
                  `}>
                    {s.average_rate}%
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Lower</span>
        <div className="flex gap-0.5">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(val => (
            <div 
              key={val}
              className={`w-6 h-4 rounded-sm bg-primary/${val}`}
              title={`${val}%`}
            />
          ))}
        </div>
        <span>Higher</span>
      </div>
    </div>
  );
}
