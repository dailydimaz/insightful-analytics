import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight, TrendingUp } from "lucide-react";
import { useRetentionCohorts } from "@/hooks/useRetention";
import { DateRange } from "@/hooks/useAnalytics";
import { Link } from "react-router-dom";

interface RetentionCardProps {
  siteId: string;
  dateRange: DateRange;
}

export function RetentionCard({ siteId, dateRange }: RetentionCardProps) {
  const { data, isLoading } = useRetentionCohorts(siteId, dateRange);

  const day1 = data?.summary?.find(s => s.day === 1)?.average_rate || 0;
  const day7 = data?.summary?.find(s => s.day === 7)?.average_rate || 0;
  const day30 = data?.summary?.find(s => s.day === 30)?.average_rate || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Retention
        </CardTitle>
        <Link to={`/dashboard/retention?siteId=${siteId}`}>
          <Button variant="ghost" size="sm">
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Retention Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Day 1</p>
              <p className="text-xl font-bold text-foreground">{day1}%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Day 7</p>
              <p className="text-xl font-bold text-foreground">{day7}%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Day 30</p>
              <p className="text-xl font-bold text-foreground">{day30}%</p>
            </div>
          </div>

          {/* Mini visualization */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${day7}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{day7}% week</span>
          </div>

          {data?.cohorts && data.cohorts.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Based on {data.cohorts.length} cohort{data.cohorts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
